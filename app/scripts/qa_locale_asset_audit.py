#!/home/dylan/pestsense-academy/.venv-media/bin/python
import argparse
import json
import os
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

import psycopg2
import requests
from bs4 import BeautifulSoup
from psycopg2.extras import RealDictCursor


DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://lms:change_this_password@127.0.0.1:5432/lms_platform",
)
OUT_DIR = Path("/home/dylan/pestsense-academy/qa/reviews")
PUBLIC_ROOT = Path("/home/dylan/pestsense-academy/app/public")
DEFAULT_LOCALES = ("fr", "es", "de")
BASE_URL = os.environ.get("DOGFOOD_BASE_URL", "http://127.0.0.1:3000")
HOST = os.environ.get("DOGFOOD_HOST", "academy.gannannet.com")
FLAGSHIP_COURSE_SLUGS = (
    "technician-getting-started",
    "pestsense-initial-setup-guide",
    "rodenticides-for-baited-devices",
    "conducting-a-site-visit",
    "pestsense-site-servicing-guide",
    "gateway-basics",
    "predictor-quick-starter-guide",
    "pestsense-new-site-installation-guide",
)
EXPECTED_VIDEO_LESSON_SLUGS = {
    "add-and-assign-company-products",
    "add-rodenticides-to-company-products",
    "unboxing-r3000-lg-gateway",
    "connecting-antennas-and-power",
    "installing-sim-card-r3000-lg",
    "powering-on-reading-leds",
    "switching-bait-to-snap-trap",
}
EXPECTED_LOCALIZED_IMAGE_HINTS = (
    "/uploads/academy-guides/",
    "/course-guides/product/",
    "/course-guides/rodenticide/",
    "/course-guides/screens-live-map.jpg",
    "/course-guides/screens-hierarchy.jpg",
)


def scope_clause(scope: str):
    if scope == "all":
        return "c.status = 'PUBLISHED' and l.status = 'PUBLISHED'", []
    return "c.slug = any(%s) and c.status = 'PUBLISHED' and l.status = 'PUBLISHED'", [list(FLAGSHIP_COURSE_SLUGS)]


def is_local_asset(path: str):
    return path and path.startswith("/")


def expected_locale_path(path: str, locale: str):
    return f"/i18n/{locale}/" in path or f"/{locale}-" in path or f"/{locale}/" in path


def expects_localized_image(path: str):
    return any(hint in path for hint in EXPECTED_LOCALIZED_IMAGE_HINTS)


def audit_http(path: str):
    response = requests.get(
        f"{BASE_URL}{path}",
        headers={"Host": HOST},
        timeout=30,
        stream=True,
        allow_redirects=True,
    )
    status = response.status_code
    response.close()
    return status


def fetch_rows(cur, scope, locales):
    clause, params = scope_clause(scope)
    cur.execute(
        f'''
        select
          c.slug as course_slug,
          l.id as lesson_id,
          l.slug as lesson_slug,
          ll.locale::text as locale,
          ll.title,
          ll.content,
          l."videoUrl" as base_video_url,
          ll."videoUrl",
          ll."subtitleUrl"
        from "LessonLocale" ll
        join "Lesson" l on l.id = ll."lessonId"
        join "Module" m on m.id = l."moduleId"
        join "Course" c on c.id = m."courseId"
        where ll.status = 'PUBLISHED'
          and ll.locale::text = any(%s)
          and {clause}
        order by c."sortOrder", m."sortOrder", l."sortOrder", ll.locale
        ''',
        [list(locales)] + params,
    )
    return cur.fetchall()


def run_audit(scope: str, locales):
    conn = psycopg2.connect(DB_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            rows = fetch_rows(cur, scope, locales)
    finally:
        conn.close()

    lesson_results = []
    summary = {
        "scope": scope,
        "locales": list(locales),
        "lesson_locales_checked": 0,
        "assets_checked": 0,
        "issues": 0,
        "issues_by_locale": defaultdict(int),
        "issue_breakdown": Counter(),
    }

    for row in rows:
        summary["lesson_locales_checked"] += 1
        lesson_issues = []
        asset_results = []
        soup = BeautifulSoup(row["content"] or "", "html.parser")

        for img in soup.find_all("img"):
            src = img.get("src") or ""
            issues = []
            if not src:
                issues.append("missing_img_src")
            elif is_local_asset(src):
                if not src.startswith("/uploads/"):
                    local_path = PUBLIC_ROOT / src.lstrip("/")
                    if not local_path.exists():
                        issues.append("img_file_missing")
                    else:
                        summary["assets_checked"] += 1
                http_status = audit_http(src)
                if http_status != 200:
                    issues.append(f"img_http_{http_status}")
                if row["locale"] != "en" and expects_localized_image(src) and not expected_locale_path(src, row["locale"]):
                    issues.append("img_not_locale_specific")
            asset_results.append({"kind": "img", "path": src, "issues": issues})
            lesson_issues.extend(issues)

        for kind, field in (("video", "videoUrl"), ("subtitle", "subtitleUrl")):
            path = row[field]
            issues = []
            expected_for_lesson = row["lesson_slug"] in EXPECTED_VIDEO_LESSON_SLUGS or bool(row["base_video_url"])
            if not path and expected_for_lesson:
                issues.append(f"missing_{kind}_url")
            elif is_local_asset(path):
                local_path = PUBLIC_ROOT / path.lstrip("/")
                if not local_path.exists():
                    issues.append(f"{kind}_file_missing")
                else:
                    summary["assets_checked"] += 1
                http_status = audit_http(path)
                if http_status != 200:
                    issues.append(f"{kind}_http_{http_status}")
                if row["locale"] != "en" and not expected_locale_path(path, row["locale"]):
                    issues.append(f"{kind}_not_locale_specific")
            asset_results.append({"kind": kind, "path": path, "issues": issues})
            lesson_issues.extend(issues)

        if lesson_issues:
            summary["issues"] += len(lesson_issues)
            summary["issues_by_locale"][row["locale"]] += len(lesson_issues)
            summary["issue_breakdown"].update(lesson_issues)

        lesson_results.append(
            {
                "locale": row["locale"],
                "course_slug": row["course_slug"],
                "lesson_id": row["lesson_id"],
                "lesson_slug": row["lesson_slug"],
                "title": row["title"],
                "issues": lesson_issues,
                "assets": asset_results,
            }
        )

    summary["issues_by_locale"] = dict(summary["issues_by_locale"])
    summary["issue_breakdown"] = dict(summary["issue_breakdown"])
    return {"summary": summary, "lessons": lesson_results}


def write_reports(payload, prefix: str):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = OUT_DIR / f"{prefix}-locale-asset-audit.json"
    md_path = OUT_DIR / f"{prefix}-locale-asset-audit.md"
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = [
        "# Locale Asset Audit",
        "",
        f"- Ran at: {datetime.now().isoformat()}",
        f"- Scope: `{payload['summary']['scope']}`",
        f"- Lesson locale rows checked: `{payload['summary']['lesson_locales_checked']}`",
        f"- Assets checked: `{payload['summary']['assets_checked']}`",
        f"- Total issues: `{payload['summary']['issues']}`",
        "",
        "## Issues By Locale",
        "",
    ]
    for locale, count in payload["summary"]["issues_by_locale"].items():
        lines.append(f"- `{locale}`: `{count}`")
    if not payload["summary"]["issues_by_locale"]:
        lines.append("- None")

    lines.extend(["", "## Top Issue Types", ""])
    for issue, count in sorted(payload["summary"]["issue_breakdown"].items(), key=lambda item: (-item[1], item[0])):
        lines.append(f"- `{issue}`: `{count}`")
    if not payload["summary"]["issue_breakdown"]:
        lines.append("- None")

    lines.extend(["", "## Failing Lessons", ""])
    failing = [row for row in payload["lessons"] if row["issues"]]
    if not failing:
        lines.append("- None")
    else:
        for row in failing:
            lines.append(
                f"- `{row['locale']}` `{row['course_slug']}` / `{row['lesson_slug']}`: "
                + ", ".join(f"`{issue}`" for issue in row["issues"])
            )

    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return json_path, md_path


def parse_args():
    parser = argparse.ArgumentParser(description="Audit localized lesson assets and media paths.")
    parser.add_argument("--scope", choices=("flagship", "all"), default="flagship")
    parser.add_argument("--locales", nargs="+", default=list(DEFAULT_LOCALES))
    parser.add_argument("--prefix", default=datetime.now().strftime("%Y-%m-%d-%H%M"))
    return parser.parse_args()


def main():
    args = parse_args()
    payload = run_audit(args.scope, tuple(args.locales))
    json_path, md_path = write_reports(payload, args.prefix)
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "summary": payload["summary"]}, indent=2))


if __name__ == "__main__":
    main()

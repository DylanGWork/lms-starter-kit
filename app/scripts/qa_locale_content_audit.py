#!/home/dylan/pestsense-academy/.venv-media/bin/python
import argparse
import json
import os
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor


DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://lms:change_this_password@127.0.0.1:5432/lms_platform",
)
OUT_DIR = Path("/home/dylan/pestsense-academy/qa/reviews")
DEFAULT_LOCALES = ("fr", "es", "de")
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
ENGLISH_MARKERS = (
    "What This Lesson Solves",
    "Where To Do This",
    "Short Walkthrough Video",
    "Step 1:",
    "Step 2:",
    "Step 3:",
    "Step 4:",
    "Step 5:",
    "Mark this lesson complete",
    "Completed reading? Tick it off to track your progress.",
)


def scope_clause(scope: str):
    if scope == "all":
        return "c.status = 'PUBLISHED' and l.status = 'PUBLISHED'", []
    return "c.slug = any(%s) and c.status = 'PUBLISHED' and l.status = 'PUBLISHED'", [list(FLAGSHIP_COURSE_SLUGS)]


def normalize(value):
    return (value or "").strip()


def stale_checks(base_title, base_summary, base_content, row):
    localized_title = normalize(row.get("localized_title"))
    localized_summary = normalize(row.get("localized_summary"))
    localized_content = normalize(row.get("localized_content"))

    checks = []
    if not localized_title:
        checks.append("missing_title")
    elif localized_title == normalize(base_title):
        checks.append("english_title")

    if not localized_summary and normalize(base_summary):
        checks.append("missing_summary")
    elif normalize(base_summary) and localized_summary == normalize(base_summary):
        checks.append("english_summary")

    if not localized_content:
        checks.append("missing_content")
    else:
        if normalize(base_content) and localized_content == normalize(base_content):
            checks.append("english_content")
        for marker in ENGLISH_MARKERS:
            if marker in localized_content:
                checks.append(f"english_marker:{marker}")
                break

    return checks


def fetch_audit_rows(cur, locale, scope):
    clause, params = scope_clause(scope)
    cur.execute(
        f'''
        select
          c.slug as course_slug,
          c.title as course_title,
          m.title as module_title,
          l.id as lesson_id,
          l.slug as lesson_slug,
          l.title as base_title,
          l.summary as base_summary,
          l.content as base_content,
          ll.id as locale_row_id,
          ll.title as localized_title,
          ll.summary as localized_summary,
          ll.content as localized_content,
          ll.status::text as localized_status
        from "Lesson" l
        join "Module" m on m.id = l."moduleId"
        join "Course" c on c.id = m."courseId"
        left join "LessonLocale" ll
          on ll."lessonId" = l.id
         and ll.locale = %s
         and ll.status = 'PUBLISHED'
        where {clause}
        order by c."sortOrder", m."sortOrder", l."sortOrder", l.id
        ''',
        [locale] + params,
    )
    return cur.fetchall()


def run_audit(scope: str, locales):
    results = []
    summary = {
        "scope": scope,
        "locales": list(locales),
        "lessons_checked": 0,
        "missing_locale_rows": 0,
        "issues": 0,
        "issues_by_locale": defaultdict(int),
        "issue_breakdown": Counter(),
    }

    conn = psycopg2.connect(DB_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            for locale in locales:
                rows = fetch_audit_rows(cur, locale, scope)
                for row in rows:
                    summary["lessons_checked"] += 1
                    issues = []
                    if not row["locale_row_id"]:
                        issues.append("missing_locale_row")
                        summary["missing_locale_rows"] += 1
                    else:
                        issues.extend(
                            stale_checks(
                                row["base_title"],
                                row["base_summary"],
                                row["base_content"],
                                row,
                            )
                        )

                    severity = "ok"
                    if issues:
                        severity = "critical" if any(
                            issue in {"missing_locale_row", "missing_content", "english_content", "english_title"}
                            or issue.startswith("english_marker:")
                            for issue in issues
                        ) else "warning"

                    if issues:
                        summary["issues"] += len(issues)
                        summary["issues_by_locale"][locale] += len(issues)
                        summary["issue_breakdown"].update(issues)

                    results.append(
                        {
                            "locale": locale,
                            "course_slug": row["course_slug"],
                            "course_title": row["course_title"],
                            "module_title": row["module_title"],
                            "lesson_id": row["lesson_id"],
                            "lesson_slug": row["lesson_slug"],
                            "severity": severity,
                            "issues": issues,
                            "title": row["localized_title"],
                        }
                    )
    finally:
        conn.close()

    summary["issues_by_locale"] = dict(summary["issues_by_locale"])
    summary["issue_breakdown"] = dict(summary["issue_breakdown"])
    return {"summary": summary, "lessons": results}


def write_reports(payload, prefix: str):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = OUT_DIR / f"{prefix}-locale-content-audit.json"
    md_path = OUT_DIR / f"{prefix}-locale-content-audit.md"
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = [
        "# Locale Content Audit",
        "",
        f"- Ran at: {datetime.now().isoformat()}",
        f"- Scope: `{payload['summary']['scope']}`",
        f"- Locales: `{', '.join(payload['summary']['locales'])}`",
        f"- Lessons checked: `{payload['summary']['lessons_checked']}`",
        f"- Missing locale rows: `{payload['summary']['missing_locale_rows']}`",
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
    parser = argparse.ArgumentParser(description="Audit lesson locale content coverage and stale English leakage.")
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

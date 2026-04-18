#!/home/dylan/pestsense-academy/.venv-media/bin/python
import json
import os
from datetime import datetime
from pathlib import Path

import psycopg2
import requests
from psycopg2.extras import RealDictCursor


DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://lms:change_this_password@127.0.0.1:5432/lms_platform",
)
BASE_URL = os.environ.get("DOGFOOD_BASE_URL", "http://127.0.0.1:3000")
HOST = os.environ.get("DOGFOOD_HOST", "academy.gannannet.com")
EMAIL = os.environ.get("DOGFOOD_EMAIL", "rob.burley-jukes@pestsense.com")
PASSWORD = os.environ.get("DOGFOOD_PASSWORD", "RobGuide!26")
LOCALES = ("en", "fr", "es", "de")
OUT_DIR = Path("/home/dylan/pestsense-academy/qa/reviews")
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
VIDEO_LESSON_SLUGS = (
    "add-and-assign-company-products",
    "add-rodenticides-to-company-products",
    "unboxing-r3000-lg-gateway",
    "connecting-antennas-and-power",
    "installing-sim-card-r3000-lg",
    "powering-on-reading-leds",
    "switching-bait-to-snap-trap",
)

ENGLISH_LEAKS = {
    "fr": [
        "Good morning",
        "Continue latest lesson",
        "Browse Academy",
        "Mark this lesson complete",
        "Completed reading? Tick it off to track your progress.",
        "Quick actions",
        "Risk management",
    ],
    "es": [
        "Good morning",
        "Continue latest lesson",
        "Browse Academy",
        "Mark this lesson complete",
        "Completed reading? Tick it off to track your progress.",
        "Quick actions",
        "Risk management",
    ],
    "de": [
        "Good morning",
        "Continue latest lesson",
        "Browse Academy",
        "Mark this lesson complete",
        "Completed reading? Tick it off to track your progress.",
        "Quick actions",
        "Risk management",
    ],
}


def db_rows(query, params=None):
    conn = psycopg2.connect(DB_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query, params or ())
            return cur.fetchall()
    finally:
        conn.close()


def db_value(query, params=None):
    conn = psycopg2.connect(DB_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(query, params or ())
            row = cur.fetchone()
            return row[0] if row else None
    finally:
        conn.close()


def login(session):
    headers = {"Host": HOST}
    csrf = session.get(f"{BASE_URL}/api/auth/csrf", headers=headers, timeout=30).json()["csrfToken"]
    response = session.post(
        f"{BASE_URL}/api/auth/callback/credentials",
        headers={**headers, "Content-Type": "application/x-www-form-urlencoded"},
        data={
            "csrfToken": csrf,
            "email": EMAIL,
            "password": PASSWORD,
            "callbackUrl": f"https://{HOST}/en/dashboard",
            "json": "true",
        },
        timeout=30,
    )
    response.raise_for_status()


def fetch(session, path):
    response = session.get(f"{BASE_URL}{path}", headers={"Host": HOST}, timeout=45)
    return response.status_code, response.text


def fetch_asset(session, path):
    response = session.get(
        f"{BASE_URL}{path}",
        headers={"Host": HOST},
        timeout=45,
        stream=True,
        allow_redirects=True,
    )
    status = response.status_code
    response.close()
    return status


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    role = db_value('select role::text from "User" where email = %s', (EMAIL,))
    if not role:
        raise RuntimeError(f"Dogfood user not found for {EMAIL}")

    courses = db_rows(
        '''
        select c.slug as course_slug, cat.slug as category_slug
        from "Course" c
        join "Category" cat on cat.id = c."categoryId"
        where c.slug = any(%s)
          and c.status = 'PUBLISHED'
        order by cat."sortOrder", c."sortOrder"
        ''',
        (list(FLAGSHIP_COURSE_SLUGS),),
    )
    lessons = db_rows(
        '''
        select l.id, l.slug, c.slug as course_slug
        from "Lesson" l
        join "Module" m on m.id = l."moduleId"
        join "Course" c on c.id = m."courseId"
        where c.slug = any(%s)
          and c.status = 'PUBLISHED'
          and l.status = 'PUBLISHED'
        order by c."sortOrder", m."sortOrder", l."sortOrder"
        ''',
        (list(FLAGSHIP_COURSE_SLUGS),),
    )
    lesson_locale_rows = {
        (row["lessonId"], row["locale"])
        for row in db_rows(
            '''
            select "lessonId", locale::text as locale
            from "LessonLocale"
            where status = 'PUBLISHED'
            ''',
        )
    }

    video_rows = db_rows(
        '''
        select l.slug as lesson_slug,
               ll.locale::text as locale,
               ll."videoUrl",
               ll."subtitleUrl"
        from "Lesson" l
        join "LessonLocale" ll on ll."lessonId" = l.id
        where l.slug = any(%s)
          and ll.status = 'PUBLISHED'
        order by l.slug, ll.locale
        ''',
        (list(VIDEO_LESSON_SLUGS),),
    )

    session = requests.Session()
    login(session)

    page_checks = []
    media_checks = []
    summary = {"pages_checked": 0, "media_checked": 0, "issues": 0}

    paths = ["/dashboard", "/learn", "/search", "/tools/signal-simulator"]
    for course in courses:
        paths.append(f"/learn/{course['category_slug']}/{course['course_slug']}")
    for lesson in lessons:
        paths.append(f"/lessons/{lesson['id']}")

    for locale in LOCALES:
        for path in paths:
            status, html = fetch(session, f"/{locale}{path}")
            issues = []
            if status != 200:
                issues.append(f"HTTP {status}")
            if locale != "en":
                if path.startswith("/lessons/"):
                    lesson_id = path.rsplit("/", 1)[-1]
                    if (lesson_id, locale) not in lesson_locale_rows:
                        issues.append("Missing published locale row")
                for leak in ENGLISH_LEAKS[locale]:
                    if leak in html:
                        issues.append(f"English leak: {leak}")
            page_checks.append({"locale": locale, "path": path, "issues": issues})
            summary["pages_checked"] += 1
            summary["issues"] += len(issues)

    for row in video_rows:
        issues = []
        if row["videoUrl"]:
            video_status = fetch_asset(session, row["videoUrl"])
            if video_status != 200:
                issues.append(f"Video asset HTTP {video_status}")
            elif row["locale"] != "en" and f"/{row['locale']}-dubbed.mp4" not in row["videoUrl"]:
                issues.append("Video asset does not point at locale-specific dub")
        else:
            if row["locale"] != "en":
                issues.append("Missing locale videoUrl")

        if row["subtitleUrl"]:
            subtitle_status = fetch_asset(session, row["subtitleUrl"])
            if subtitle_status != 200:
                issues.append(f"Subtitle asset HTTP {subtitle_status}")
            elif row["locale"] != "en" and f"/{row['locale']}-subtitles.vtt" not in row["subtitleUrl"]:
                issues.append("Subtitle asset does not point at locale-specific VTT")
        else:
            issues.append("Missing subtitleUrl")

        media_checks.append(
            {
                "lesson_slug": row["lesson_slug"],
                "locale": row["locale"],
                "video_url": row["videoUrl"],
                "subtitle_url": row["subtitleUrl"],
                "issues": issues,
            }
        )
        summary["media_checked"] += 1
        summary["issues"] += len(issues)

    timestamp = datetime.now().strftime("%Y-%m-%d-%H%M")
    md_path = OUT_DIR / f"{timestamp}-flagship-multilingual-dogfood.md"
    json_path = OUT_DIR / f"{timestamp}-flagship-multilingual-dogfood.json"

    payload = {
        "ran_at": datetime.now().isoformat(),
        "summary": summary,
        "page_checks": page_checks,
        "media_checks": media_checks,
    }
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        "# Flagship Multilingual Dogfood Review",
        "",
        f"- Run at: {payload['ran_at']}",
        f"- Pages checked: {summary['pages_checked']}",
        f"- Media checks: {summary['media_checked']}",
        f"- Issues found: {summary['issues']}",
        "",
        "## Page Checks",
        "",
    ]
    for item in page_checks:
        status = "PASS" if not item["issues"] else "ISSUES"
        lines.append(f"- [{status}] `{item['locale']}{item['path']}`")
        for issue in item["issues"]:
            lines.append(f"  - {issue}")

    lines.extend(["", "## Media Checks", ""])
    for item in media_checks:
        status = "PASS" if not item["issues"] else "ISSUES"
        lines.append(f"- [{status}] `{item['locale']}` `{item['lesson_slug']}`")
        lines.append(f"  - video: `{item['video_url'] or ''}`")
        lines.append(f"  - subtitles: `{item['subtitle_url'] or ''}`")
        for issue in item["issues"]:
            lines.append(f"  - {issue}")

    md_path.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"report_md": str(md_path), "report_json": str(json_path), **summary}, indent=2))


if __name__ == "__main__":
    main()

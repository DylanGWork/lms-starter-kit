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

ENGLISH_LEAKS = [
    "Good morning",
    "Fresh start",
    "Risk management",
    "Continue learning",
    "Quick actions",
    "Mark this lesson complete",
    "Completed reading? Tick it off to track your progress.",
]


def db_rows(query):
    conn = psycopg2.connect(DB_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(query)
            return cur.fetchall()
    finally:
        conn.close()


def db_value(query, params):
    conn = psycopg2.connect(DB_URL)
    try:
        with conn.cursor() as cur:
            cur.execute(query, params)
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
            "callbackUrl": f"http://{HOST}/en/dashboard",
            "json": "true",
        },
        timeout=30,
    )
    response.raise_for_status()


def fetch(session, path):
    response = session.get(f"{BASE_URL}{path}", headers={"Host": HOST}, timeout=45)
    return response.status_code, response.text


def main():
    role = db_value('select role::text from "User" where email = %s', (EMAIL,))
    if not role:
        raise RuntimeError(f"Dogfood user not found for {EMAIL}")

    courses = db_rows(
        f'''
        select c.slug as course_slug, cat.slug as category_slug
        from "Course" c
        join "Category" cat on cat.id = c."categoryId"
        join "CourseRole" cr on cr."courseId" = c.id
        where c.status = 'PUBLISHED'
          and cr.role = '{role}'
        order by cat."sortOrder", c."sortOrder"
        '''
    )
    lessons = db_rows(
        f'''
        select l.id, l.slug, l."videoUrl"
        from "Lesson" l
        join "Module" m on m.id = l."moduleId"
        join "Course" c on c.id = m."courseId"
        join "CourseRole" cr on cr."courseId" = c.id
        where l.status = 'PUBLISHED'
          and c.status = 'PUBLISHED'
          and cr.role = '{role}'
        order by l.id
        '''
    )
    localized_lesson_rows = {
        (row["lessonId"], row["locale"])
        for row in db_rows(
            '''
            select "lessonId", locale::text as locale
            from "LessonLocale"
            where status = 'PUBLISHED'
            '''
        )
    }

    session = requests.Session()
    login(session)

    report = []
    summary = {"pages_checked": 0, "video_pages_checked": 0, "issues": 0}

    core_paths = ["/dashboard", "/learn", "/search", "/tools/signal-simulator"]
    for course in courses:
        core_paths.append(f"/learn/{course['category_slug']}/{course['course_slug']}")
    for lesson in lessons:
        core_paths.append(f"/lessons/{lesson['id']}")

    for locale in LOCALES:
        for path in core_paths:
            status, html = fetch(session, f"/{locale}{path}")
            issues = []
            if status != 200:
                issues.append(f"HTTP {status}")
            if locale != "en":
                if "/lessons/" in path:
                    lesson_id = path.rsplit("/", 1)[-1]
                    if (lesson_id, locale) not in localized_lesson_rows:
                        issues.append("Missing published locale content row")
                for leak in ENGLISH_LEAKS:
                    if leak in html:
                        issues.append(f"English leak: {leak}")
            if "/lessons/" in path and any(lesson["id"] in path for lesson in lessons):
                summary["video_pages_checked"] += 1
            report.append({"locale": locale, "path": path, "issues": issues})
            summary["pages_checked"] += 1
            summary["issues"] += len(issues)

    # Media-specific checks
    video_checks = []
    for lesson in lessons:
        if not lesson["videoUrl"]:
            continue
        for locale in LOCALES:
            status, html = fetch(session, f"/{locale}/lessons/{lesson['id']}")
            issues = []
            if locale == "en":
                if "en-subtitles.vtt" not in html:
                    issues.append("Missing English subtitle track")
            else:
                if f"{locale}-subtitles.vtt" not in html:
                    issues.append(f"Missing {locale} subtitle track")
                if f"{locale}-dubbed.mp4" not in html:
                    issues.append(f"Missing {locale} dubbed video")
            video_checks.append({"locale": locale, "lesson": lesson["slug"], "issues": issues})
            summary["issues"] += len(issues)

    timestamp = datetime.now().strftime("%Y-%m-%d-%H%M")
    out_path = OUT_DIR / f"{timestamp}-multilingual-dogfood.md"
    lines = [
        "# Multilingual Dogfood Review",
        "",
        f"- Run at: {datetime.now().isoformat()}",
        f"- Pages checked: {summary['pages_checked']}",
        f"- Video lesson checks: {len(video_checks)}",
        f"- Issues found: {summary['issues']}",
        "",
        "## Page Checks",
        "",
    ]

    for item in report:
        status = "PASS" if not item["issues"] else "ISSUES"
        lines.append(f"- [{status}] `{item['locale']}{item['path']}`")
        for issue in item["issues"]:
            lines.append(f"  - {issue}")

    lines.extend(["", "## Video Checks", ""])
    for item in video_checks:
        status = "PASS" if not item["issues"] else "ISSUES"
        lines.append(f"- [{status}] `{item['locale']}` `{item['lesson']}`")
        for issue in item["issues"]:
            lines.append(f"  - {issue}")

    out_path.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"report": str(out_path), **summary}, indent=2))


if __name__ == "__main__":
    main()

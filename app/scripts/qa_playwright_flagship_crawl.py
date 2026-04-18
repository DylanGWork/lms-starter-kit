#!/home/dylan/pestsense-academy/.venv-media/bin/python
import argparse
import json
import os
from datetime import datetime
from pathlib import Path

import psycopg2
import requests
from psycopg2.extras import RealDictCursor

try:
    from playwright.sync_api import sync_playwright
except Exception:  # pragma: no cover - graceful runtime fallback
    sync_playwright = None


DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://lms:change_this_password@127.0.0.1:5432/lms_platform",
)
BASE_URL = os.environ.get("DOGFOOD_BASE_URL", "http://127.0.0.1:3000")
EMAIL = os.environ.get("DOGFOOD_EMAIL", "rob.burley-jukes@pestsense.com")
PASSWORD = os.environ.get("DOGFOOD_PASSWORD", "RobGuide!26")
OUT_DIR = Path("/home/dylan/pestsense-academy/qa/reviews")
SHOT_DIR = Path("/home/dylan/pestsense-academy/qa/screenshots")
LOCALES = ("en", "fr", "es", "de")
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
ENGLISH_LEAKS = {
    "fr": [
        "Good morning",
        "Continue latest lesson",
        "Browse Academy",
        "Mark this lesson complete",
        "Completed reading? Tick it off to track your progress.",
    ],
    "es": [
        "Good morning",
        "Continue latest lesson",
        "Browse Academy",
        "Mark this lesson complete",
        "Completed reading? Tick it off to track your progress.",
    ],
    "de": [
        "Good morning",
        "Continue latest lesson",
        "Browse Academy",
        "Mark this lesson complete",
        "Completed reading? Tick it off to track your progress.",
    ],
}


def fetch_paths():
    conn = psycopg2.connect(DB_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('select role::text as role from "User" where email = %s', (EMAIL,))
            user_row = cur.fetchone()
            if not user_row:
                raise RuntimeError(f"Dogfood user not found: {EMAIL}")
            role = user_row["role"]

            cur.execute(
                '''
                select c.slug as course_slug, cat.slug as category_slug
                from "Course" c
                join "Category" cat on cat.id = c."categoryId"
                join "CourseRole" cr on cr."courseId" = c.id
                where c.slug = any(%s)
                  and c.status = 'PUBLISHED'
                  and cr.role::text = %s
                order by cat."sortOrder", c."sortOrder"
                ''',
                (list(FLAGSHIP_COURSE_SLUGS), role),
            )
            courses = cur.fetchall()

            cur.execute(
                '''
                select l.id, l.slug
                from "Lesson" l
                join "Module" m on m.id = l."moduleId"
                join "Course" c on c.id = m."courseId"
                join "CourseRole" cr on cr."courseId" = c.id
                where c.slug = any(%s)
                  and c.status = 'PUBLISHED'
                  and l.status = 'PUBLISHED'
                  and cr.role::text = %s
                order by c."sortOrder", m."sortOrder", l."sortOrder"
                ''',
                (list(FLAGSHIP_COURSE_SLUGS), role),
            )
            lessons = cur.fetchall()
    finally:
        conn.close()

    paths = ["/dashboard", "/learn", "/search", "/tools/signal-simulator"]
    for course in courses:
        paths.append(f"/learn/{course['category_slug']}/{course['course_slug']}")
    for lesson in lessons:
        paths.append(f"/lessons/{lesson['id']}")
    return paths

def authenticated_cookies():
    session = requests.Session()
    csrf = session.get(f"{BASE_URL}/api/auth/csrf", timeout=30).json()["csrfToken"]
    response = session.post(
        f"{BASE_URL}/api/auth/callback/credentials",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        data={
            "csrfToken": csrf,
            "email": EMAIL,
            "password": PASSWORD,
            "callbackUrl": f"{BASE_URL}/en/dashboard",
            "json": "true",
        },
        timeout=30,
        allow_redirects=True,
    )
    response.raise_for_status()
    cookie_url = BASE_URL
    cookies = []
    for cookie in session.cookies:
        cookies.append(
            {
                "name": cookie.name,
                "value": cookie.value,
                "url": cookie_url,
            }
        )
    return cookies


def crawl(prefix: str):
    if sync_playwright is None:
        payload = {
            "ran_at": datetime.now().isoformat(),
            "summary": {"status": "skipped", "reason": "playwright_not_installed"},
            "pages": [],
        }
        return payload

    SHOT_DIR.mkdir(parents=True, exist_ok=True)
    paths = fetch_paths()
    results = []
    summary = {"status": "ok", "pages_checked": 0, "issues": 0, "screenshots": 0}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 1100})
        context.add_cookies(authenticated_cookies())
        page = context.new_page()
        page.set_default_timeout(20000)
        page.goto(f"{BASE_URL}/en/dashboard", wait_until="domcontentloaded")
        page.wait_for_timeout(1200)

        for locale in LOCALES:
            for path in paths:
                full_url = f"{BASE_URL}/{locale}{path}"
                response = page.goto(full_url, wait_until="domcontentloaded")
                page.wait_for_timeout(1200)
                text = page.locator("body").inner_text()
                broken_images = page.evaluate(
                    """
                    () => Array.from(document.images)
                      .filter((img) => !img.complete || img.naturalWidth === 0)
                      .map((img) => img.getAttribute('src') || '')
                    """
                )

                issues = []
                status = response.status if response else 0
                if status != 200:
                    issues.append(f"http_{status}")
                if broken_images:
                    issues.append("broken_images")
                if locale != "en":
                    for leak in ENGLISH_LEAKS[locale]:
                        if leak in text:
                            issues.append(f"english_leak:{leak}")

                screenshot_path = None
                if issues:
                    SHOT_DIR.mkdir(parents=True, exist_ok=True)
                    shot_name = f"{prefix}-{locale}-{path.strip('/').replace('/', '__') or 'root'}.png"
                    screenshot_path = SHOT_DIR / shot_name
                    page.screenshot(path=str(screenshot_path), full_page=True)
                    summary["screenshots"] += 1

                results.append(
                    {
                        "locale": locale,
                        "path": path,
                        "url": full_url,
                        "status": status,
                        "broken_images": broken_images,
                        "issues": issues,
                        "screenshot": str(screenshot_path) if screenshot_path else None,
                    }
                )
                summary["pages_checked"] += 1
                summary["issues"] += len(issues)

        browser.close()

    return {"ran_at": datetime.now().isoformat(), "summary": summary, "pages": results}


def write_reports(payload, prefix: str):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    json_path = OUT_DIR / f"{prefix}-playwright-flagship-crawl.json"
    md_path = OUT_DIR / f"{prefix}-playwright-flagship-crawl.md"
    json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    lines = [
        "# Playwright Flagship Crawl",
        "",
        f"- Ran at: {payload['ran_at']}",
        f"- Status: `{payload['summary']['status']}`",
    ]
    if payload["summary"]["status"] == "skipped":
        lines.append(f"- Reason: `{payload['summary']['reason']}`")
    else:
        lines.extend(
            [
                f"- Pages checked: `{payload['summary']['pages_checked']}`",
                f"- Total issues: `{payload['summary']['issues']}`",
                f"- Screenshots captured: `{payload['summary']['screenshots']}`",
            ]
        )
    lines.extend(["", "## Failing Pages", ""])
    failing = [row for row in payload["pages"] if row["issues"]]
    if not failing:
        lines.append("- None")
    else:
        for row in failing:
            lines.append(
                f"- `{row['locale']}` `{row['path']}`: "
                + ", ".join(f"`{issue}`" for issue in row["issues"])
                + (f" · screenshot `{row['screenshot']}`" if row["screenshot"] else "")
            )
    md_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    return json_path, md_path


def parse_args():
    parser = argparse.ArgumentParser(description="Run a Playwright browser crawl across flagship localized pages.")
    parser.add_argument("--prefix", default=datetime.now().strftime("%Y-%m-%d-%H%M"))
    return parser.parse_args()


def main():
    args = parse_args()
    payload = crawl(args.prefix)
    json_path, md_path = write_reports(payload, args.prefix)
    print(json.dumps({"json": str(json_path), "markdown": str(md_path), "summary": payload["summary"]}, indent=2))


if __name__ == "__main__":
    main()

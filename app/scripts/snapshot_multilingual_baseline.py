#!/home/dylan/pestsense-academy/.venv-media/bin/python
import argparse
import json
import os
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor


DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://lms:change_this_password@127.0.0.1:5432/lms_platform",
)
ROOT = Path("/home/dylan/pestsense-academy")
APP_ROOT = ROOT / "app"
OUT_DIR = ROOT / "qa" / "reviews"
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
VIDEO_FAMILY_SLUGS = (
    "add-and-assign-company-products",
    "add-rodenticides-to-company-products",
    "unboxing-r3000-lg-gateway",
    "connecting-antennas-and-power",
    "installing-sim-card-r3000-lg",
    "powering-on-reading-leds",
    "switching-bait-to-snap-trap",
)


def query_rows(cur, sql, params=None):
    cur.execute(sql, params or ())
    return cur.fetchall()


def query_value(cur, sql, params=None):
    cur.execute(sql, params or ())
    row = cur.fetchone()
    if not row:
        return None
    if isinstance(row, dict):
        return next(iter(row.values()))
    return row[0]


def locale_counts(cur, table_name):
    rows = query_rows(
        cur,
        f'''
        select locale::text as locale, count(*) as count
        from "{table_name}"
        where status = 'PUBLISHED'
        group by locale
        order by locale
        ''',
    )
    return {row["locale"]: row["count"] for row in rows}


def count_files(path: Path):
    if not path.exists():
        return 0
    return sum(1 for item in path.rglob("*") if item.is_file())


def media_inventory(cur):
    rows = query_rows(
        cur,
        '''
        select c.slug as course_slug,
               l.slug as lesson_slug,
               ll.locale::text as locale,
               ll."videoUrl",
               ll."subtitleUrl"
        from "LessonLocale" ll
        join "Lesson" l on l.id = ll."lessonId"
        join "Module" m on m.id = l."moduleId"
        join "Course" c on c.id = m."courseId"
        where ll.status = 'PUBLISHED'
          and (ll."videoUrl" is not null or ll."subtitleUrl" is not null)
        order by c.slug, l.slug, ll.locale
        ''',
    )
    return rows


def flagship_missing(cur):
    by_locale = {}
    for locale in ("fr", "es", "de"):
        rows = query_rows(
            cur,
            '''
            select c.slug,
                   count(*) filter (where ll.id is null) as missing_lessons,
                   count(*) as total_lessons
            from "Lesson" l
            join "Module" m on m.id = l."moduleId"
            join "Course" c on c.id = m."courseId"
            left join "LessonLocale" ll
              on ll."lessonId" = l.id
             and ll.locale = %s
             and ll.status = 'PUBLISHED'
            where c.slug = any(%s)
              and c.status = 'PUBLISHED'
              and l.status = 'PUBLISHED'
            group by c.slug
            order by c.slug
            ''',
            (locale, list(FLAGSHIP_COURSE_SLUGS)),
        )
        by_locale[locale] = {
            row["slug"]: {
                "missing_lessons": int(row["missing_lessons"]),
                "total_lessons": int(row["total_lessons"]),
            }
            for row in rows
        }
    return by_locale


def flagship_video_rows(cur):
    rows = query_rows(
        cur,
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
        (list(VIDEO_FAMILY_SLUGS),),
    )
    grouped = defaultdict(list)
    for row in rows:
        grouped[row["lesson_slug"]].append(
            {
                "locale": row["locale"],
                "video_url": row["videoUrl"],
                "subtitle_url": row["subtitleUrl"],
            }
        )
    return grouped


def build_snapshot(label: str):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    now = datetime.now()
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            published_counts = {
                "categories": query_value(cur, 'select count(*) from "Category" where status = \'PUBLISHED\''),
                "courses": query_value(cur, 'select count(*) from "Course" where status = \'PUBLISHED\''),
                "modules": query_value(cur, 'select count(*) from "Module"'),
                "lessons": query_value(cur, 'select count(*) from "Lesson" where status = \'PUBLISHED\''),
            }

            snapshot = {
                "label": label,
                "created_at": now.isoformat(),
                "published_counts": published_counts,
                "published_locale_counts": {
                    "categories": locale_counts(cur, "CategoryLocale"),
                    "courses": locale_counts(cur, "CourseLocale"),
                    "modules": locale_counts(cur, "ModuleLocale"),
                    "lessons": locale_counts(cur, "LessonLocale"),
                },
                "flagship_missing_lessons": flagship_missing(cur),
                "flagship_video_rows": flagship_video_rows(cur),
                "media_rows": media_inventory(cur),
                "file_inventory": {
                    "localized_images": {
                        locale: count_files(APP_ROOT / "public" / "course-guides" / "i18n" / locale)
                        for locale in ("fr", "es", "de")
                    },
                    "live_i18n_media_files": count_files(APP_ROOT / "public" / "course-guides" / "i18n-media"),
                    "premium_i18n_media_files": count_files(APP_ROOT / "public" / "course-guides" / "i18n-media-premium"),
                },
            }

    stamp = now.strftime("%Y-%m-%d-%H%M")
    json_path = OUT_DIR / f"{stamp}-{label}-multilingual-snapshot.json"
    md_path = OUT_DIR / f"{stamp}-{label}-multilingual-snapshot.md"
    json_path.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")

    lines = [
        f"# Multilingual {label.title()} Snapshot",
        "",
        f"- Created at: {snapshot['created_at']}",
        f"- Published categories: {snapshot['published_counts']['categories']}",
        f"- Published courses: {snapshot['published_counts']['courses']}",
        f"- Published lessons: {snapshot['published_counts']['lessons']}",
        "",
        "## Published Locale Counts",
        "",
    ]
    for entity, counts in snapshot["published_locale_counts"].items():
        formatted = ", ".join(f"`{locale}`: {count}" for locale, count in sorted(counts.items()))
        lines.append(f"- {entity.title()}: {formatted}")

    lines.extend(["", "## Flagship Missing Lesson Locales", ""])
    for locale, rows in snapshot["flagship_missing_lessons"].items():
        lines.append(f"### {locale.upper()}")
        lines.append("")
        for slug, data in rows.items():
            lines.append(
                f"- `{slug}`: {data['missing_lessons']} missing of {data['total_lessons']} published lessons"
            )
        lines.append("")

    lines.extend(
        [
            "## File Inventory",
            "",
            f"- Localized images `fr`: {snapshot['file_inventory']['localized_images']['fr']}",
            f"- Localized images `es`: {snapshot['file_inventory']['localized_images']['es']}",
            f"- Localized images `de`: {snapshot['file_inventory']['localized_images']['de']}",
            f"- Live localized media files: {snapshot['file_inventory']['live_i18n_media_files']}",
            f"- Premium localized media files: {snapshot['file_inventory']['premium_i18n_media_files']}",
            "",
            "## Flagship Video Rows",
            "",
        ]
    )
    for lesson_slug, entries in snapshot["flagship_video_rows"].items():
        lines.append(f"### `{lesson_slug}`")
        lines.append("")
        for entry in entries:
            lines.append(
                f"- `{entry['locale']}` video: `{entry['video_url'] or ''}` | subtitles: `{entry['subtitle_url'] or ''}`"
            )
        lines.append("")

    md_path.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"json": str(json_path), "md": str(md_path)}, indent=2))


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--label", default="baseline", choices=("baseline", "final"))
    args = parser.parse_args()
    build_snapshot(args.label)


if __name__ == "__main__":
    main()

#!/home/dylan/pestsense-academy/.venv-media/bin/python
import argparse
import json

import psycopg2
from deep_translator import GoogleTranslator, MyMemoryTranslator
from psycopg2.extras import RealDictCursor

from fill_targeted_locales import (
    DB_URL,
    FLAGSHIP_COURSE_SLUGS,
    looks_stale_localized_text,
    replace_media_sources,
    translate_html,
    translate_text,
)


MYMEMORY_LANGUAGE_MAP = {
    "en": "english",
    "fr": "french",
    "es": "spanish",
    "de": "german",
}


def parse_args():
    parser = argparse.ArgumentParser(description="Repair stale published locale rows for flagship lessons.")
    parser.add_argument("--locales", nargs="+", default=["es", "de"])
    parser.add_argument("--translator", choices=("google", "mymemory"), default="google")
    return parser.parse_args()


def translator_for_engine(locale: str, engine: str):
    if engine == "mymemory":
        return MyMemoryTranslator(source="english", target=MYMEMORY_LANGUAGE_MAP[locale])
    return GoogleTranslator(source="en", target=locale)


def main():
    args = parse_args()
    report = {"updated": 0, "lessons": []}

    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            for locale in args.locales:
                translator = translator_for_engine(locale, args.translator)
                cur.execute(
                    '''
                    select
                      l.id as lesson_id,
                      l.slug as lesson_slug,
                      c.slug as course_slug,
                      l.title as base_title,
                      l.summary as base_summary,
                      l.content as base_content,
                      ll.title as localized_title,
                      ll.summary as localized_summary,
                      ll.content as localized_content
                    from "LessonLocale" ll
                    join "Lesson" l on l.id = ll."lessonId"
                    join "Module" m on m.id = l."moduleId"
                    join "Course" c on c.id = m."courseId"
                    where ll.status = 'PUBLISHED'
                      and ll.locale = %s
                      and c.slug = any(%s)
                      and (
                        ll.title = l.title
                        or coalesce(ll.summary, '') = coalesce(l.summary, '')
                        or coalesce(ll.content, '') = coalesce(l.content, '')
                      )
                    order by c.slug, l.slug
                    ''',
                    (locale, list(FLAGSHIP_COURSE_SLUGS)),
                )
                rows = cur.fetchall()

                for row in rows:
                    stale = looks_stale_localized_text(
                        row["base_title"],
                        row["base_summary"],
                        row["base_content"],
                        row["localized_title"],
                        row["localized_summary"],
                        row["localized_content"],
                    )
                    title = (
                        row["localized_title"]
                        if row["localized_title"] and not stale["title"]
                        else translate_text(row["base_title"], locale, translator)
                    )
                    summary = (
                        row["localized_summary"]
                        if row["localized_summary"] and not stale["summary"]
                        else translate_text(row["base_summary"], locale, translator) if row["base_summary"] else None
                    )
                    content = (
                        row["localized_content"]
                        if row["localized_content"] and not stale["content"]
                        else translate_html(row["base_content"], locale, translator) if row["base_content"] else None
                    )
                    content = replace_media_sources(content, locale)

                    cur.execute(
                        '''
                        update "LessonLocale"
                           set title = %s,
                               summary = %s,
                               content = %s,
                               "updatedAt" = now()
                         where "lessonId" = %s
                           and locale = %s
                        ''',
                        (title, summary, content, row["lesson_id"], locale),
                    )

                    report["updated"] += 1
                    report["lessons"].append(
                        {
                            "locale": locale,
                            "course_slug": row["course_slug"],
                            "lesson_slug": row["lesson_slug"],
                        }
                    )
                    conn.commit()
                    print(f"[{locale}] repaired {row['course_slug']} / {row['lesson_slug']}")

        print(json.dumps(report, indent=2, ensure_ascii=False))
    finally:
        conn.close()


if __name__ == "__main__":
    main()

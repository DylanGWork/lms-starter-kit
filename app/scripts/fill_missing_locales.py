#!/home/dylan/pestsense-academy/.venv-media/bin/python
import os
import re
import time
import uuid
from bs4 import BeautifulSoup, NavigableString
from deep_translator import GoogleTranslator
import psycopg2
from psycopg2.extras import RealDictCursor


DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://lms:change_this_password@127.0.0.1:5432/lms_platform",
)
LOCALES = ("fr", "es", "de")

GLOSSARY = [
    "PestSense",
    "OneCloud",
    "Predictor",
    "LoRaWAN",
    "LoRa",
    "QuickStart",
    "QUICKSTART",
    "Quickstart",
    "Testing Site",
    "Test Site Mode",
    "Live Map",
    "Floor Plan",
    "App Settings",
    "Manage Products",
    "Company Products",
    "All Products",
    "Screens",
    "Help",
    "More",
    "Register as New User",
    "Sign in",
    "Forgot my password",
    "Remember me",
    "Submit",
    "Save",
    "View History",
    "END VISIT",
    "REC / INCIDENT",
    "INSTALL",
    "SERVICE",
    "REMOVE",
    "R3000-LG",
    "Predictor X",
    "SIM 1",
    "SIM 2",
    "ETH1",
    "ETH2",
    "RUN",
    "MODEM",
    "USR",
    "WAN",
    "APN",
    "USB-A",
    "Victor",
]

URL_RE = re.compile(r"https?://[^\s<>()]+")
PLACEHOLDER_RE = re.compile(r"PSXPH(\d+)TOKEN")


def chunked(items, size):
    for i in range(0, len(items), size):
        yield items[i : i + size]


def protect_text(text):
    protected = {}
    replacements = []
    for term in sorted(set(GLOSSARY), key=len, reverse=True):
        if term in text:
            replacements.append(term)
    for match in URL_RE.finditer(text):
        replacements.append(match.group(0))

    out = text
    for idx, value in enumerate(dict.fromkeys(replacements)):
        token = f"PSXPH{idx}TOKEN"
        protected[token] = value
        out = out.replace(value, token)
    return out, protected


def restore_text(text, protected):
    restored = text
    for token, value in protected.items():
        restored = restored.replace(token, value)
    return restored


def translator_for(locale):
    return GoogleTranslator(source="en", target=locale)


def translate_text(text, locale, translator=None):
    if not text or not text.strip():
        return text
    translator = translator or translator_for(locale)
    protected_text, protected = protect_text(text)
    if protected_text.strip() in protected:
        return text
    translated = translator.translate(protected_text)
    return restore_text(translated, protected)


def translate_html(html, locale, translator=None):
    if not html:
        return html

    soup = BeautifulSoup(html, "html.parser")
    translator = translator or translator_for(locale)

    text_nodes = []
    original_values = []
    protected_maps = []

    for node in soup.find_all(string=True):
        parent = node.parent.name if node.parent else ""
        if parent in {"script", "style", "code"}:
            continue
        if isinstance(node, NavigableString):
            value = str(node)
            if not value.strip():
                continue
            protected_text, protected = protect_text(value)
            if not protected_text.strip():
                continue
            text_nodes.append(node)
            original_values.append(protected_text)
            protected_maps.append(protected)

    for node_batch, value_batch, protected_batch in zip(
        chunked(text_nodes, 40),
        chunked(original_values, 40),
        chunked(protected_maps, 40),
    ):
        translated_batch = translator.translate_batch(value_batch)
        for node, original, translated, protected in zip(node_batch, value_batch, translated_batch, protected_batch):
            resolved = restore_text(translated or original, protected)
            node.replace_with(resolved)
        time.sleep(0.2)

    return str(soup)


def fetch_all(cur, query):
    cur.execute(query)
    return cur.fetchall()


def main():
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            modules = fetch_all(
                cur,
                'select id, title, description from "Module" order by "sortOrder", id',
            )
            lessons = fetch_all(
                cur,
                'select id, title, summary, content from "Lesson" order by "sortOrder", id',
            )

            existing_module_locales = {
                (row["moduleId"], row["locale"])
                for row in fetch_all(cur, 'select "moduleId", locale from "ModuleLocale"')
            }
            existing_lesson_locales = {
                (row["lessonId"], row["locale"])
                for row in fetch_all(cur, 'select "lessonId", locale from "LessonLocale"')
            }

            inserted_modules = 0
            inserted_lessons = 0

            for locale in LOCALES:
                print(f"Translating missing module locales for {locale}...")
                translator = translator_for(locale)
                for module in modules:
                    key = (module["id"], locale)
                    if key in existing_module_locales:
                        continue
                    title = translate_text(module["title"], locale, translator)
                    description = translate_text(module["description"], locale, translator) if module["description"] else None
                    cur.execute(
                        '''
                        insert into "ModuleLocale" (id, "moduleId", locale, status, title, description, "createdAt", "updatedAt")
                        values (%s, %s, %s, 'PUBLISHED', %s, %s, now(), now())
                        on conflict ("moduleId", locale) do update
                        set status='PUBLISHED', title=excluded.title, description=excluded.description, "updatedAt"=now()
                        ''',
                        (uuid.uuid4().hex, module["id"], locale, title, description),
                    )
                    inserted_modules += 1

                conn.commit()
                print(f"Translating missing lesson locales for {locale}...")
                for lesson in lessons:
                    key = (lesson["id"], locale)
                    if key in existing_lesson_locales:
                        continue
                    title = translate_text(lesson["title"], locale, translator)
                    summary = translate_text(lesson["summary"], locale, translator) if lesson["summary"] else None
                    content = translate_html(lesson["content"], locale, translator) if lesson["content"] else None
                    cur.execute(
                        '''
                        insert into "LessonLocale" (id, "lessonId", locale, status, title, summary, content, "createdAt", "updatedAt")
                        values (%s, %s, %s, 'PUBLISHED', %s, %s, %s, now(), now())
                        on conflict ("lessonId", locale) do update
                        set status='PUBLISHED', title=excluded.title, summary=excluded.summary, content=excluded.content, "updatedAt"=now()
                        ''',
                        (uuid.uuid4().hex, lesson["id"], locale, title, summary, content),
                    )
                    inserted_lessons += 1
                    if inserted_lessons % 5 == 0:
                        print(f"[{locale}] translated {inserted_lessons} lessons so far...")
                        conn.commit()
                    time.sleep(0.25)

            conn.commit()
            print(f"Inserted/updated {inserted_modules} module locales and {inserted_lessons} lesson locales.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()

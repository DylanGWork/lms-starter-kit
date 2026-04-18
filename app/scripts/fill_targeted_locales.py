#!/home/dylan/pestsense-academy/.venv-media/bin/python
import json
import os
import re
import time
import uuid
from collections import defaultdict
from pathlib import Path

from bs4 import BeautifulSoup, NavigableString
from deep_translator import GoogleTranslator
from deep_translator.exceptions import TranslationNotFound
import psycopg2
from psycopg2.extras import RealDictCursor


DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://lms:change_this_password@127.0.0.1:5432/lms_platform",
)
PUBLIC_ROOT = Path("/home/dylan/pestsense-academy/app/public")
LOCALES = ("fr", "es", "de")
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

KNOWN_LOCALIZED_ASSETS = {
    "login-form": {
        "sources": [
            "/uploads/academy-guides/login-form.jpg",
            "/course-guides/i18n/fr/login-form-fr.jpg",
            "/course-guides/i18n/es/login-form-es.jpg",
            "/course-guides/i18n/de/login-form-de.jpg",
        ],
        "target": "/course-guides/i18n/{locale}/login-form-{locale}.jpg",
    },
    "register-form": {
        "sources": [
            "/uploads/academy-guides/register-form.jpg",
            "/course-guides/i18n/fr/register-form-fr.jpg",
            "/course-guides/i18n/es/register-form-es.jpg",
            "/course-guides/i18n/de/register-form-de.jpg",
        ],
        "target": "/course-guides/i18n/{locale}/register-form-{locale}.jpg",
    },
    "quickstart-testing-site": {
        "sources": [
            "/uploads/academy-guides/quickstart-testing-site.jpg",
            "/course-guides/i18n/fr/quickstart-testing-site-fr.jpg",
            "/course-guides/i18n/es/quickstart-testing-site-es.jpg",
            "/course-guides/i18n/de/quickstart-testing-site-de.jpg",
        ],
        "target": "/course-guides/i18n/{locale}/quickstart-testing-site-{locale}.jpg",
    },
    "screens-hierarchy": {
        "sources": [
            "/uploads/academy-guides/screens-hierarchy.jpg",
            "/course-guides/i18n/fr/screens-hierarchy-fr.jpg",
            "/course-guides/i18n/es/screens-hierarchy-es.jpg",
            "/course-guides/i18n/de/screens-hierarchy-de.jpg",
        ],
        "target": "/course-guides/i18n/{locale}/screens-hierarchy-{locale}.jpg",
    },
    "screens-live-map": {
        "sources": [
            "/course-guides/screens-live-map.jpg",
            "/course-guides/i18n/fr/screens-live-map-fr.jpg",
            "/course-guides/i18n/es/screens-live-map-es.jpg",
            "/course-guides/i18n/de/screens-live-map-de.jpg",
        ],
        "target": "/course-guides/i18n/{locale}/screens-live-map-{locale}.jpg",
    },
}

for family, stems in {
    "product": (
        "product-step-01-select-and-assign",
        "product-step-02-create-first",
        "product-step-03-fill-required-fields",
        "product-step-04-review-required-fields",
    ),
    "rodenticide": (
        "rodenticide-step-01-company-products",
        "rodenticide-step-02-create-product",
        "rodenticide-step-03-active-ingredient",
        "rodenticide-step-04-validation-alert",
        "rodenticide-step-05-ready-to-save",
    ),
}.items():
    for stem in stems:
        KNOWN_LOCALIZED_ASSETS[stem] = {
            "sources": [
                f"/course-guides/{family}/{stem}.jpg",
                *(f"/course-guides/i18n/{locale}/{family}/{stem}-{locale}.jpg" for locale in LOCALES),
            ],
            "target": f"/course-guides/i18n/{{locale}}/{family}/{stem}-{{locale}}.jpg",
        }


def chunked(items, size):
    for idx in range(0, len(items), size):
        yield items[idx : idx + size]


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
    try:
        translated = translator.translate(protected_text)
    except TranslationNotFound:
        translated = protected_text
    return restore_text(translated, protected)


def translate_html(html, locale, translator=None):
    if not html:
        return html

    translator = translator or translator_for(locale)
    soup = BeautifulSoup(html, "html.parser")
    text_nodes = []
    original_values = []
    protected_maps = []

    for node in soup.find_all(string=True):
        parent = node.parent.name if node.parent else ""
        if parent in {"script", "style", "code"}:
            continue
        if not isinstance(node, NavigableString):
            continue
        value = str(node)
        if not value.strip():
            continue
        protected_text, protected = protect_text(value)
        text_nodes.append(node)
        original_values.append(protected_text)
        protected_maps.append(protected)

    for node_batch, value_batch, protected_batch in zip(
        chunked(text_nodes, 40),
        chunked(original_values, 40),
        chunked(protected_maps, 40),
    ):
        try:
            translated_batch = translator.translate_batch(value_batch)
        except TranslationNotFound:
            translated_batch = []
            for value in value_batch:
                try:
                    translated_batch.append(translator.translate(value))
                except TranslationNotFound:
                    translated_batch.append(value)

        for node, original, translated, protected in zip(node_batch, value_batch, translated_batch, protected_batch):
            node.replace_with(restore_text(translated or original, protected))

        time.sleep(0.15)

    return str(soup)


def existing_localized_asset(target_path):
    return (PUBLIC_ROOT / target_path.lstrip("/")).exists()


def replace_media_sources(html, locale):
    if not html:
        return html

    updated = html
    for asset in KNOWN_LOCALIZED_ASSETS.values():
        target = asset["target"].format(locale=locale)
        if not existing_localized_asset(target):
            continue
        for source in asset["sources"]:
            updated = updated.replace(source, target)
    return updated


def looks_stale_localized_text(base_title, base_summary, base_content, localized_title, localized_summary, localized_content):
    title_stale = not localized_title or localized_title.strip() == (base_title or "").strip()
    summary_stale = (localized_summary or "").strip() == (base_summary or "").strip()
    content = localized_content or ""
    english_markers = (
        "What This Lesson Solves",
        "Where To Do This",
        "Short Walkthrough Video",
        "Step 1:",
        "Step 2:",
        "Step 3:",
        "Step 4:",
        "Step 5:",
    )
    if not content.strip():
        content_stale = True
    elif any(marker in content for marker in english_markers):
        content_stale = True
    elif base_content and content.strip() == base_content.strip():
        content_stale = True
    else:
        content_stale = False

    return {
        "title": title_stale,
        "summary": summary_stale,
        "content": content_stale,
    }


def fetch_rows(cur, sql, params=None):
    cur.execute(sql, params or ())
    return cur.fetchall()


def module_scope_clause(locale):
    if locale == "fr":
        return "c.status = 'PUBLISHED'", []
    return "c.slug = any(%s) and c.status = 'PUBLISHED'", [list(FLAGSHIP_COURSE_SLUGS)]


def lesson_scope_clause(locale):
    if locale == "fr":
        return "c.status = 'PUBLISHED' and l.status = 'PUBLISHED'", []
    return "c.slug = any(%s) and c.status = 'PUBLISHED' and l.status = 'PUBLISHED'", [list(FLAGSHIP_COURSE_SLUGS)]


def upsert_module_locale(cur, module_id, locale, title, description):
    cur.execute(
        '''
        insert into "ModuleLocale" (id, "moduleId", locale, status, title, description, "createdAt", "updatedAt")
        values (%s, %s, %s, 'PUBLISHED', %s, %s, now(), now())
        on conflict ("moduleId", locale) do update
        set status='PUBLISHED', title=excluded.title, description=excluded.description, "updatedAt"=now()
        ''',
        (uuid.uuid4().hex, module_id, locale, title, description),
    )


def upsert_lesson_locale(cur, lesson_id, locale, title, summary, content):
    cur.execute(
        '''
        insert into "LessonLocale" (id, "lessonId", locale, status, title, summary, content, "createdAt", "updatedAt")
        values (%s, %s, %s, 'PUBLISHED', %s, %s, %s, now(), now())
        on conflict ("lessonId", locale) do update
        set status='PUBLISHED',
            title=excluded.title,
            summary=excluded.summary,
            content=excluded.content,
            "updatedAt"=now()
        ''',
        (uuid.uuid4().hex, lesson_id, locale, title, summary, content),
    )


def main():
    report = {"modules": defaultdict(int), "lessons": defaultdict(int)}
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            for locale in LOCALES:
                translator = translator_for(locale)
                module_clause, module_params = module_scope_clause(locale)
                lesson_clause, lesson_params = lesson_scope_clause(locale)
                print(f"[{locale}] preparing module and lesson scope")

                modules = fetch_rows(
                    cur,
                    f'''
                    select m.id,
                           m.title as base_title,
                           m.description as base_description,
                           ml.title as localized_title,
                           ml.description as localized_description
                    from "Module" m
                    join "Course" c on c.id = m."courseId"
                    left join "ModuleLocale" ml
                      on ml."moduleId" = m.id
                     and ml.locale = %s
                    where {module_clause}
                    order by c."sortOrder", m."sortOrder", m.id
                    ''',
                    [locale] + module_params,
                )

                for module in modules:
                    title = module["localized_title"] or translate_text(module["base_title"], locale, translator)
                    if module["localized_description"]:
                        description = module["localized_description"]
                    elif module["base_description"]:
                        description = translate_text(module["base_description"], locale, translator)
                    else:
                        description = None

                    upsert_module_locale(cur, module["id"], locale, title, description)
                    report["modules"][locale] += 1
                    if report["modules"][locale] % 10 == 0:
                        print(f"[{locale}] processed {report['modules'][locale]} modules")

                lessons = fetch_rows(
                    cur,
                    f'''
                    select l.id,
                           l.slug,
                           c.slug as course_slug,
                           l.title as base_title,
                           l.summary as base_summary,
                           l.content as base_content,
                           ll.title as localized_title,
                           ll.summary as localized_summary,
                           ll.content as localized_content
                    from "Lesson" l
                    join "Module" m on m.id = l."moduleId"
                    join "Course" c on c.id = m."courseId"
                    left join "LessonLocale" ll
                      on ll."lessonId" = l.id
                     and ll.locale = %s
                    where {lesson_clause}
                    order by c."sortOrder", m."sortOrder", l."sortOrder", l.id
                    ''',
                    [locale] + lesson_params,
                )

                for lesson in lessons:
                    stale = looks_stale_localized_text(
                        lesson["base_title"],
                        lesson["base_summary"],
                        lesson["base_content"],
                        lesson["localized_title"],
                        lesson["localized_summary"],
                        lesson["localized_content"],
                    )

                    if lesson["localized_title"] and not stale["title"]:
                        title = lesson["localized_title"]
                    else:
                        title = translate_text(lesson["base_title"], locale, translator)

                    if lesson["localized_summary"] and not stale["summary"]:
                        summary = lesson["localized_summary"]
                    elif lesson["base_summary"]:
                        summary = translate_text(lesson["base_summary"], locale, translator)
                    else:
                        summary = None

                    if lesson["localized_content"] and not stale["content"]:
                        content = lesson["localized_content"]
                    elif lesson["base_content"]:
                        content = translate_html(lesson["base_content"], locale, translator)
                    else:
                        content = None

                    content = replace_media_sources(content, locale)
                    upsert_lesson_locale(cur, lesson["id"], locale, title, summary, content)
                    report["lessons"][locale] += 1

                    if report["lessons"][locale] % 8 == 0:
                        print(f"[{locale}] processed {report['lessons'][locale]} lessons")
                        conn.commit()
                        time.sleep(0.1)

                conn.commit()

        print(json.dumps(report, indent=2))
    finally:
        conn.close()


if __name__ == "__main__":
    main()

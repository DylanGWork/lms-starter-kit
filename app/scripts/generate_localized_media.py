#!/home/dylan/pestsense-academy/.venv-media/bin/python
import asyncio
import json
import math
import os
import re
import shutil
import subprocess
import tempfile
import time
import uuid
from pathlib import Path

import edge_tts
import psycopg2
import srt
import webvtt
import whisper
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
from langdetect import detect
from pydub import AudioSegment
from pydub.effects import speedup
from psycopg2.extras import RealDictCursor


DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://lms:change_this_password@127.0.0.1:5432/lms_platform",
)
APP_ROOT = Path("/home/dylan/pestsense-academy/app")
PUBLIC_ROOT = APP_ROOT / "public" / "course-guides" / "i18n-media"
UPLOAD_CACHE_ROOT = APP_ROOT / ".media-cache" / "uploads"
LOCALES = ("fr", "es", "de")
VOICE_BY_LOCALE = {
    "fr": "fr-FR-DeniseNeural",
    "es": "es-ES-ElviraNeural",
    "de": "de-DE-KatjaNeural",
}

SILENT_VIDEO_SEGMENTS = {
    "add-and-assign-company-products": [
        "Open App Settings and go to Manage Products.",
        "Check whether the product already appears in Company Products.",
        "If it is missing, use the plus button to create a new product first.",
        "Complete the required product fields and save the record.",
        "Move the product into the company list so it can be used later in the workflow.",
    ],
}

GLOSSARY = [
    "PestSense",
    "OneCloud",
    "Predictor",
    "LoRaWAN",
    "QuickStart",
    "QUICKSTART",
    "Testing Site",
    "Test Site Mode",
    "App Settings",
    "Manage Products",
    "Company Products",
    "Screens",
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


def run(cmd):
    subprocess.run(cmd, check=True)


def ffprobe_json(path):
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration:stream=index,codec_type,codec_name,channels,width,height,r_frame_rate",
            "-of",
            "json",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(result.stdout)


def url_to_path(url):
    if url.startswith("/uploads/"):
        relative = Path(url[len("/uploads/") :])
        direct_path = Path("/var/lib/docker/volumes/pestsense-academy_uploads_data/_data") / relative
        try:
            if direct_path.exists() and os.access(direct_path, os.R_OK):
                return direct_path
        except PermissionError:
            pass

        cached_path = UPLOAD_CACHE_ROOT / relative
        if not cached_path.exists():
            cached_path.parent.mkdir(parents=True, exist_ok=True)
            run(
                [
                    "docker",
                    "cp",
                    f"pestsense_app:/app/uploads/{relative.as_posix()}",
                    str(cached_path),
                ]
            )
        return cached_path
    return APP_ROOT / "public" / url.lstrip("/")


def protect_terms(text):
    protected = {}
    out = text
    for idx, term in enumerate(sorted(set(GLOSSARY), key=len, reverse=True)):
        if term in out:
            token = f"PSMGLOSS{idx}TOKEN"
            protected[token] = term
            out = out.replace(term, token)
    return out, protected


def restore_terms(text, protected):
    out = text
    for token, term in protected.items():
        out = out.replace(token, term)
    return out


def translate_segment_texts(texts, locale):
    translator = GoogleTranslator(source="en", target=locale)
    prepared = []
    protected_maps = []
    for text in texts:
        ptext, protected = protect_terms(text)
        prepared.append(ptext)
        protected_maps.append(protected)
    translated = translator.translate_batch(prepared)
    return [restore_terms(item, protected) for item, protected in zip(translated, protected_maps)]


def extract_manual_segments(lesson, duration):
    content = lesson.get("content") or ""
    soup = BeautifulSoup(content, "html.parser")
    headings = [node.get_text(" ", strip=True) for node in soup.select("h2, h3")][:3]
    paragraphs = [node.get_text(" ", strip=True) for node in soup.select("p")][:3]
    candidates = SILENT_VIDEO_SEGMENTS.get(lesson["slug"], []) + headings + paragraphs
    cleaned = []
    for item in candidates:
        item = re.sub(r"\s+", " ", item).strip()
        if item and item not in cleaned:
            cleaned.append(item)
    if not cleaned:
        cleaned = [lesson["title"], lesson.get("summary") or "Guided walkthrough"]
    segment_count = min(max(len(cleaned), 3), 6)
    slot = duration / segment_count
    segments = []
    for idx in range(segment_count):
        start = max(idx * slot, 0)
        end = min((idx + 1) * slot - 0.2, duration)
        text = cleaned[idx if idx < len(cleaned) else -1]
        segments.append({"start": start, "end": end, "text": text})
    return segments


def transcribe_video(model, lesson, path, duration):
    media = ffprobe_json(path)
    has_audio = any(stream.get("codec_type") == "audio" for stream in media.get("streams", []))
    if not has_audio:
      return extract_manual_segments(lesson, duration), "manual"

    result = model.transcribe(str(path), fp16=False, language="en", verbose=False)
    segments = []
    for seg in result.get("segments", []):
        text = re.sub(r"\s+", " ", seg.get("text", "")).strip()
        if not text:
            continue
        segments.append(
            {
                "start": float(seg["start"]),
                "end": float(seg["end"]),
                "text": text,
            }
        )
    if not segments:
        segments = extract_manual_segments(lesson, duration)
        return segments, "manual"
    return segments, "whisper"


def write_subtitles(segments, output_base):
    def seconds_to_timestamp(seconds):
        total_ms = max(int(round(float(seconds) * 1000)), 0)
        hours = total_ms // 3600000
        minutes = (total_ms % 3600000) // 60000
        secs = (total_ms % 60000) // 1000
        ms = total_ms % 1000
        return f"{hours:02d}:{minutes:02d}:{secs:02d}.{ms:03d}"

    subtitles = []
    for index, seg in enumerate(segments, start=1):
        subtitles.append(
            srt.Subtitle(
                index=index,
                start=srt.timedelta(seconds=seg["start"]),
                end=srt.timedelta(seconds=seg["end"]),
                content=seg["text"],
            )
        )
    output_base.parent.mkdir(parents=True, exist_ok=True)
    srt_path = output_base.with_suffix(".srt")
    vtt_path = output_base.with_suffix(".vtt")
    srt_path.write_text(srt.compose(subtitles), encoding="utf-8")

    vtt_obj = webvtt.WebVTT()
    for seg in segments:
        vtt_obj.captions.append(
            webvtt.Caption(
                seconds_to_timestamp(seg["start"]),
                seconds_to_timestamp(seg["end"]),
                seg["text"],
            )
        )
    vtt_obj.save(str(vtt_path))
    return srt_path, vtt_path


def coalesce_segments_for_dub(segments, max_chars=200, max_duration=12.0, max_gap=0.9):
    merged = []
    current = None

    for seg in segments:
      text = seg["text"].strip()
      if not text:
          continue

      if current is None:
          current = {"start": seg["start"], "end": seg["end"], "text": text}
          continue

      projected_duration = seg["end"] - current["start"]
      projected_chars = len(current["text"]) + 1 + len(text)
      gap = seg["start"] - current["end"]

      if gap <= max_gap and projected_duration <= max_duration and projected_chars <= max_chars:
          current["end"] = seg["end"]
          current["text"] = f"{current['text']} {text}"
      else:
          merged.append(current)
          current = {"start": seg["start"], "end": seg["end"], "text": text}

    if current is not None:
        merged.append(current)

    return merged


async def synthesize_segments(segments, locale, voice, output_audio, duration):
    with tempfile.TemporaryDirectory(prefix="tts-segments-") as tmp_dir:
        tmp_dir = Path(tmp_dir)
        base = AudioSegment.silent(duration=int(duration * 1000) + 500)

        for idx, seg in enumerate(segments):
            text = seg["text"].strip()
            if not text:
                continue
            raw_path = tmp_dir / f"seg-{idx:04d}.mp3"
            last_error = None
            for attempt in range(4):
                try:
                    communicate = edge_tts.Communicate(text, voice)
                    await communicate.save(str(raw_path))
                    last_error = None
                    break
                except Exception as exc:
                    last_error = exc
                    await asyncio.sleep(1.5 * (attempt + 1))
            if last_error is not None:
                raise last_error

            audio = AudioSegment.from_file(raw_path)
            start_ms = int(seg["start"] * 1000)
            segment_budget = max(int((seg["end"] - seg["start"]) * 1000) - 150, 400)
            if len(audio) > segment_budget:
                speed_ratio = len(audio) / segment_budget
                audio = speedup(audio, playback_speed=max(1.05, speed_ratio), chunk_size=120, crossfade=25)
                if len(audio) > segment_budget:
                    audio = audio[:segment_budget]
            base = base.overlay(audio, position=start_ms)

        output_audio.parent.mkdir(parents=True, exist_ok=True)
        base.export(output_audio, format="mp3", bitrate="128k")


def mux_video(video_path, audio_path, output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video_path),
            "-i",
            str(audio_path),
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-shortest",
            str(output_path),
        ]
    )


def ensure_lesson_locale(cur, lesson, locale, translated_fields=None):
    translated_fields = translated_fields or {}
    title = translated_fields.get("title") or lesson["title"]
    summary = translated_fields.get("summary") if translated_fields.get("summary") is not None else lesson["summary"]
    content = translated_fields.get("content") if translated_fields.get("content") is not None else lesson["content"]
    cur.execute(
        '''
        insert into "LessonLocale" (id, "lessonId", locale, status, title, summary, content, "createdAt", "updatedAt")
        values (%s, %s, %s, 'PUBLISHED', %s, %s, %s, now(), now())
        on conflict ("lessonId", locale) do update
        set status='PUBLISHED',
            title=coalesce("LessonLocale".title, excluded.title),
            summary=coalesce("LessonLocale".summary, excluded.summary),
            content=coalesce("LessonLocale".content, excluded.content),
            "updatedAt"=now()
        ''',
        (uuid.uuid4().hex, lesson["id"], locale, title, summary, content),
    )


def update_media_fields(cur, lesson_id, locale, video_url=None, subtitle_url=None):
    cur.execute(
        '''
        update "LessonLocale"
        set "videoUrl" = coalesce(%s, "videoUrl"),
            "videoProvider" = case when %s is not null then 'local' else "videoProvider" end,
            "subtitleUrl" = coalesce(%s, "subtitleUrl"),
            status = 'PUBLISHED',
            "updatedAt" = now()
        where "lessonId" = %s and locale = %s
        ''',
        (video_url, video_url, subtitle_url, lesson_id, locale),
    )


def qa_subtitle_language(segments, locale):
    text = " ".join(seg["text"] for seg in segments if seg["text"].strip())
    if not text.strip():
        return "empty"
    try:
        return detect(text)
    except Exception:
        return "unknown"


def main():
    PUBLIC_ROOT.mkdir(parents=True, exist_ok=True)
    conn = psycopg2.connect(DB_URL)
    conn.autocommit = False
    model = whisper.load_model("base")
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                '''
                select id, slug, title, summary, content, "videoUrl", "videoProvider"
                from "Lesson"
                where "videoUrl" is not null and "videoProvider" = 'local'
                order by "videoUrl", slug
                '''
            )
            lessons = cur.fetchall()

            groups = {}
            for lesson in lessons:
                groups.setdefault(lesson["videoUrl"], []).append(lesson)

            qa_rows = []

            for video_url, linked_lessons in groups.items():
                lesson = linked_lessons[0]
                src_path = url_to_path(video_url)
                probe = ffprobe_json(src_path)
                duration = float(probe["format"]["duration"])
                slug_root = lesson["slug"]
                media_root = PUBLIC_ROOT / slug_root
                media_root.mkdir(parents=True, exist_ok=True)
                print(f"Processing {slug_root} from {video_url}")

                base_segments, source_type = transcribe_video(model, lesson, src_path, duration)
                en_base = media_root / "en-subtitles"
                en_srt_path = en_base.with_suffix(".srt")
                en_vtt_path = en_base.with_suffix(".vtt")
                if en_srt_path.exists() and en_vtt_path.exists():
                    en_srt, en_vtt = en_srt_path, en_vtt_path
                else:
                    en_srt, en_vtt = write_subtitles(base_segments, en_base)

                for linked in linked_lessons:
                    ensure_lesson_locale(cur, linked, "en")
                    update_media_fields(cur, linked["id"], "en", subtitle_url=f"/course-guides/i18n-media/{slug_root}/en-subtitles.vtt")

                qa_rows.append(
                    {
                        "slug": slug_root,
                        "locale": "en",
                        "kind": source_type,
                        "subtitle": en_vtt.name,
                        "dubbed": "",
                        "lang": qa_subtitle_language(base_segments, "en"),
                    }
                )

                for locale in LOCALES:
                    translated_texts = translate_segment_texts([seg["text"] for seg in base_segments], locale)
                    localized_segments = [
                        {"start": seg["start"], "end": seg["end"], "text": translated}
                        for seg, translated in zip(base_segments, translated_texts)
                    ]

                    locale_base = media_root / f"{locale}-subtitles"
                    locale_srt_path = locale_base.with_suffix(".srt")
                    locale_vtt_path = locale_base.with_suffix(".vtt")
                    if locale_srt_path.exists() and locale_vtt_path.exists():
                        locale_vtt = locale_vtt_path
                    else:
                        _, locale_vtt = write_subtitles(localized_segments, locale_base)
                    dub_mp3 = media_root / f"{locale}-dub-audio.mp3"
                    dubbed_video = media_root / f"{locale}-dubbed.mp4"

                    if not (dub_mp3.exists() and dubbed_video.exists()):
                        asyncio.run(
                            synthesize_segments(
                                coalesce_segments_for_dub(localized_segments),
                                locale,
                                VOICE_BY_LOCALE[locale],
                                dub_mp3,
                                duration,
                            )
                        )
                        mux_video(src_path, dub_mp3, dubbed_video)

                    for linked in linked_lessons:
                        ensure_lesson_locale(cur, linked, locale)
                        update_media_fields(
                            cur,
                            linked["id"],
                            locale,
                            video_url=f"/course-guides/i18n-media/{slug_root}/{locale}-dubbed.mp4",
                            subtitle_url=f"/course-guides/i18n-media/{slug_root}/{locale}-subtitles.vtt",
                        )

                    qa_rows.append(
                        {
                            "slug": slug_root,
                            "locale": locale,
                            "kind": source_type,
                            "subtitle": locale_vtt.name,
                            "dubbed": dubbed_video.name,
                            "lang": qa_subtitle_language(localized_segments, locale),
                        }
                    )
                    conn.commit()

            qa_report = PUBLIC_ROOT / "media-qa-report.json"
            qa_report.write_text(json.dumps(qa_rows, indent=2), encoding="utf-8")
            conn.commit()
            print(f"Wrote QA report to {qa_report}")
    finally:
        conn.close()


if __name__ == "__main__":
    main()

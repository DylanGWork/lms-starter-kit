#!/home/dylan/pestsense-academy/.venv-media/bin/python
import argparse
import asyncio
import json
import os
import shutil
import subprocess
import tempfile
import uuid
from datetime import timedelta
from pathlib import Path

import edge_tts
from deep_translator import GoogleTranslator
import psycopg2
import srt
from pydub import AudioSegment
from pydub.effects import speedup


DB_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://lms:change_this_password@127.0.0.1:5432/lms_platform",
)
APP_ROOT = Path("/home/dylan/pestsense-academy/app")
PUBLIC_ROOT = APP_ROOT / "public" / "course-guides"
PREMIUM_ROOT = PUBLIC_ROOT / "i18n-media-premium"
LIVE_ROOT = PUBLIC_ROOT / "i18n-media"

GLOSSARY = [
    "PestSense",
    "OneCloud",
    "Predictor",
    "Predictor X",
    "LoRaWAN",
    "LoRa",
    "QuickStart",
    "App Settings",
    "Manage Products",
    "Company Products",
    "Register as New User",
    "Sign in",
    "Save",
    "View History",
    "R3000-LG",
    "SIM",
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
]

VOICE_CONFIG = {
    "fr": {"voice": "fr-FR-VivienneMultilingualNeural", "rate": "+4%"},
    "es": {"voice": "es-ES-XimenaNeural", "rate": "+3%"},
    "de": {"voice": "de-DE-SeraphinaMultilingualNeural", "rate": "+4%"},
}

PROFILES = {
    "product": {
        "media_root": "add-and-assign-company-products",
        "source_video": PUBLIC_ROOT / "product" / "add-product-guided-demo.mp4",
        "lesson_slugs": ("add-and-assign-company-products",),
        "segments": [
            {"start": 0.00, "end": 2.98, "text": "Open App Settings and go to Manage Products."},
            {"start": 3.18, "end": 6.16, "text": "Check whether the product already appears in Company Products."},
            {"start": 6.36, "end": 9.34, "text": "If it is missing, use the plus button to create a new product first."},
            {"start": 9.54, "end": 12.52, "text": "Complete the required product fields and save the record."},
            {"start": 12.72, "end": 15.70, "text": "Move the product into the company list so it can be used later in the workflow."},
        ],
    },
    "gateway": {
        "media_root": "connecting-antennas-and-power",
        "source_video": Path("/home/dylan/pestsense-academy/app/.media-cache/uploads/videos/a4c24a22-3902-4029-8a2c-4aa95e74fa4e.mp4"),
        "upload_relative": "videos/a4c24a22-3902-4029-8a2c-4aa95e74fa4e.mp4",
        "lesson_slugs": (
            "unboxing-r3000-lg-gateway",
            "connecting-antennas-and-power",
            "installing-sim-card-r3000-lg",
            "powering-on-reading-leds",
        ),
        "segments": [
            {"start": 0.00, "end": 7.00, "text": "Hi everybody. Today I am going to show you how to set up the gateway and what comes in the box."},
            {"start": 7.00, "end": 15.00, "text": "Open it up and you will find the gateway inside. Your packaging may look slightly different if it is unopened."},
            {"start": 15.00, "end": 24.00, "text": "This is the LoRaWAN antenna. It will have either 915 or 868 written on it, depending on the region."},
            {"start": 25.00, "end": 36.00, "text": "You also have the power supply. It needs to be screwed into the gateway, and you will need a flat-head screwdriver for that part."},
            {"start": 36.00, "end": 45.00, "text": "You will also have the cellular antenna and the gateway itself."},
            {"start": 46.00, "end": 61.00, "text": "On the gateway you will see a red cap on each SMA connector. That is where the antennas will attach."},
            {"start": 61.00, "end": 71.00, "text": "The connector labelled main is where the cellular antenna goes. Screw it on until it is finger tight."},
            {"start": 72.00, "end": 83.00, "text": "It only needs to be finger tight. Do not overtighten it, and keep the cable clear of the other ports."},
            {"start": 83.00, "end": 104.00, "text": "Now connect the power cable. The red wire goes to plus and the negative wire goes to negative. Push it in fully and tighten the screws on either side so it cannot fall back out."},
            {"start": 126.00, "end": 136.00, "text": "The LoRaWAN antenna goes on the connector labelled LoRa, near the USB port."},
            {"start": 138.00, "end": 143.00, "text": "Screw it on until it is finger tight, and do not use tools."},
            {"start": 146.00, "end": 159.00, "text": "Once both antennas and the power cable are in place, plug the unit in. Everything else should already be configured before it reaches the site."},
            {"start": 160.00, "end": 168.00, "text": "The lights will begin to flash. It takes around three to five minutes for the gateway to boot fully."},
        ],
    },
    "switching": {
        "media_root": "switching-bait-to-snap-trap",
        "source_video": Path("/home/dylan/pestsense-academy/app/.media-cache/uploads/videos/b7462372-659a-444a-8078-237f301b4103.mp4"),
        "upload_relative": "videos/b7462372-659a-444a-8078-237f301b4103.mp4",
        "lesson_slugs": ("switching-bait-to-snap-trap",),
        "segments": [
            {"start": 0.00, "end": 5.36, "text": "Hi everybody. My name is Dylan and I am going to show you how to set up a snap trap in a Predictor X box."},
            {"start": 6.24, "end": 18.12, "text": "First, open the box. This is the same box I used for baiting in the last video, and now I will show you how to switch from bait mode into snap trap mode."},
            {"start": 19.24, "end": 23.12, "text": "First, remove the bait."},
            {"start": 24.56, "end": 31.72, "text": "Take the bar off. The other bar can slip in behind the hinges and store neatly there."},
            {"start": 33.68, "end": 44.76, "text": "Place your snap trap in the feeding chamber or hallway. It can be a rat trap or a mouse trap."},
            {"start": 45.44, "end": 49.28, "text": "Press the service button and you will see the orange light begin to flash."},
            {"start": 50.52, "end": 57.02, "text": "You can press the button before or after putting the snap trap in. Once the light turns orange,"},
            {"start": 57.26, "end": 61.78, "text": "press the trap button and it will start flashing green."},
            {"start": 62.30, "end": 67.50, "text": "When it flashes green, the setup is complete. The flashing will stop in another second."},
            {"start": 68.82, "end": 77.74, "text": "There we go. You are all set up and ready to go. Close the lid."},
        ],
    },
}


def run(cmd):
    subprocess.run(cmd, check=True)


def ffprobe_duration(path: Path) -> float:
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


def ensure_source_video(profile):
    source_video = profile["source_video"]
    if source_video.exists():
        return source_video

    upload_relative = profile.get("upload_relative")
    if not upload_relative:
        raise FileNotFoundError(f"Source video missing: {source_video}")

    source_video.parent.mkdir(parents=True, exist_ok=True)
    run(["docker", "cp", f"pestsense_app:/app/uploads/{upload_relative}", str(source_video)])
    if not source_video.exists():
        raise FileNotFoundError(f"Unable to cache uploaded source video: {source_video}")
    return source_video


def protect_terms(text):
    protected = {}
    out = text
    for idx, term in enumerate(sorted(set(GLOSSARY), key=len, reverse=True)):
        if term in out:
            token = f"PSPREM{idx}TOKEN"
            protected[token] = term
            out = out.replace(term, token)
    return out, protected


def restore_terms(text, protected):
    out = text
    for token, value in protected.items():
        out = out.replace(token, value)
    return out


def translate_segments(locale: str, segments):
    translator = GoogleTranslator(source="en", target=locale)
    protected_rows = []
    for segment in segments:
        text, protected = protect_terms(segment["text"])
        protected_rows.append((text, protected))
    translated = translator.translate_batch([row[0] for row in protected_rows])
    output = []
    for segment, translated_text, (_, protected) in zip(segments, translated, protected_rows):
        output.append(
            {
                "start": segment["start"],
                "end": segment["end"],
                "text": restore_terms(translated_text or segment["text"], protected),
            }
        )
    return output


def write_subtitles(segments, output_base: Path):
    subtitles = [
        srt.Subtitle(
            index=index,
            start=timedelta(seconds=segment["start"]),
            end=timedelta(seconds=segment["end"]),
            content=segment["text"],
        )
        for index, segment in enumerate(segments, start=1)
    ]

    srt_path = output_base.with_suffix(".srt")
    vtt_path = output_base.with_suffix(".vtt")
    srt_path.write_text(srt.compose(subtitles), encoding="utf-8")

    lines = ["WEBVTT", ""]
    for segment in segments:
        start = srt.timedelta_to_srt_timestamp(timedelta(seconds=segment["start"])).replace(",", ".")
        end = srt.timedelta_to_srt_timestamp(timedelta(seconds=segment["end"])).replace(",", ".")
        lines.append(f"{start} --> {end}")
        lines.append(segment["text"])
        lines.append("")
    vtt_path.write_text("\n".join(lines), encoding="utf-8")
    return srt_path, vtt_path


def coalesce_segments(segments, max_chars=240, max_duration=13.0, max_gap=1.0):
    merged = []
    current = None
    for segment in segments:
        text = segment["text"].strip()
        if not text:
            continue
        if current is None:
            current = {"start": segment["start"], "end": segment["end"], "text": text}
            continue

        projected_duration = segment["end"] - current["start"]
        projected_chars = len(current["text"]) + 1 + len(text)
        gap = segment["start"] - current["end"]

        if gap <= max_gap and projected_duration <= max_duration and projected_chars <= max_chars:
            current["end"] = segment["end"]
            current["text"] = f"{current['text']} {text}"
        else:
            merged.append(current)
            current = {"start": segment["start"], "end": segment["end"], "text": text}

    if current is not None:
        merged.append(current)
    return merged


async def synthesize_to_mp3(text: str, out_path: Path, locale: str):
    config = VOICE_CONFIG[locale]
    communicate = edge_tts.Communicate(text, config["voice"], rate=config["rate"])
    await communicate.save(str(out_path))


def fit_audio(audio: AudioSegment, target_ms: int):
    if target_ms <= 0:
        return audio, 1.0
    original_ms = len(audio)
    factor = 1.0
    if original_ms > int(target_ms * 1.02):
        factor = min((original_ms / target_ms) * 1.03, 1.33)
        audio = speedup(audio, playback_speed=factor, chunk_size=120, crossfade=20)
    if len(audio) > target_ms:
        audio = audio[:target_ms]
    if len(audio) < target_ms:
        audio = audio + AudioSegment.silent(duration=target_ms - len(audio))
    return audio, factor


def backup_if_exists(path: Path):
    if path.exists():
        backup = path.with_name(f"{path.stem}.pre-premium-backup{path.suffix}")
        if not backup.exists():
            try:
                os.link(path, backup)
            except OSError:
                try:
                    shutil.copy2(path, backup)
                except OSError:
                    print(f"Skipping backup for {path} because there is not enough free space.")


def sync_to_container(source_dir: Path, container_dir: str):
    run(["docker", "exec", "-u", "0", "pestsense_app", "mkdir", "-p", container_dir])
    run(["docker", "cp", f"{source_dir}/.", f"pestsense_app:{container_dir}"])


def update_lesson_locales(lesson_slugs, locale, media_root):
    video_url = f"/course-guides/i18n-media/{media_root}/{locale}-dubbed.mp4"
    subtitle_url = f"/course-guides/i18n-media/{media_root}/{locale}-subtitles.vtt"
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            for lesson_slug in lesson_slugs:
                cur.execute(
                    """
                    SELECT l.id,
                           COALESCE(ll.title, l.title),
                           COALESCE(ll.summary, l.summary),
                           COALESCE(ll.content, l.content)
                    FROM "Lesson" l
                    LEFT JOIN "LessonLocale" ll
                      ON ll."lessonId" = l.id
                     AND ll.locale = %s
                    WHERE l.slug = %s
                    """,
                    (locale, lesson_slug),
                )
                row = cur.fetchone()
                if not row:
                    raise RuntimeError(f"Lesson not found for slug {lesson_slug}")
                lesson_id, title, summary, content = row
                cur.execute(
                    """
                    INSERT INTO "LessonLocale"
                      ("id", "lessonId", "locale", "status", "title", "summary", "content", "videoUrl", "videoProvider", "subtitleUrl", "createdAt", "updatedAt")
                    VALUES
                      (%s, %s, %s, 'PUBLISHED', %s, %s, %s, %s, 'local', %s, NOW(), NOW())
                    ON CONFLICT ("lessonId", "locale")
                    DO UPDATE SET
                      "status" = 'PUBLISHED',
                      "title" = EXCLUDED."title",
                      "summary" = EXCLUDED."summary",
                      "content" = EXCLUDED."content",
                      "videoUrl" = EXCLUDED."videoUrl",
                      "videoProvider" = EXCLUDED."videoProvider",
                      "subtitleUrl" = EXCLUDED."subtitleUrl",
                      "updatedAt" = NOW()
                    """,
                    (uuid.uuid4().hex, lesson_id, locale, title, summary, content, video_url, subtitle_url),
                )
        conn.commit()


def write_review(out_dir: Path, locale: str, profile_name: str, duration: float, groups, source_video: Path):
    payload = {
        "profile": profile_name,
        "locale": locale,
        "source_video": str(source_video),
        "video_duration_seconds": duration,
        "voice": VOICE_CONFIG[locale]["voice"],
        "rate": VOICE_CONFIG[locale]["rate"],
        "dub_groups": groups,
    }
    (out_dir / f"premium-review-{locale}.json").write_text(
        json.dumps(payload, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


async def generate_profile(profile_name: str, locale: str, publish: bool, sync_container: bool):
    profile = PROFILES[profile_name]
    media_root = profile["media_root"]
    source_video = ensure_source_video(profile)

    premium_dir = PREMIUM_ROOT / media_root
    live_dir = LIVE_ROOT / media_root
    premium_dir.mkdir(parents=True, exist_ok=True)
    duration = ffprobe_duration(source_video)

    en_srt, en_vtt = write_subtitles(profile["segments"], premium_dir / "en-premium-subtitles")
    localized_segments = translate_segments(locale, profile["segments"])
    localized_srt, localized_vtt = write_subtitles(localized_segments, premium_dir / f"{locale}-premium-subtitles")

    groups = coalesce_segments(localized_segments)
    master = AudioSegment.silent(duration=int(duration * 1000) + 500)
    review_rows = []

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)
        for idx, group in enumerate(groups, start=1):
            temp_mp3 = tmpdir_path / f"group-{locale}-{idx:02d}.mp3"
            await synthesize_to_mp3(group["text"], temp_mp3, locale)
            audio = AudioSegment.from_file(temp_mp3)
            target_ms = int((group["end"] - group["start"]) * 1000)
            fitted_audio, factor = fit_audio(audio, target_ms)
            master = master.overlay(fitted_audio, position=int(group["start"] * 1000))
            review_rows.append(
                {
                    "group": idx,
                    "start": group["start"],
                    "end": group["end"],
                    "target_ms": target_ms,
                    "raw_audio_ms": len(audio),
                    "fitted_audio_ms": len(fitted_audio),
                    "speed_factor": round(factor, 3),
                    "text": group["text"],
                }
            )

    dub_audio_path = premium_dir / f"{locale}-premium-dub-audio.mp3"
    dubbed_video_path = premium_dir / f"{locale}-premium-dubbed.mp4"
    master.export(dub_audio_path, format="mp3", bitrate="192k")

    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(source_video),
            "-i",
            str(dub_audio_path),
            "-map",
            "0:v:0",
            "-map",
            "1:a:0",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            str(dubbed_video_path),
        ]
    )

    write_review(premium_dir, locale, profile_name, duration, review_rows, source_video)

    if publish:
        live_dir.mkdir(parents=True, exist_ok=True)
        live_video = live_dir / f"{locale}-dubbed.mp4"
        live_srt = live_dir / f"{locale}-subtitles.srt"
        live_vtt = live_dir / f"{locale}-subtitles.vtt"
        live_audio = live_dir / f"{locale}-dub-audio.mp3"

        for path in (live_video, live_srt, live_vtt, live_audio):
            backup_if_exists(path)

        live_video.write_bytes(dubbed_video_path.read_bytes())
        live_srt.write_bytes(localized_srt.read_bytes())
        live_vtt.write_bytes(localized_vtt.read_bytes())
        live_audio.write_bytes(dub_audio_path.read_bytes())
        update_lesson_locales(profile["lesson_slugs"], locale, media_root)

    if sync_container:
        if publish:
            sync_to_container(live_dir, f"/app/public/course-guides/i18n-media/{media_root}")
        else:
            sync_to_container(premium_dir, f"/app/public/course-guides/i18n-media-premium/{media_root}")

    print(f"Generated premium media for {profile_name} {locale}")
    print("English subtitles:", en_srt, en_vtt)
    print("Localized subtitles:", localized_srt, localized_vtt)
    print("Localized dubbed video:", dubbed_video_path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--profile", required=True, choices=sorted(PROFILES.keys()))
    parser.add_argument("--locale", required=True, choices=sorted(VOICE_CONFIG.keys()))
    parser.add_argument("--publish", action="store_true")
    parser.add_argument("--sync-container", action="store_true")
    args = parser.parse_args()
    asyncio.run(generate_profile(args.profile, args.locale, args.publish, args.sync_container))


if __name__ == "__main__":
    main()

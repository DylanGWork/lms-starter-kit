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
import psycopg2
import srt
from pydub import AudioSegment
from pydub.effects import speedup


DB_URL = "postgresql://lms:change_this_password@127.0.0.1:5432/lms_platform"
LESSON_SLUG = "add-rodenticides-to-company-products"
VIDEO_PATH = Path("/home/dylan/pestsense-academy/app/public/course-guides/rodenticide/rodenticide-bait-setup-demo.mp4")
RAW_TRANSCRIPT_PATH = Path("/home/dylan/pestsense-academy/qa/transcripts/rodenticide-large-v3-raw.json")
OUT_DIR = Path("/home/dylan/pestsense-academy/app/public/course-guides/i18n-media-premium/add-rodenticides-to-company-products")
LIVE_DIR = Path("/home/dylan/pestsense-academy/app/public/course-guides/i18n-media/add-rodenticides-to-company-products")
CONTAINER_PUBLIC_DIR = "/app/public/course-guides/i18n-media-premium/add-rodenticides-to-company-products"
CONTAINER_LIVE_DIR = "/app/public/course-guides/i18n-media/add-rodenticides-to-company-products"

LOCALE_CONFIG = {
    "fr": {
        "voice": "fr-FR-VivienneMultilingualNeural",
        "rate": "+4%",
        "label": "French",
    },
    "es": {
        "voice": "es-ES-XimenaNeural",
        "rate": "+3%",
        "label": "Spanish",
    },
    "de": {
        "voice": "de-DE-SeraphinaMultilingualNeural",
        "rate": "+4%",
        "label": "German",
    },
}

SUBTITLE_SEGMENTS = [
    {
        "start": 0.00,
        "end": 6.24,
        "en": "This step is not very obvious, but these are the products that will now appear for your company.",
        "fr": "Cette étape n’est pas très évidente, mais ce sont les produits qui apparaîtront ensuite pour votre entreprise.",
        "es": "Este paso no es nada obvio, pero estos son los productos que ahora aparecerán para su empresa.",
        "de": "Dieser Schritt ist nicht besonders offensichtlich, aber das sind die Produkte, die jetzt für Ihr Unternehmen angezeigt werden.",
    },
    {
        "start": 11.20,
        "end": 19.20,
        "en": "Okay, that looks right. This is the screen for adding a new product.",
        "fr": "D’accord, cela semble correct. C’est bien l’écran pour ajouter un nouveau produit.",
        "es": "Vale, esto parece correcto. Esta es la pantalla para añadir un producto nuevo.",
        "de": "Gut, das sieht richtig aus. Das ist der Bildschirm zum Hinzufügen eines neuen Produkts.",
    },
    {
        "start": 23.44,
        "end": 30.40,
        "en": "Now look at the unit list: kilogram, kilometre, litre, metre.",
        "fr": "Regardez la liste des unités : kilogramme, kilomètre, litre, mètre.",
        "es": "Ahora mire la lista de unidades: kilogramo, kilómetro, litro, metro.",
        "de": "Schauen Sie sich jetzt die Einheitenliste an: Kilogramm, Kilometer, Liter, Meter.",
    },
    {
        "start": 31.28,
        "end": 40.48,
        "en": "There is some inconsistent spelling here. These labels really should be cleaned up.",
        "fr": "Il y a ici une incohérence dans les libellés. Ils devraient vraiment être harmonisés.",
        "es": "Aquí hay una inconsistencia en los nombres. Estos términos realmente deberían limpiarse.",
        "de": "Hier gibt es eine inkonsistente Beschriftung. Diese Begriffe sollten wirklich vereinheitlicht werden.",
    },
    {
        "start": 42.40,
        "end": 53.36,
        "en": "Let’s keep going and create the new rodenticide product. We’ll just call it Carrot.",
        "fr": "Continuons et créons le nouveau produit rodenticide. Nous allons simplement l’appeler Carrot.",
        "es": "Sigamos y creemos el nuevo producto rodenticida. Vamos a llamarlo simplemente Carrot.",
        "de": "Machen wir weiter und erstellen das neue Rodentizid-Produkt. Nennen wir es einfach Carrot.",
    },
    {
        "start": 55.60,
        "end": 65.92,
        "en": "We measure it in grams, per block, with a value of twenty-seven point five, and it is a chemical substance.",
        "fr": "Nous le mesurons en grammes, par bloc, avec une valeur de vingt-sept virgule cinq, et il s’agit d’une substance chimique.",
        "es": "Lo medimos en gramos por bloque, con un valor de veintisiete coma cinco, y es una sustancia química.",
        "de": "Wir messen es in Gramm pro Block, mit einem Wert von siebenundzwanzig Komma fünf, und es ist eine chemische Substanz.",
    },
    {
        "start": 67.60,
        "end": 78.40,
        "en": "For first, second, and third generation, the wording should probably be tidied up too. That is another bug worth logging.",
        "fr": "Pour première, deuxième et troisième génération, le libellé devrait aussi être clarifié. C’est un autre bug à signaler.",
        "es": "Para primera, segunda y tercera generación, el texto también debería quedar más claro. Es otro fallo que merece registrarse.",
        "de": "Für erste, zweite und dritte Generation sollte die Bezeichnung ebenfalls klarer sein. Das ist ein weiterer Fehler, den man melden sollte.",
    },
    {
        "start": 80.24,
        "end": 88.24,
        "en": "Here is the active ingredient field. The full list is available, but I am checking how it behaves.",
        "fr": "Voici le champ d’ingrédient actif. La liste complète est disponible, mais je vérifie comment il se comporte.",
        "es": "Aquí está el campo de ingrediente activo. La lista completa está disponible, pero estoy comprobando cómo se comporta.",
        "de": "Hier ist das Feld für den Wirkstoff. Die vollständige Liste ist verfügbar, aber ich prüfe gerade, wie es sich verhält.",
    },
    {
        "start": 89.84,
        "end": 97.92,
        "en": "Even for a non-toxic product, there is no obvious empty option for the active ingredient. Set the expiry to one week.",
        "fr": "Même pour un produit non toxique, il n’existe pas d’option vide évidente pour l’ingrédient actif. Réglez la durée de validité sur une semaine.",
        "es": "Incluso para un producto no tóxico, no hay una opción vacía clara para el ingrediente activo. Establezca la caducidad en una semana.",
        "de": "Selbst bei einem ungiftigen Produkt gibt es keine klare leere Option für den Wirkstoff. Stellen Sie die Haltbarkeit auf eine Woche.",
    },
    {
        "start": 98.24,
        "end": 104.48,
        "en": "Okay, save. The form now says: please fill out all required fields.",
        "fr": "Très bien, enregistrons. Le formulaire affiche maintenant : veuillez remplir tous les champs obligatoires.",
        "es": "Bien, guardemos. El formulario ahora dice: rellene todos los campos obligatorios.",
        "de": "Gut, speichern wir. Das Formular meldet jetzt: Bitte füllen Sie alle Pflichtfelder aus.",
    },
    {
        "start": 105.52,
        "end": 112.08,
        "en": "That is the bug. It will not let me save, and it does not really tell me why.",
        "fr": "C’est bien le bug. L’enregistrement est bloqué et le formulaire n’indique pas clairement pourquoi.",
        "es": "Ese es el error. No me deja guardar y en realidad no indica por qué.",
        "de": "Das ist der Fehler. Speichern ist nicht möglich, und es wird eigentlich nicht erklärt, warum.",
    },
    {
        "start": 114.80,
        "end": 116.96,
        "en": "Let’s add an active ingredient and try again.",
        "fr": "Ajoutons un ingrédient actif et essayons à nouveau.",
        "es": "Añadamos un ingrediente activo y probemos otra vez.",
        "de": "Fügen wir einen Wirkstoff hinzu und versuchen es noch einmal.",
    },
    {
        "start": 121.28,
        "end": 129.68,
        "en": "I have seen this before. I think this field does not accept decimals, so entering twenty-seven instead should let it continue.",
        "fr": "J’ai déjà vu ce cas. À mon avis, ce champ n’accepte pas les décimales, donc saisir vingt-sept devrait permettre de continuer.",
        "es": "Esto ya lo he visto antes. Creo que este campo no acepta decimales, así que introducir veintisiete debería permitir continuar.",
        "de": "Das habe ich schon einmal gesehen. Ich glaube, dieses Feld akzeptiert keine Dezimalstellen, also sollte die Eingabe von siebenundzwanzig das Weitergehen ermöglichen.",
    },
]

DUB_GROUPS = [
    [0],
    [1],
    [2],
    [3],
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
    [10],
    [11, 12],
]


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


def write_subtitles(locale: str, out_base: Path):
    subtitles = []
    for idx, segment in enumerate(SUBTITLE_SEGMENTS, start=1):
        subtitles.append(
            srt.Subtitle(
                index=idx,
                start=timedelta(seconds=segment["start"]),
                end=timedelta(seconds=segment["end"]),
                content=segment[locale],
            )
        )

    srt_path = out_base.with_suffix(".srt")
    vtt_path = out_base.with_suffix(".vtt")
    srt_path.write_text(srt.compose(subtitles), encoding="utf-8")

    lines = ["WEBVTT", ""]
    for segment in SUBTITLE_SEGMENTS:
        start = srt.timedelta_to_srt_timestamp(timedelta(seconds=segment["start"])).replace(",", ".")
        end = srt.timedelta_to_srt_timestamp(timedelta(seconds=segment["end"])).replace(",", ".")
        lines.append(f"{start} --> {end}")
        lines.append(segment[locale])
        lines.append("")
    vtt_path.write_text("\n".join(lines), encoding="utf-8")
    return srt_path, vtt_path


async def synthesize_to_mp3(text: str, out_path: Path, locale: str):
    config = LOCALE_CONFIG[locale]
    communicate = edge_tts.Communicate(text, config["voice"], rate=config["rate"])
    await communicate.save(str(out_path))


def fit_audio_to_window(audio: AudioSegment, target_ms: int):
    if target_ms <= 0:
        return audio, 1.0

    original_ms = len(audio)
    factor = 1.0
    if original_ms > int(target_ms * 1.02):
        factor = min((original_ms / target_ms) * 1.02, 1.30)
        audio = speedup(audio, playback_speed=factor, chunk_size=120, crossfade=20)

    if len(audio) > target_ms:
        audio = audio[:target_ms]

    if len(audio) < target_ms:
        audio = audio + AudioSegment.silent(duration=target_ms - len(audio))

    return audio, factor


def build_dub_groups(locale: str):
    groups = []
    for group_indices in DUB_GROUPS:
        entries = [SUBTITLE_SEGMENTS[idx] for idx in group_indices]
        groups.append(
            {
                "indices": group_indices,
                "start": entries[0]["start"],
                "end": entries[-1]["end"],
                "text": " ".join(entry[locale] for entry in entries),
            }
        )
    return groups


def load_raw_transcript():
    if not RAW_TRANSCRIPT_PATH.exists():
        return None
    return json.loads(RAW_TRANSCRIPT_PATH.read_text(encoding="utf-8"))


def write_review(locale: str, duration: float, review_rows, raw_transcript):
    config = LOCALE_CONFIG[locale]
    payload = {
        "locale": locale,
        "label": config["label"],
        "source_video": str(VIDEO_PATH),
        "video_duration_seconds": duration,
        "subtitle_segments": len(SUBTITLE_SEGMENTS),
        "dub_groups": len(review_rows),
        "voice": config["voice"],
        "rate": config["rate"],
        "raw_large_v3_transcript_present": bool(raw_transcript),
        "dub_segments": review_rows,
    }
    (OUT_DIR / f"premium-review-{locale}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def update_lesson_locale(locale: str, video_url: str, subtitle_url: str):
    with psycopg2.connect(DB_URL) as conn:
        with conn.cursor() as cur:
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
                (locale, LESSON_SLUG),
            )
            row = cur.fetchone()
            if not row:
                raise RuntimeError(f"Lesson not found for slug {LESSON_SLUG}")

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


def promote_live_assets(locale: str):
    LIVE_DIR.mkdir(parents=True, exist_ok=True)
    live_video = LIVE_DIR / f"{locale}-dubbed.mp4"
    live_srt = LIVE_DIR / f"{locale}-subtitles.srt"
    live_vtt = LIVE_DIR / f"{locale}-subtitles.vtt"
    live_audio = LIVE_DIR / f"{locale}-dub-audio.mp3"

    backup_if_exists(live_video)
    backup_if_exists(live_srt)
    backup_if_exists(live_vtt)
    backup_if_exists(live_audio)

    live_video.write_bytes((OUT_DIR / f"{locale}-large-v3-premium-dubbed.mp4").read_bytes())
    live_srt.write_bytes((OUT_DIR / f"{locale}-large-v3-premium-subtitles.srt").read_bytes())
    live_vtt.write_bytes((OUT_DIR / f"{locale}-large-v3-premium-subtitles.vtt").read_bytes())
    live_audio.write_bytes((OUT_DIR / f"{locale}-large-v3-premium-dub-audio.mp3").read_bytes())


def sync_to_container(source_dir: Path, container_dir: str):
    run(["docker", "exec", "-u", "0", "pestsense_app", "mkdir", "-p", container_dir])
    run(["docker", "cp", f"{source_dir}/.", f"pestsense_app:{container_dir}"])


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--locale", required=True, choices=sorted(LOCALE_CONFIG.keys()))
    parser.add_argument("--publish", action="store_true")
    parser.add_argument("--sync-container", action="store_true")
    args = parser.parse_args()

    locale = args.locale
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    duration = ffprobe_duration(VIDEO_PATH)
    raw_transcript = load_raw_transcript()

    en_srt, en_vtt = write_subtitles("en", OUT_DIR / "en-large-v3-premium-subtitles")
    localized_srt, localized_vtt = write_subtitles(locale, OUT_DIR / f"{locale}-large-v3-premium-subtitles")

    review_rows = []
    groups = build_dub_groups(locale)
    master = AudioSegment.silent(duration=int(duration * 1000) + 500)

    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)
        for idx, group in enumerate(groups, start=1):
            temp_mp3 = tmpdir_path / f"group-{locale}-{idx:02d}.mp3"
            await synthesize_to_mp3(group["text"], temp_mp3, locale)
            audio = AudioSegment.from_file(temp_mp3)
            target_ms = int((group["end"] - group["start"]) * 1000)
            fitted_audio, factor = fit_audio_to_window(audio, target_ms)
            master = master.overlay(fitted_audio, position=int(group["start"] * 1000))
            review_rows.append(
                {
                    "group": idx,
                    "indices": group["indices"],
                    "start": group["start"],
                    "end": group["end"],
                    "target_ms": target_ms,
                    "raw_audio_ms": len(audio),
                    "fitted_audio_ms": len(fitted_audio),
                    "speed_factor": round(factor, 3),
                    "text": group["text"],
                }
            )

    dub_audio_path = OUT_DIR / f"{locale}-large-v3-premium-dub-audio.mp3"
    dubbed_video_path = OUT_DIR / f"{locale}-large-v3-premium-dubbed.mp4"
    master.export(dub_audio_path, format="mp3", bitrate="192k")

    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(VIDEO_PATH),
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

    write_review(locale, duration, review_rows, raw_transcript)

    if args.publish:
        promote_live_assets(locale)
        update_lesson_locale(
            locale=locale,
            video_url=f"/course-guides/i18n-media/add-rodenticides-to-company-products/{locale}-dubbed.mp4",
            subtitle_url=f"/course-guides/i18n-media/add-rodenticides-to-company-products/{locale}-subtitles.vtt",
        )

    if args.sync_container:
        if args.publish:
            sync_to_container(LIVE_DIR, CONTAINER_LIVE_DIR)
        else:
            sync_to_container(OUT_DIR, CONTAINER_PUBLIC_DIR)

    print("Generated premium rodenticide localized media")
    print("Locale:", locale)
    print("English subtitles:", en_srt, en_vtt)
    print("Localized subtitles:", localized_srt, localized_vtt)
    print("Localized dubbed video:", dubbed_video_path)


if __name__ == "__main__":
    asyncio.run(main())

#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/dylan/pestsense-academy"
APP_ROOT="$ROOT/app"
MEDIA_SITE_PACKAGES="$ROOT/.venv-media/lib/python3.11/site-packages"
LOG_DIR="$ROOT/qa"
TIMESTAMP="$(date +%Y-%m-%d-%H%M%S)"

mkdir -p "$LOG_DIR"

echo "[1/3] Filling missing module and lesson locales..."
"$ROOT/.venv-media/bin/python" "$APP_ROOT/scripts/fill_missing_locales.py" \
  | tee "$LOG_DIR/${TIMESTAMP}-fill-missing-locales.log"

echo "[2/3] Generating subtitle and dubbed media variants..."
PYTHONPATH="$MEDIA_SITE_PACKAGES" \
python3 "$APP_ROOT/scripts/generate_localized_media.py" \
  | tee "$LOG_DIR/${TIMESTAMP}-generate-localized-media.log"

echo "[3/3] Running multilingual dogfood review..."
"$ROOT/.venv-media/bin/python" "$APP_ROOT/scripts/run_multilingual_dogfood.py" \
  | tee "$LOG_DIR/${TIMESTAMP}-multilingual-dogfood.log"

echo "Multilingual rollout pipeline complete."

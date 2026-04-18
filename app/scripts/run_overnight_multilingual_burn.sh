#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/dylan/pestsense-academy"
APP_ROOT="$ROOT/app"
VENV_PY="$ROOT/.venv-media/bin/python"
LOG_DIR="$ROOT/qa"
REVIEW_DIR="$ROOT/qa/reviews"
TIMESTAMP="$(date +%Y-%m-%d-%H%M%S)"
LOG_FILE="$LOG_DIR/${TIMESTAMP}-overnight-proof-of-concept-burn.log"

mkdir -p "$LOG_DIR" "$REVIEW_DIR"
if [[ "${PSX_NO_TEE:-0}" == "1" ]]; then
  exec >>"$LOG_FILE" 2>&1
else
  exec > >(tee -a "$LOG_FILE") 2>&1
fi

parse_json_field() {
  python3 -c 'import json,sys; print(json.load(sys.stdin)[sys.argv[1]])' "$1"
}

echo "[0/7] Starting overnight multilingual proof-of-concept burn"
echo "Log file: $LOG_FILE"

echo
echo "[1/7] Freezing baseline snapshot..."
BASELINE_OUTPUT="$("$VENV_PY" "$APP_ROOT/scripts/snapshot_multilingual_baseline.py" --label baseline)"
BASELINE_JSON="$(printf '%s\n' "$BASELINE_OUTPUT" | parse_json_field json)"
BASELINE_MD="$(printf '%s\n' "$BASELINE_OUTPUT" | parse_json_field md)"
echo "Baseline JSON: $BASELINE_JSON"
echo "Baseline MD: $BASELINE_MD"

echo
echo "[2/7] Generating localized flagship images..."
python3 "$APP_ROOT/scripts/localize_flagship_images.py"
docker exec -u 0 pestsense_app mkdir -p /app/public/course-guides/i18n
docker cp "$APP_ROOT/public/course-guides/i18n/." pestsense_app:/app/public/course-guides/i18n
echo "Localized flagship images synced to container."

echo
echo "[3/7] Filling targeted locale coverage and swapping localized image references..."
"$VENV_PY" "$APP_ROOT/scripts/fill_targeted_locales.py"

echo
echo "[4/7] Publishing premium localized customer-facing videos..."
for locale in fr es de; do
  echo "  - Rodenticide premium ($locale)"
  "$VENV_PY" "$APP_ROOT/scripts/generate_premium_rodenticide_fr.py" --locale "$locale" --publish --sync-container
done

for profile in product gateway switching; do
  for locale in fr es de; do
    echo "  - ${profile} premium ($locale)"
    "$VENV_PY" "$APP_ROOT/scripts/generate_premium_video_locales.py" --profile "$profile" --locale "$locale" --publish --sync-container
  done
done

echo
echo "[5/7] Running flagship multilingual dogfood sweep..."
DOGFOOD_OUTPUT="$("$VENV_PY" "$APP_ROOT/scripts/run_flagship_multilingual_dogfood.py")"
DOGFOOD_JSON="$(printf '%s\n' "$DOGFOOD_OUTPUT" | parse_json_field report_json)"
echo "Dogfood JSON: $DOGFOOD_JSON"

echo
echo "[6/7] Capturing final snapshot..."
FINAL_OUTPUT="$("$VENV_PY" "$APP_ROOT/scripts/snapshot_multilingual_baseline.py" --label final)"
FINAL_JSON="$(printf '%s\n' "$FINAL_OUTPUT" | parse_json_field json)"
FINAL_MD="$(printf '%s\n' "$FINAL_OUTPUT" | parse_json_field md)"
echo "Final JSON: $FINAL_JSON"
echo "Final MD: $FINAL_MD"

echo
echo "[7/7] Compiling morning report..."
"$VENV_PY" "$APP_ROOT/scripts/compile_overnight_burn_report.py" \
  --baseline "$BASELINE_JSON" \
  --final "$FINAL_JSON" \
  --dogfood "$DOGFOOD_JSON"

echo
echo "Overnight multilingual proof-of-concept burn complete."

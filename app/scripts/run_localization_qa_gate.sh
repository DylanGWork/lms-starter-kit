#!/usr/bin/env bash
set -euo pipefail

ROOT="/home/dylan/pestsense-academy"
PREFIX="${1:-$(date +%Y-%m-%d-%H%M)}"

export DOGFOOD_BASE_URL="${DOGFOOD_BASE_URL:-http://127.0.0.1:3000}"
export DOGFOOD_HOST="${DOGFOOD_HOST:-academy.gannannet.com}"
export DOGFOOD_EMAIL="${DOGFOOD_EMAIL:-rob.burley-jukes@pestsense.com}"
export DOGFOOD_PASSWORD="${DOGFOOD_PASSWORD:-RobGuide!26}"

"$ROOT/.venv-media/bin/python" "$ROOT/app/scripts/qa_localization_gate.py" --scope flagship --prefix "$PREFIX"

#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="${REPO_ROOT:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)}"
APP_DIR="${APP_DIR:-$REPO_ROOT/app}"
TRAINING_DIR="${TRAINING_DIR:-$HOME/training-assets}"
UPLOAD_VOLUME="${UPLOAD_VOLUME:-lms_starter_uploads_data}"
NETWORK_NAME="${NETWORK_NAME:-lms-starter-kit_default}"
DATABASE_URL="${DATABASE_URL:-postgresql://lms:change_this_password@postgres:5432/lms_platform}"
TRAINING_VIDEO_SOURCE_DIR="${TRAINING_VIDEO_SOURCE_DIR:-/workspace/training-videos}"

docker run --rm \
  --network "$NETWORK_NAME" \
  -v "$APP_DIR:/workspace" \
  -v "$UPLOAD_VOLUME:/workspace/uploads" \
  -v "$TRAINING_DIR:/workspace/training-videos" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e UPLOAD_DIR="/workspace/uploads" \
  -e TRAINING_VIDEO_SOURCE_DIR="$TRAINING_VIDEO_SOURCE_DIR" \
  -w /workspace \
  node:20 \
  sh -lc "./node_modules/.bin/ts-node --compiler-options '{\"module\":\"CommonJS\"}' scripts/import-training-drafts.ts"

#!/bin/bash
# Renders and mixes every format: out/CKEditor-Docs-launch-film.mp4 (16x9), -4x5.mp4 and -9x16.mp4.
# usage: scripts/render_all.sh [formats...]   e.g. SCALE=2 scripts/render_all.sh 9x16
# SCALE=2 renders at twice the resolution (files get a -2x suffix). Needs ffmpeg.
set -e
cd "$(dirname "$0")/.."
command -v ffmpeg >/dev/null || { echo "ffmpeg not found. Install it first: brew install ffmpeg" >&2; exit 1; }
FORMATS=${*:-16x9 4x5 9x16}
bash audio/build.sh # stems are shared by every format
for f in $FORMATS; do
  start=$(date +%s)
  echo "== $f (scale ${SCALE:-1})"
  FMT=$f bash scripts/scene.sh inside problem editor suggest team export logo
  FMT=$f bash scripts/mix.sh
  echo "== $f done in $(( ($(date +%s) - start) / 60 )) min"
done

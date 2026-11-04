#!/bin/bash
# Rebuilds every audio stem from the committed sources (no API calls): music, voice, sound effects.
set -e
cd "$(dirname "$0")/.."
mkdir -p out
python3 audio/music/build_music.py
python3 audio/vo/build_vo.py
node scripts/events.mjs
python3 audio/sfx/build_sfx.py
echo "stems ready: out/music_al.wav out/vo2.wav out/sfx_real.wav"

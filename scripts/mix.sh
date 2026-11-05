#!/bin/bash
# Ducks the music under the voice, adds the quiet keystrokes/clicks, normalises to -16 LUFS and muxes onto out/picture.mp4.
# FMT=4x5 / FMT=9x16 / SCALE=2 mux the matching picture from scripts/scene.sh instead (same soundtrack for every format).
set -e
cd "$(dirname "$0")/../out"
FMT=${FMT:-16x9}; SCALE=${SCALE:-1}
DIR=.; NAME=CKEditor-Docs-launch-film
case $FMT in 16x9) ;; 4x5|9x16) DIR=$FMT; NAME=$NAME-$FMT ;; *) echo "unknown FMT=$FMT" >&2; exit 1 ;; esac
[ "$SCALE" != 1 ] && DIR=$FMT-${SCALE}x && NAME=CKEditor-Docs-launch-film-$FMT-${SCALE}x
ffmpeg -v error -y -i music_al.wav -i vo2.wav -filter_complex "[1]anull[key];[0]acompressor=threshold=0.08:ratio=2.5:attack=50:release=400:makeup=1,volume=-5dB[m];[m][key]sidechaincompress=threshold=0.06:ratio=2.5:attack=60:release=600:makeup=1[md]" -map "[md]" music_duck.wav
ffmpeg -v error -y -i music_duck.wav -i sfx_real.wav -i vo2.wav -filter_complex "[1]volume=-7.2dB[fx];[0][fx][2]amix=inputs=3:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[mix]" -map "[mix]" -ar 48000 mix_final.wav
cp mix_final.wav ../public/soundtrack.wav
ffmpeg -v error -y -i $DIR/picture.mp4 -i mix_final.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -ar 48000 -movflags +faststart -shortest $NAME.mp4
echo "out/$NAME.mp4"

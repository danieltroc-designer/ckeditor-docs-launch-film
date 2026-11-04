#!/bin/bash
# Fast loop: re-render only the named scenes (with motion blur) and splice them into out/picture.mp4.
# usage: scripts/scene.sh problem [editor ...]     (no args = just re-assemble)
set -e
cd "$(dirname "$0")/.."
mkdir -p out/scenes
ORDER="inside problem editor suggest team export logo"
for id in "$@"; do
  # scenes with fast camera moves get 9 sub-frames per frame instead of 3 (set in HEAVY)
  M=3; COMP=FilmSub; TM="tmix=frames=3,select='eq(mod(n\\,3)\\,2)'"
  case " ${HEAVY:-suggest} " in *" $id "*) M=9; COMP=FilmSub9; TM="tmix=frames=6,select='eq(mod(n\\,9)\\,8)'";; esac
  read a b < <(node --input-type=module -e "import {STARTN,CUT} from './src/timeline.js'; console.log(STARTN['$id']*$M, (STARTN['$id']+CUT['$id'])*$M-1)")
  echo "render $id x$M sub-frames $a-$b"
  npx remotion render $COMP out/scenes/$id.sub.mp4 --frames=$a-$b --concurrency=1 --crf=12 --jpeg-quality=95 --log=error --props='{"audio":false}'
  ffmpeg -v error -y -i out/scenes/$id.sub.mp4 -vf "$TM,setpts=N/60/TB,format=yuv420p" -r 60 -an -c:v libx264 -preset medium -crf 10 out/scenes/$id.mp4
  rm -f out/scenes/$id.sub.mp4
done
[ -n "$NOASM" ] && exit 0
: > out/scenes/list.txt
for id in $ORDER; do echo "file '$id.mp4'" >> out/scenes/list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i out/scenes/list.txt -r 60 -an -c:v libx264 -preset slow -crf 16 -profile:v high -tune film -pix_fmt yuv420p -movflags +faststart out/picture.mp4
echo "picture: $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 out/picture.mp4) frames"

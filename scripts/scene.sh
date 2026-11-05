#!/bin/bash
# Fast loop: re-render only the named scenes (with motion blur) and splice them into the picture (out/picture.mp4 for 16x9).
# usage: scripts/scene.sh problem [editor ...]     (no args = just re-assemble)
# FMT=4x5 or FMT=9x16 renders that format (default 16x9, the approved master); SCALE=2 renders at twice
# the resolution. Output goes to out/ for 16x9 at scale 1, otherwise to out/<fmt>[-<scale>x]/.
# Scenes are split into chunks of about CHUNK sub-frames (default 900) that render in JOBS parallel
# processes (default: half the performance cores). Each process still renders with --concurrency=1,
# and every chunk starts on a whole film frame, so the motion-blur blend sees the same sub-frames.
# useMeasure measures layout on the first frame a browser renders, and some measured elements change
# during a scene, so every chunk first renders the scene's first frame, then the PRE sub-frames
# (default 18) just before its range, so Chrome's cached rasters of scaling elements match too.
# Those warm-up frames are dropped when joining, so each chunk matches a single render of the scene.
# RENDER_ONLY=1 stops after rendering the chunks (no ffmpeg needed); RESUME=1 keeps chunks that already
# finished and renders only the rest, then blends. Keep CHUNK, PRE, FMT and SCALE the same between the two.
# Portrait scenes listed in SOFTGL (default: team) render with --gl=swangle: with Chrome's default renderer
# the tall 3D stage of the 9x16 Team scene lost everything below a line after its pan (37.5-39.5 s). Swangle
# is several times slower, so other scenes keep the default renderer, and so does 16x9 (the approved master).
# GL=<renderer> (or GL= for the default) forces one renderer for every scene.
set -e
cd "$(dirname "$0")/.."
[ -n "$RENDER_ONLY" ] || command -v ffmpeg >/dev/null || { echo "ffmpeg not found. Install it first: brew install ffmpeg" >&2; exit 1; }
FMT=${FMT:-16x9}
SCALE=${SCALE:-1}
case $FMT in 16x9) SFX=""; OUT=out ;; 4x5|9x16) SFX="-$FMT"; OUT=out/$FMT ;; *) echo "unknown FMT=$FMT (use 16x9, 4x5 or 9x16)" >&2; exit 1 ;; esac
[ "$SCALE" != 1 ] && OUT=out/$FMT-${SCALE}x
SOFTGL=${SOFTGL-team}
mkdir -p $OUT/scenes/chunks
ORDER="inside problem editor suggest team export logo"
CHUNK=${CHUNK:-900}
PRE=${PRE:-18}
JOBS=${JOBS:-$(( ($(sysctl -n hw.perflevel0.physicalcpu 2>/dev/null || getconf _NPROCESSORS_ONLN) + 1) / 2 ))}

# scenes with fast camera moves get 9 sub-frames per frame instead of 3 (set in HEAVY)
params() {
  M=3; COMP=FilmSub$SFX; TM="tmix=frames=3,select='eq(mod(n\\,3)\\,2)'"
  case " ${HEAVY:-suggest} " in *" $1 "*) M=9; COMP=FilmSub9$SFX; TM="tmix=frames=6,select='eq(mod(n\\,9)\\,8)'";; esac
  CGL=${GL-}
  if [ -z "${GL+x}" ] && [ "$FMT" != 16x9 ]; then case " $SOFTGL " in *" $1 "*) CGL=swangle ;; esac; fi
}

render_chunk() { # <composition> <first>-<last> <output> <gl or ->
  local gl=$4; [ "$gl" = - ] && gl=
  npx remotion render "$BUNDLE" "$1" "$3" --frames="$2" --concurrency=1 --crf=12 --jpeg-quality=95 --scale="$SCALE" ${gl:+--gl=$gl} --log=error --props='{"audio":false}'
  touch "$3.ok"
  echo "  done $(basename "$3" .sub.mp4)"
}

if [ $# -gt 0 ]; then
  BUNDLE=out/bundle.$$
  trap 'rm -rf "$BUNDLE"' EXIT
  npx remotion bundle --out-dir="$BUNDLE" --log=error # one bundle shared by every chunk
  JOBLIST=$OUT/scenes/chunks/jobs.$$.txt
  : > "$JOBLIST"
  for id in "$@"; do
    params "$id"
    read a b < <(node --input-type=module -e "import {STARTN,CUT} from './src/timeline.js'; console.log(STARTN['$id']*$M, (STARTN['$id']+CUT['$id'])*$M-1)")
    # equal chunks of whole film frames (M sub-frames each), at most about CHUNK sub-frames
    len=$(( b - a + 1 )); k=$(( (len + CHUNK - 1) / CHUNK ))
    step=$(( ((len + k - 1) / k + M - 1) / M * M ))
    if [ -n "$RESUME" ]; then rm -f $OUT/scenes/chunks/$id.txt $OUT/scenes/chunks/$id.drop; else rm -f $OUT/scenes/chunks/$id.*; fi
    n=0; pos=0; drop=""
    for (( s=a; s<=b; s+=step )); do
      e=$(( s + step - 1 )); [ $e -gt $b ] && e=$b
      f=$OUT/scenes/chunks/$id.$(printf %03d $n).sub.mp4
      if [ $s -eq $a ]; then
        job="$COMP $s-$e $f ${CGL:--}"
      else # warm-up frames first: they sit at indices $pos..$pos+w of the joined stream
        p=$(( s - PRE )); [ $p -le $a ] && p=$(( a + 1 ))
        w=$(( s - p ))
        job="$COMP $a,$p-$e $f ${CGL:--}"
        drop="$drop${drop:++}between(n\\,$pos\\,$(( pos + w )))"; pos=$(( pos + 1 + w ))
      fi
      if [ -n "$RESUME" ] && [ -f "$f.ok" ]; then :; else echo "$job" >> "$JOBLIST"; fi
      pos=$(( pos + e - s + 1 ))
      echo "file '$(basename "$f")'" >> $OUT/scenes/chunks/$id.txt
      n=$(( n + 1 ))
    done
    if [ -n "$drop" ]; then printf '%s\n' "select='not($drop)'," > $OUT/scenes/chunks/$id.drop; else : > $OUT/scenes/chunks/$id.drop; fi
    echo "render $id x$M sub-frames $a-$b in $n chunks${CGL:+ (gl $CGL)}"
  done
  echo "rendering $(wc -l < "$JOBLIST" | tr -d ' ') chunks, $JOBS at a time"
  export BUNDLE SCALE
  export -f render_chunk
  if [ -s "$JOBLIST" ]; then xargs -P "$JOBS" -L 1 bash -c 'render_chunk "$@"' _ < "$JOBLIST"; fi
  rm -f "$JOBLIST"
  [ -n "$RENDER_ONLY" ] && { echo "chunks rendered in $OUT/scenes/chunks; run again with RESUME=1 to blend and join"; exit 0; }
  # join each scene's chunks, drop the warm-up frames, then blend the sub-frames into 60 fps (scenes in parallel)
  pids=""
  for id in "$@"; do
    params "$id"
    DROP=$(cat $OUT/scenes/chunks/$id.drop)
    (
      ffmpeg -v error -y -f concat -safe 0 -i $OUT/scenes/chunks/$id.txt -c copy $OUT/scenes/$id.sub.mp4
      ffmpeg -v error -y -i $OUT/scenes/$id.sub.mp4 -vf "$DROP$TM,setpts=N/60/TB,format=yuv420p" -r 60 -an -c:v libx264 -preset medium -crf 10 $OUT/scenes/$id.mp4
      rm -f $OUT/scenes/$id.sub.mp4 $OUT/scenes/chunks/$id.*
    ) &
    pids="$pids $!"
  done
  for p in $pids; do wait $p; done
fi
[ -n "$NOASM" ] && exit 0
: > $OUT/scenes/list.txt
for id in $ORDER; do echo "file '$id.mp4'" >> $OUT/scenes/list.txt; done
ffmpeg -v error -y -f concat -safe 0 -i $OUT/scenes/list.txt -r 60 -an -c:v libx264 -preset slow -crf 16 -profile:v high -tune film -pix_fmt yuv420p -movflags +faststart $OUT/picture.mp4
echo "picture: $(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 $OUT/picture.mp4) frames"

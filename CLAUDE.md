# CLAUDE.md — CKEditor Docs launch film

Remotion (v4, React/JSX) project that renders a 60 s, 1920×1080, 60 fps product film. Read this before changing anything; most rules below exist because breaking them caused visible glitches.

## Commands

- `npm run studio`: Remotion Studio preview (composition `Film`).
- `npm run stills -- <dir> <frames> [scale]`: e.g. `npm run stills -- out/c 600,1800 0.5`. Frames are 60 fps film frames. Set `COMP=FilmSub` for 180 fps sub-frames. Then `bash scripts/sheet.sh <dir> 3 2 640` makes a labelled contact sheet.
- `npm run render:scene -- <id> [id...]`: renders those scenes with motion blur into `out/scenes/<id>.mp4` and assembles `out/picture.mp4`. Scene ids: `inside problem editor suggest team export logo`.
- `npm run audio` rebuilds the stems, then `npm run mix` produces `out/CKEditor-Docs-launch-film.mp4`.
- `npm run qa`: frame-by-frame shake scan. The known hits at about 20.6 s, 40.1 s and 59.9 s are fast camera moves and the final fade, not bugs.

## Fast iteration loop (keep it this way)

1. Make the change, then render **stills** of the affected frames and look at them (about 5 s).
2. Only then run `render:scene` for the scenes you touched. One scene takes about 3–12 min; all scenes take about 40 min.
3. If only audio changed, skip rendering: `npm run audio && npm run mix` (under 1 min).

## Time model (src/timeline.js)

- Scenes are authored in **DUR** units (`SCENES` beats × 36). Screen length is **CUT** (frames at 60 fps, multiples of 30 = 120 BPM beats, so cuts land on the music beat). `K[id] = CUT/DUR` stretches each scene. Sum of CUT must be 3600.
- Inside scenes, always use `useF()` (from `src/time.jsx`), never `useCurrentFrame()` directly. It returns the scene-local DUR frame and works for sub-frame compositions.
- `T.<scene>` holds all event timings (DUR units). Derived timings are computed in the blocks at the bottom of `timeline.js`.
- `secOf(id, frame)` converts to film seconds. `scripts/events.mjs` uses it to place keystroke/click sounds, so re-run `npm run audio` after timing changes.
- `START`/`DUR` also seed the camera drift. Changing a scene's beats changes the drift of later scenes slightly; changing only `CUT` does not.

## Rendering: motion blur and determinism (important)

- Motion blur is real temporal sampling: `FilmSub` renders 3 sub-frames per frame and ffmpeg blends them (`tmix`, 240° shutter). Scenes listed in `HEAVY` (default `suggest`) use `FilmSub9`, which renders 9 sub-frames and blends 6, for its fast camera moves.
- Large lateral window slides also use `SlideBlur` (ui.jsx), a horizontal SVG blur driven by a smoothed speed estimate. **The filter must stay always on.** Toggling it on and off, or using a noisy speed derivative, caused visible shaking.
- **Layout is measured at runtime** (`useMeasure` in ui.jsx) for cursor targets, scrolling, and where windows sit next to headlines (`headRight`). The hook explicitly loads every font weight before measuring. If you add a font or weight, add it to `SPECS` in `useMeasure`. Otherwise different render workers measure different layouts, which shows up as double exposures and soft, slightly offset frames.
- `scripts/scene.sh` renders with `--concurrency=1` per scene for the same reason. To use both cores, run two scene lists in parallel processes with `NOASM=1`, then run `bash scripts/scene.sh` with no args to assemble.
- Don't measure elements whose position is being animated. Measure fixed elements, or a hidden twin as in Team.jsx, and move things with transforms.

## Look and brand rules

- Background `#F5F2F7`, text/ink `#1C0038`, and the only accents are lime `#B0EB1D` and purple `#7F00FD` (`C` in theme.js). No gradients except the scroll-fade mask in the chat feed, no stock icons, no templates.
- Caption headlines all use `HL` from theme.js: Mulish 700, 80 px, line-height 1.15, left 150. Vertical position comes from `HTOP[lines]`.
- On every caption screen the app window sits `GAP` px after the longest headline line, at the same size as on the opening screen.
- The chat window is a **neutral, simplified desktop-app look**: grey window dots, generic icons, no ChatGPT/OpenAI logo or exact copy of their UI. AI suggestion and comment cards are authored by "ChatGPT" with a generic sparkle avatar (`AIAvatar`), not the real logo. Human replies (Anna) keep the person's avatar.
- The "before" scene (Problem.jsx) is light grey and fully desaturated (`filter: grayscale(1)`). Colour returns at the editor scene.
- The product name on screen is "CKEditor Docs". The voice line is written "CKEditor Docs" (take 1 chosen by the client).

## Audio

- **Voice:** `audio/vo/clips/f_<id>.wav` are the approved takes, placed by `audio/vo/offsets.json`. Every line must end before its scene's cut.
- **New voice takes:** run `ELEVENLABS_API_KEY=... python3 audio/tools/tts_v3.py BuaKXS4Sv1Mccaw3flfU <name> 0.5 [ids]`, then `python3 audio/tools/trim.py audio/vo/takes/<name>_<id>.mp3 audio/vo/clips/f_<id>.wav`.
  - The voice is Christina, on eleven_v3, with emotion tags in `lines.json`.
  - eleven_v3 often cuts off the last syllable. So each request appends a throw-away "… Thanks." after a pause, and `trim.py` cuts in that pause. Never trim with a plain silence threshold: it clips words that contain stop consonants ("document").
  - To check pronunciation (e.g. "CKEditor"), run the clip through ElevenLabs speech-to-text (`scribe_v1`, word timestamps) and look at the word timings.
- **Music:** `build_music.py` uses the two ElevenLabs tracks:
  - `main.mp3` (120 BPM) gives the mysterious intro from 0–7 s, which tape-stops into the rewind, and the launch track from 17.5 s, cut so its first kick lands exactly on the editor cut.
  - `before.mp3` is dull hold music, low-passed and mono, for the grey part.
  - Check beat alignment with `python3 audio/tools/kick.py <mono.wav>`.
- **Mix:** music is compressed, −5 dB and side-chain ducked by the voice; SFX at −7.2 dB; overall loudnorm −16 LUFS, true peak −1.5 dBTP. About 10 dB voice-to-music margin is the target.
- Never commit API keys. `.env` is git-ignored.

## QA checklist before handing over a render

1. Contact sheets of every scene (`npm run stills` + `scripts/sheet.sh`): check text overflow, overlaps and clipping.
2. Compare a few rendered frames with single stills of the same frames. They should differ only by compression and motion blur. A constant offset means a measurement problem.
3. Run `npm run qa` for shake, and look at fast moves at full resolution for double images.
4. Check audio levels with `ffmpeg -i out/CKEditor-Docs-launch-film.mp4 -af ebur128 -f null -`. Make sure voice lines end before cuts and every clip ends in silence (`audio/tools/endcheck.py`).

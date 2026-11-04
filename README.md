# CKEditor Docs — launch film

A 60-second, 1920×1080, 60 fps launch film for **CKEditor Docs in ChatGPT**, built entirely in code with [Remotion](https://www.remotion.dev). Every screen (chat window, editor, comments, export) is a React component, with no screen recordings and no stock assets.

The story: Anna drafts a travel policy in ChatGPT. Then the film rewinds to show how this used to go wrong (lost formatting, lost track, lost time), and comes back to show her editing the document, reviewing suggestions, sharing it with colleagues whose ChatGPTs leave suggestions, and exporting it to Word a day early.

## Quick start

```bash
npm install
npm run studio          # live preview in the browser (plays the final soundtrack)
npm run stills -- out/check 600,1800,3200 0.5   # quick stills of chosen frames
```

Full build:

```bash
npm run audio           # rebuild music / voice / sound-effect stems from audio/ (no API calls)
npm run render          # render all 7 scenes with motion blur -> out/picture.mp4 (~40 min on 2 cores)
npm run mix             # mix + mux -> out/CKEditor-Docs-launch-film.mp4
npm run qa              # scan the result for shaking between frames
```

Re-render a single scene after a change (the rest is reused from `out/scenes/`):

```bash
npm run render:scene -- suggest        # then: npm run mix
```

You need Node 18+, ffmpeg, and Python 3 with numpy, scipy and Pillow. To use a local Chrome, set `REMOTION_BROWSER=/path/to/chrome` (see `.env.example`).

## Structure

```
src/
  index.jsx        compositions: Film (60 fps), FilmSub (180 fps), FilmSub9 (540 fps) for motion blur
  Film.jsx         the 7 scenes in sequence + soundtrack
  timeline.js      ALL timing: scene lengths (CUT), authored timings (T), voice-free sync helpers
  theme.js         brand colours, fonts, easing, headline style (HL), camera helpers
  ui.jsx           shared UI: chat window, CKEditor Docs editor, comment cards, cursor, camera, measuring hook
  scenes/          Inside, Problem ("before"), EditorScene, Suggest, Team, Export, LogoScene
public/            fonts (woff2), split logo SVGs, soundtrack.wav (final mix, for Studio preview)
scripts/           scene.sh (render), stills.mjs, sheet.sh (contact sheets), events.mjs, mix.sh, qa_jitter.py
audio/
  vo/              lines.json (script with emotion tags), clips/ (final voice clips), offsets.json, build_vo.py
  music/           main.mp3 + before.mp3 (ElevenLabs music), composition plans, build_music.py
  sfx/             keystroke/click samples, tape rewind, build_sfx.py
  tools/           tts_v3.py (generate voice), trim.py (clean cuts), endcheck.py, kick.py (beat check)
```

## Credits

- **Voice:** "Christina" (ElevenLabs shared voice library), recorded with the eleven_v3 model.
- **Music and sound effects:** ElevenLabs music and sound-generation.
- **Fonts:** Mulish, Public Sans, Source Code Pro, Saira Semi Condensed and Tinos, all under the SIL Open Font License.

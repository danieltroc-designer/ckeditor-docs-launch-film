# CKEditor Docs — launch film

A 60-second, 60 fps launch film for **CKEditor Docs in ChatGPT**, built entirely in code with [Remotion](https://www.remotion.dev). Every screen (chat window, editor, comments, export) is a React component, with no screen recordings and no stock assets.

It comes in three formats from the same scenes:

| Format | Size | Composition | Notes |
|---|---|---|---|
| 16:9 | 1920×1080 | `Film` | The approved master |
| 4:5 | 1080×1350 | `Film-4x5` | Feed posts |
| 9:16 | 1080×1920 | `Film-9x16` | Stories, Reels, Shorts |

Each format can also render at twice the resolution (3840×2160, 2160×2700, 2160×3840).

The story: Anna drafts a travel policy in ChatGPT. Then the film rewinds to show how this used to go wrong (lost formatting, lost track, lost time), and comes back to show her editing the document, reviewing suggestions, sharing it with colleagues whose ChatGPTs leave suggestions, and exporting it to Word a day early.

## Getting started (macOS)

1. Install [Homebrew](https://brew.sh) if you don't have it (it asks for your Mac password):

   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. Install Node and ffmpeg, plus the Python packages the audio and QA scripts use:

   ```bash
   brew install node ffmpeg
   python3 -m pip install --user numpy scipy Pillow
   ```

3. Clone the project and install it:

   ```bash
   git clone https://github.com/danieltroc-designer/ckeditor-docs-launch-film.git
   cd ckeditor-docs-launch-film
   npm install
   ```

4. Open the live preview, then pick `Film`, `Film-4x5` or `Film-9x16` in the sidebar:

   ```bash
   npm run studio
   ```

The first render downloads Remotion's own Chrome. If that first `npm run stills` times out, run it again.

## Making a change

**Read [CLAUDE.md](CLAUDE.md) first.** It covers the brand rules, the time model, and why some layout is measured at runtime. Breaking those rules caused visible glitches before.

1. Edit the scene in `src/scenes/`, then check stills of the frames you touched. That takes seconds:

   ```bash
   npm run stills -- out/check 600,1800 0.5
   COMP=Film-9x16 npm run stills -- out/check-9x16 600,1800 0.5
   ```

   Frames are 60 fps film frames, so frame 1800 is 30 s.
2. The 16:9 master must stay exactly as approved. If you change shared code, compare 16:9 stills from before and after.
3. Render video only when the stills look right.

## Rendering

Render on AC power: on a low battery macOS throttled renders about 6×. Scenes render as parallel chunks; `JOBS=n` sets how many run at once.

```bash
npm run render:all                     # all three formats, rendered and mixed
SCALE=2 npm run render:all             # the same at twice the resolution
SCALE=2 npm run render:all -- 9x16     # one format only
```

Re-render only the scenes you changed. The other scenes are reused, so use the same `FMT` and `SCALE` for both commands:

```bash
npm run render:scene -- suggest && npm run mix                        # 16:9
FMT=9x16 SCALE=2 npm run render:scene -- team && FMT=9x16 SCALE=2 npm run mix
```

Finished films go into `out/`, which git ignores, so share them separately:

| Command | File |
|---|---|
| 16:9 | `out/CKEditor-Docs-launch-film.mp4` |
| 4:5, 9:16 | `out/CKEditor-Docs-launch-film-4x5.mp4`, `-9x16.mp4` |
| With `SCALE=2` | `out/CKEditor-Docs-launch-film-16x9-2x.mp4`, `-4x5-2x.mp4`, `-9x16-2x.mp4` |

On an M4 Pro, all three formats at 2× take roughly an hour and a half. Most of that is the portrait Team scene, which renders with Chrome's slower software renderer to avoid a 9:16 drawing bug (see CLAUDE.md). A single changed scene takes minutes.

Check a finished film with `npm run qa`, which runs the shake scan on the 16:9 file, or `python3 scripts/qa_jitter.py <file>` for any other file. CLAUDE.md lists the expected hits.

## Audio

`npm run audio` rebuilds the music, voice and sound-effect stems from the committed files, and `npm run mix` mixes them onto the picture. Neither needs an API key. Only recording new voice takes or music needs an ElevenLabs key, kept in `.env` (see `.env.example` and CLAUDE.md). Never commit keys.

## Structure

```
src/
  index.jsx        compositions: Film (60 fps), FilmSub (180 fps), FilmSub9 (540 fps) for motion blur,
                   each also as -4x5 and -9x16
  format.js        output formats: headline placement, window docking and camera helpers per format
  Film.jsx         the 7 scenes in sequence + soundtrack
  timeline.js      ALL timing: scene lengths (CUT), authored timings (T), voice-free sync helpers
  theme.js         brand colours, fonts, easing, headline style (HL), camera helpers
  ui.jsx           shared UI: chat window, CKEditor Docs editor, comment cards, cursor, camera, measuring hook
  scenes/          Inside, Problem ("before"), EditorScene, Suggest, Team, Export, LogoScene
public/            fonts (woff2), split logo SVGs, soundtrack.wav (final mix, for Studio preview)
scripts/           scene.sh (render), render_all.sh, stills.mjs, sheet.sh (contact sheets), events.mjs, mix.sh, qa_jitter.py
audio/
  vo/              lines.json (script with emotion tags), clips/ (final voice clips), offsets.json, build_vo.py
  music/           main.mp3 + before.mp3 (ElevenLabs music), composition plans, build_music.py
  sfx/             keystroke/click samples, tape rewind, build_sfx.py
  tools/           tts_v3.py (generate voice), trim.py (clean cuts), endcheck.py, kick.py (beat check)
```

To use a local Chrome instead of Remotion's, set `REMOTION_BROWSER=/path/to/chrome` (see `.env.example`).

## Credits

- **Voice:** "Christina" (ElevenLabs shared voice library), recorded with the eleven_v3 model.
- **Music and sound effects:** ElevenLabs music and sound-generation.
- **Fonts:** Mulish, Public Sans, Source Code Pro, Saira Semi Condensed and Tinos, all under the SIL Open Font License.

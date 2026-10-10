---
name: phone-video
description: Edit the user's talking-to-camera phone videos in video-studio. Use when the user brings new footage, wants a new video started, or asks to cut, trim, reorder, zoom, add captions, add full-screen graphics, music or sound effects, or render a video. Also triggers on "new video", "edit my video", "add a graphic when I say...", "fix the captions".
---

# Phone video editing

Everything lives in `video-studio/` (Remotion + ffmpeg + whisper.cpp). Run all commands from there. Full user docs: `video-studio/SETUP.md` ("Phone footage videos").

## The user

Not a coder. They film on their phone and describe edits in plain words. Keep replies short, no em dashes, no fluff. Make the edit, then say in a line or two what changed and what to look at in the preview. Don't explain code unless asked.

## Where things are

- `projects/<id>.ts`: the edit for one video, a `Talk` (type in `src/types.ts`). This is the file you change for almost every request.
- `public/<id>/footage/<name>.mp4`: imported clips. `<name>.json`: word timings `{ text, startMs, endMs }` in source-file time.
- `public/<id>/sfx/`, `music/`, `photos/`, `broll/`: extra media. Media and transcripts are gitignored, so in a cloud session they are usually absent; the files only exist on the user's computer.
- `src/TalkTimeline.tsx`: renderer. `src/components/`: graphic components (TitleCut, StatCut, PhotoCut).

## New video

Give the user these steps (they run them on their computer, where the footage is):

```
cd video-studio
npm run import <id> ~/path/IMG_1.MOV ~/path/IMG_2.MOV   # clips play in file-name order
npm run transcribe <id>                                  # word timings for captions
npm run rough-cut <id>                                   # writes projects/<id>.ts, cuts pauses and ums
npm run studio                                           # live preview
npm run render <id>                                      # out/<id>.mp4
```

Pick a short lowercase id with dashes, e.g. `rent-tips`. `rough-cut` refuses to overwrite an existing project unless given `--force`; after the first run, edit the project file directly. A looser cut: `npm run rough-cut <id> 1` (max pause in seconds).

If the user pastes footage or transcripts into a cloud session instead, put them in the same places and run the same scripts.

## Turning requests into edits

Each clip: `{ src, from, to, zoom?, focus?, volume?, captions?, graphics? }`. `from`/`to` are seconds in the source file. Clips play back to back, so the video's length is the sum of the clips.

| Request | Edit |
|---------|------|
| "cut the part where I say X" | Find X in the clip's `.json` (or the `// comment` on each line from rough-cut). Delete the line, or split it into two clips around the words. |
| "trim / tighten" | Move `from` later or `to` earlier. Leave about 0.1s before the first word and after the last. |
| "move this part earlier" | Reorder lines. |
| "zoom in here" | `zoom: 1.15` to `1.3`. Aim with `focus: [x, y]`, 0 to 1. Alternating zoom on consecutive clips hides jump cuts. |
| "show X when I say Y" | Find word Y in the `.json`. Put the graphic on the clip that contains it with `at = startMs/1000 - clip.from`. `for` is usually 1.2 to 2.5s. |
| "add a sound when..." | `sfx: 'sfx/<name>.wav'` on the graphic. The user preps the file with `scripts/sfx-prep.sh <file> <id> <name>`. |
| "music" | `music: { src: 'music/track.wav', volume: 0.08 }` at the top. Prep: `scripts/music-prep.sh <file> <id> [start_sec]`. Keep volume 0.05 to 0.12 under speech. |
| "fix a caption word" | Change only `text` in the `.json`, never the times. |
| "captions bigger / higher / other color" | `captionStyle`: `size` (default 80), `top` (default 1250 of 1920), `highlight`, `words` (per screen, default 3), `uppercase`. |
| "no captions here" | `captions: false` on the clip. Captions already hide under graphics unless the graphic has `captions: true`. |

Graphic types: `title` (`text`, `sub`, `color`), `stat` (`value`, `prefix`, `suffix`, `decimals`, `label`, `source`, `color`, counts up), `image` (`src`, `zoom`, `focus`), `clip` (`src`, `trim`). Colors come from `src/theme.ts` (`red #ff3b47`, `green #39d98a`).

If the user wants a graphic style that doesn't exist (a list, a quote card, a split screen, a meme-style text pop), add a component in `src/components/`, add its variant to the `Graphic` union in `src/types.ts`, and add a case to `GraphicBody` in `src/TalkTimeline.tsx`. Match the look of TitleCut and StatCut: same fonts, background and spring entrance.

## Before you finish

- `npx tsc --noEmit` must pass.
- When media is present, check a frame: `npx remotion still src/index.ts <id> out/check.png --frame=<n>` and look at it. In a cloud sandbox add `--browser-executable=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` (the path may differ; find it under `/opt/pw-browsers`).
- Commit project-file and code changes. Never commit footage, transcripts, music or sound effects.
- In a cloud session, the transcribe model download may be blocked (Hugging Face). Then the user runs `npm run transcribe` on their own computer. Project file edits still work without the media; missing clips show as placeholders.

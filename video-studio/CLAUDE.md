# Video Studio notes for Claude

- One video = `projects/<id>.ts` (a `Project` from `src/types.ts`) + media in `public/<id>/`. Register new projects in `projects/index.ts`.
- Cut duration is implicit: each cut runs until the next cut's `start`. Keep starts ascending.
- Missing media renders as a labeled placeholder, so the timeline always builds.
- When the user pastes `scripts/vo-timings.sh` output, map phrases to cuts using the script's read-through and update both `start` values and `public/<id>/captions.srt`.
- Typecheck with `npx tsc --noEmit`. In a sandbox without internet, render with `REMOTION_BROWSER=<path to chrome-headless-shell>`.
- Motion graphic clips for the Porzingis video come from `../long-covid-health/video/graphics` (render.mjs) and are copied into `public/porzingis/graphics/`.
- Never commit licensed media (Epidemic Sound audio, Getty photos). `.gitignore` covers the media folders.
- Phone-footage videos are `Talk` projects (`kind: 'talk'`, rendered by `src/TalkTimeline.tsx`). Clips play back to back; `from`/`to` are seconds in the source file. Graphic `at` is seconds into its clip.
- Word timings live in `public/<id>/footage/<name>.json` (source-file time). To place a graphic on a spoken word, find the word there and use `startMs/1000 - clip.from`. Fix misheard words by editing `text` only.
- `rough-cut.mjs` overwrites the project only with `--force`; after the first run, edit the project file directly.

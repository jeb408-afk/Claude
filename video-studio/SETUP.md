# Video Studio setup

Remotion builds the video from a project file. ffmpeg cleans the audio and finishes the export. Tella records your voiceover. Epidemic Sound supplies the music and sound effects.

```
Tella recording ─► tella-import.sh ─► vo.wav + aroll.mp4 ┐
Epidemic track  ─► music-prep.sh   ─► track.wav          ├─► Remotion (projects/<id>.ts) ─► render.sh ─► out/<id>.mp4
Epidemic SFX    ─► sfx-prep.sh     ─► sfx/*.wav          │
Photos, B-roll, motion graphics ─────────────────────────┘
```

## One-time setup

### 1. Install the tools
**Mac**
1. Install Homebrew from https://brew.sh (paste the command from that page into Terminal).
2. `brew install node ffmpeg git`

**Windows**
1. Install Git for Windows from https://git-scm.com. It includes Git Bash, which the scripts need.
2. In PowerShell: `winget install OpenJS.NodeJS.LTS Gyan.FFmpeg`
3. Run every command below in **Git Bash**.

Check: `node -v` (needs 18 or newer) and `ffmpeg -version` should both print a version.

### 2. Get the project
```
git clone https://github.com/jeb408-afk/Claude.git
cd Claude
git checkout claude/zen-lovelace-dt10gr
cd video-studio
npm install
```
The first render downloads a headless Chrome for Remotion (about 100 MB, one time only).

### 3. Open the preview
```
npm run studio
```
Your browser opens Remotion Studio at http://localhost:3000. Pick **porzingis** on the left. Grey dashed cards are placeholders: each one names the file it's waiting for.

### 4. Tella
1. Make an account at https://tella.tv.
2. Connect Tella to Claude: claude.ai → Settings → Connectors → Tella. Then Claude can trim mistakes, cut filler words and polish recordings in Tella for you.

### 5. Epidemic Sound
1. Subscribe at https://www.epidemicsound.com. Pick the plan that covers the platforms you post on.
2. Account → **Channels**: connect your TikTok, Instagram and YouTube accounts. This clears copyright claims on the music.
3. Download tracks as **WAV**. Under a voiceover, tracks without vocals and with a simple melody work best. If a track offers stems, the music-prep script takes one file, so download the full track or ask Claude to mix the stems you want into one file with ffmpeg.

Epidemic has no Claude connector, so downloading is manual.

## Making a video (every time)

All commands run from the `video-studio` folder.

### 1. Record the voiceover in Tella
- Read from `../long-covid-health/video/script.md` (the read-through section).
- Pause briefly between lines. The timing script uses those pauses.
- Camera on or off both work. If it's on, you can use the footage for `aroll` cuts.
- Trim mistakes in Tella (or ask Claude to with the connector), then **Download → MP4, 1080p**.

```
scripts/tella-import.sh ~/Downloads/<your-tella-file>.mp4 porzingis
```
This makes a clean, level voiceover (`public/porzingis/audio/vo.wav`) and a 9:16 copy of the video (`public/porzingis/aroll.mp4`).

### 2. Line the cuts up with your read
```
scripts/vo-timings.sh porzingis
```
It lists when each phrase starts. Copy those times into the `start:` values in `projects/porzingis.ts`, or paste the output to Claude and ask it to update the file. If it finds too many or too few phrases, change the pause length: `scripts/vo-timings.sh porzingis 0.5`.

Captions come from `public/porzingis/captions.srt`. Shift those times the same way (Claude can do this from the same output).

### 3. Add music and sound effects
```
scripts/music-prep.sh ~/Downloads/ES_<track>.wav porzingis 12
```
The last number is where in the track to start, in seconds. Skip slow intros this way.

```
scripts/sfx-prep.sh ~/Downloads/ES_<impact>.wav porzingis impact
scripts/sfx-prep.sh ~/Downloads/ES_<heartbeat>.wav porzingis heartbeat
scripts/sfx-prep.sh ~/Downloads/ES_<cash register>.wav porzingis cash
```
The names (impact, heartbeat, cash) match the `sfx` list in `projects/porzingis.ts`. Change `at:` to move a sound and `volume:` to change its level. Music level is `music.volume` (0.1 = quiet bed).

### 4. Add photos and B-roll
Save them under `public/porzingis/` with the names in `projects/porzingis.ts`:

| File | What |
|------|------|
| photos/kp-1.jpg | Full body, action |
| photos/kp-2.jpg | Standing, full height (the 7'3" ruler sits on top) |
| photos/kp-3.jpg | Shooting or dunking |
| photos/kp-bench.jpg | On the bench |
| photos/kp-close.jpg | Close-up |
| broll/couch.mp4 | Person resting (Pexels) |
| broll/waiting-room.mp4 | Empty waiting room (Pexels) |

Vertical photos look best. For horizontal ones, set `focus: [x, y]` on the cut (0 to 1) to choose where the crop centers, e.g. `focus: [0.6, 0.3]`.

### 5. Preview
`npm run studio`, then scrub through. Edits to `projects/porzingis.ts` show up live.

### 6. Render
```
npm run render porzingis
```
Output: `out/porzingis.mp4`. 1080x1920, 30fps, with audio leveled to -14 LUFS (the TikTok/Reels/Shorts target). Takes about 3 minutes.

### 7. Post
Upload `out/porzingis.mp4`. Paste the sources from the bottom of `script.md` into the caption.

## Starting a new video
1. Copy `projects/porzingis.ts` to `projects/<new-id>.ts` and change `id`.
2. Add it to the list in `projects/index.ts`.
3. Make `public/<new-id>/` with the same subfolders.

Or ask Claude: "start a new video project called X from this script."

## Phone footage videos (talking to camera)

For videos you film on your phone. Captions come from what you say, and graphics cut in full screen while your audio keeps playing.

### 1. Import your clips
AirDrop or copy the videos to your computer, then:
```
npm run import myvideo ~/Downloads/IMG_1234.MOV ~/Downloads/IMG_1235.MOV
```
This makes 1080x1920, steady 30fps copies in `public/myvideo/footage/`. Phones record in a format that drifts out of sync and won't preview in the browser, so always import first. Clips are used in file name order.

### 2. Make captions
```
npm run transcribe myvideo
```
Writes `footage/IMG_1234.json` next to each clip: every word with its timing. The first run downloads the speech model (about 500 MB, one time). On a Mac this needs Xcode tools: `xcode-select --install`.

A word came out wrong? Open the `.json` and fix the text, or tell Claude "change 'fourty' to 'forty' in myvideo". Timing stays the same.

### 3. Rough cut
```
npm run rough-cut myvideo
```
Writes `projects/myvideo.ts` with your pauses and "um"s cut out, one line per kept piece, with what you said next to it. Pauses longer than 0.5s get cut. For a looser cut: `npm run rough-cut myvideo 1`.

### 4. Edit
`npm run studio`, pick **myvideo**. Change `projects/myvideo.ts` and the preview updates live.

```ts
clips: [
  { src: 'footage/IMG_1234.mp4', from: 0.4, to: 3.1 },              // So today I want to talk about rent
  { src: 'footage/IMG_1234.mp4', from: 5.7, to: 8.4, zoom: 1.2,     // Most people think it's coffee
    graphics: [{ at: 1.5, for: 1.2, type: 'title', text: 'COFFEE?', sub: 'not the problem' }] },
  { src: 'footage/IMG_1235.mp4', from: 2.0, to: 6.5,
    graphics: [{ at: 0.3, for: 2, type: 'stat', value: 30, suffix: '%', label: 'of your paycheck', sfx: 'sfx/impact.wav' }] },
],
```

| To do this | Change |
|------------|--------|
| Cut a piece | Delete its line |
| Reorder | Move lines |
| Trim | Change `from` / `to` (seconds in the original file) |
| Punch in | `zoom: 1.2`, and `focus: [0.5, 0.3]` to aim it (0 to 1, left/top to right/bottom) |
| Mute a piece | `volume: 0` |
| Hide captions on a piece | `captions: false` |

Captions follow your edits automatically.

**Graphics** go inside a clip. `at` is seconds into that piece, `for` is how long it stays up. Your voice keeps playing underneath. Captions hide during a graphic unless you add `captions: true`. Add `sfx: 'sfx/name.wav'` for a sound on entry (prep it with `scripts/sfx-prep.sh`).

| type | Options |
|------|---------|
| title | `text`, `sub`, `color` |
| stat | `value`, `prefix`, `suffix`, `decimals`, `label`, `source`, `color` (counts up) |
| image | `src` (e.g. `photos/x.jpg`), `zoom`, `focus` |
| clip | `src` (any video, e.g. `broll/x.mp4`), `trim` |

**Caption look** is `captionStyle` at the top of the file: `highlight` (color of the word being said), `words` (how many on screen), `top` (height, out of 1920), `size`, `uppercase`.

**Music**: prep a track with `scripts/music-prep.sh <file> myvideo`, then add `music: { src: 'music/track.wav', volume: 0.08 }`.

Or tell Claude what you want ("put a big 30% on screen when I say thirty percent", "cut the part about my landlord") and it edits the file.

### 5. Render
```
npm run render myvideo
```
Output: `out/myvideo.mp4`.

## Cut types (projects/<id>.ts)
| type | What it shows |
|------|---------------|
| photo | Image with a slow push-in |
| broll | Stock video clip, muted |
| clip | Any video, e.g. a motion graphic |
| aroll | Your Tella camera footage, synced to the voiceover |
| stat | Built-in animated number: `value`, `prefix`, `suffix`, `label`, `source` |
| title | Built-in big title: `text`, `sub` |

Any cut can take `overlay` (a transparent .mov/.webm on top) and `captions: true/false`.

## Troubleshooting
- **"command not found: ffmpeg"**: step 1 didn't finish. Re-run the install and open a new terminal.
- **Windows: scripts won't run**: use Git Bash, not PowerShell.
- **"Permission denied" on a script**: `chmod +x scripts/*.sh`
- **Render can't launch Chrome**: point it at your own Chrome: `REMOTION_BROWSER="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" npm run render porzingis`

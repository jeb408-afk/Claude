# Porzingis / Long COVID video kit

- `script.md`: voiceover, 20-cut shot list, sources
- `captions.srt`: captions timed to the cuts
- `motion-graphics/`: 1080x1920, 30fps clips, file name = cut number from `script.md`
- `preview-reel.mp4`: all graphics back to back, for a quick look

Each clip runs ~0.5s longer than its cut so you have room to trim.

| File | Cut | Notes |
|------|-----|-------|
| s02_height.mov | 2 | Transparent (ProRes 4444). Put on the track above the Porzingis photo; line the bottom white tick up with his feet. Premiere, Resolve, Final Cut, AE |
| s02_height_greenscreen.mp4 | 2 | Same, for CapCut: Video > Remove BG > Chroma key, pick green |
| s04_pots.mp4 ... s20_endcard.mp4 | 4–20 | Full-screen, drop straight on the timeline |

Cuts 1, 3, 8, 18 = Porzingis photos. Cuts 9, 19 = stock B-roll.

## Changing a number or wording
Edit `graphics/scenes.html`, then:
```
cd graphics
npm install
node render.mjs ../motion-graphics            # all clips
node render.mjs ../motion-graphics s14_wages  # one clip
node render.mjs --stills stills               # quick PNG check
```
Needs Node 18+ and ffmpeg.

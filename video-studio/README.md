# Video Studio

Short-form vertical video pipeline: Remotion + ffmpeg + Tella + Epidemic Sound. Setup and the per-video workflow are in [SETUP.md](SETUP.md).

- `projects/<id>.ts`: the edit (cuts, audio, captions) for one video
- `public/<id>/`: that video's media. Photos, audio and music stay local and aren't committed.
- `scripts/`: ffmpeg steps (import Tella, prep music/SFX, voiceover timings, render + finish)
- `src/`: Remotion components

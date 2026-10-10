import type { Project } from '../src/types';

// Cut starts come from long-covid-health/video/script.md.
// After recording, run scripts/vo-timings.sh and update these to match your read.
export const porzingis: Project = {
  id: 'porzingis',
  end: 62,
  voiceover: 'audio/vo.wav',
  music: { src: 'music/track.wav', volume: 0.1 },
  captions: 'captions.srt',
  sfx: [
    { at: 8.5, src: 'sfx/impact.wav' },
    { at: 15, src: 'sfx/heartbeat.wav', volume: 0.6 },
    { at: 42, src: 'sfx/cash.wav', volume: 0.6 },
    { at: 49.3, src: 'sfx/impact.wav' },
  ],
  cuts: [
    { start: 0, type: 'photo', src: 'photos/kp-1.jpg', note: 'Porzingis full body, action' },
    { start: 2.5, type: 'photo', src: 'photos/kp-2.jpg', note: 'Porzingis standing, full height', overlay: 'graphics/s02_height.mov', captions: false },
    { start: 5, type: 'photo', src: 'photos/kp-3.jpg', note: 'Shooting or dunking' },
    { start: 8.5, type: 'clip', src: 'graphics/s04_pots.mp4' },
    { start: 11.5, type: 'clip', src: 'graphics/s05_definition.mp4' },
    { start: 15, type: 'clip', src: 'graphics/s06_heartrate.mp4' },
    { start: 19, type: 'clip', src: 'graphics/s07_plus30.mp4' },
    { start: 22, type: 'photo', src: 'photos/kp-bench.jpg', note: 'On the bench / sideline' },
    { start: 25, type: 'broll', src: 'broll/couch.mp4', note: 'Person resting on couch (Pexels)' },
    { start: 28, type: 'clip', src: 'graphics/s10_longcovid.mp4' },
    { start: 31, type: 'clip', src: 'graphics/s11_17m.mp4' },
    { start: 35, type: 'clip', src: 'graphics/s12_79.mp4' },
    { start: 38, type: 'clip', src: 'graphics/s13_workers.mp4' },
    { start: 42, type: 'clip', src: 'graphics/s14_wages.mp4' },
    { start: 46, type: 'clip', src: 'graphics/s15_cutler.mp4' },
    { start: 49, type: 'clip', src: 'graphics/s16_trillion.mp4' },
    { start: 52, type: 'clip', src: 'graphics/s17_over.mp4' },
    { start: 55, type: 'photo', src: 'photos/kp-close.jpg', note: 'Porzingis close-up' },
    { start: 58, type: 'broll', src: 'broll/waiting-room.mp4', note: 'Empty waiting room (Pexels)' },
    { start: 60, type: 'clip', src: 'graphics/s20_endcard.mp4' },
  ],
};

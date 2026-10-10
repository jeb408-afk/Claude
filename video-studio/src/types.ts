// A project is one video: a list of cuts on a single timeline plus audio layers.
// All src paths are relative to public/<project id>/.

type Base = {
  /** Cut start in seconds. A cut runs until the next cut's start (or project.end). */
  start: number;
  /** Shows the SRT caption over this cut. Defaults: on for photo/broll/aroll, off for graphics. */
  captions?: boolean;
  /** Transparent clip (ProRes 4444 .mov or VP9 .webm) layered on top of the cut. */
  overlay?: string;
  /** Short note shown on the placeholder card when src is missing. */
  note?: string;
};

export type Cut = Base &
  (
    | { type: 'photo'; src?: string; zoom?: [number, number]; focus?: [number, number] }
    | { type: 'broll'; src?: string; trim?: number }
    | { type: 'clip'; src: string; trim?: number }
    | { type: 'aroll' } // Tella recording, kept in sync with the voiceover
    | { type: 'stat'; value: number; prefix?: string; suffix?: string; decimals?: number; label: string; source?: string; color?: string }
    | { type: 'title'; text: string; sub?: string; color?: string }
  );

export type Sfx = { at: number; src: string; volume?: number };

export type Project = {
  id: string;
  end: number;
  voiceover?: string;
  /** Epidemic Sound track (prepped with scripts/music-prep.sh). */
  music?: { src: string; volume?: number; start?: number };
  captions?: string;
  sfx?: Sfx[];
  cuts: Cut[];
};

// A talk is a phone-footage video: your clips back to back, with captions from what you say
// and full-screen graphics that cut in while your audio keeps playing.
// All src paths are relative to public/<project id>/.

export type Graphic = {
  /** Seconds into this clip (after trimming) where the graphic appears. */
  at: number;
  /** How long it stays up, in seconds. */
  for: number;
  /** Keep captions on top of the graphic. Default off. */
  captions?: boolean;
  /** Sound effect that plays when the graphic appears, e.g. 'sfx/impact.wav'. */
  sfx?: string;
} & (
  | { type: 'title'; text: string; sub?: string; color?: string }
  | { type: 'stat'; value: number; prefix?: string; suffix?: string; decimals?: number; label: string; source?: string; color?: string }
  | { type: 'image'; src: string; zoom?: [number, number]; focus?: [number, number] }
  | { type: 'clip'; src: string; trim?: number }
);

export type Clip = {
  /** File in footage/, e.g. 'footage/IMG_1234.mp4'. */
  src: string;
  /** Keep the part of the file from this second... */
  from: number;
  /** ...to this second. */
  to: number;
  /** Punch in: 1 = full frame, 1.2 = 20% closer. */
  zoom?: number;
  /** Where the zoom points, 0..1 on each axis. Default center. */
  focus?: [number, number];
  /** 1 = as recorded, 0 = muted. */
  volume?: number;
  /** Default on. */
  captions?: boolean;
  graphics?: Graphic[];
};

export type Talk = {
  id: string;
  kind: 'talk';
  clips: Clip[];
  music?: { src: string; volume?: number; start?: number };
  captionStyle?: {
    /** Highlight color for the word being spoken. */
    highlight?: string;
    /** Max words on screen at once. */
    words?: number;
    /** Distance from the top, in px out of 1920. */
    top?: number;
    size?: number;
    uppercase?: boolean;
  };
};

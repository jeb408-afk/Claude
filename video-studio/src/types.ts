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

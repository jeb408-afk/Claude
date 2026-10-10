import { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, cancelRender, continueRender, delayRender, getStaticFiles, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { PhotoCut } from './components/PhotoCut';
import { Placeholder } from './components/Placeholder';
import { StatCut } from './components/StatCut';
import { TitleCut } from './components/TitleCut';
import { body, colors } from './theme';
import type { Clip, Graphic, Talk } from './types';

type Word = { text: string; startMs: number; endMs: number };

const present = new Set(getStaticFiles().map((f) => f.name));
const has = (p?: string): p is string => !!p && present.has(p);
const transcriptOf = (src: string) => src.replace(/\.[^.]+$/, '.json');

export const talkLength = (t: Talk) => t.clips.reduce((s, c) => s + Math.max(0, c.to - c.from), 0);

// Loads footage/<name>.json (from scripts/transcribe.mjs) for every clip that has one.
const useTranscripts = (dir: string, clips: Clip[]) => {
  const files = [...new Set(clips.map((c) => `${dir}/${transcriptOf(c.src)}`))].filter(has);
  const [words, setWords] = useState<Record<string, Word[]>>({});
  const [handle] = useState(() => (files.length ? delayRender('transcripts') : null));
  useEffect(() => {
    if (handle === null) return;
    Promise.all(files.map((f) => fetch(staticFile(f)).then((r) => r.json() as Promise<Word[]>).then((w) => [f, w] as const)))
      .then((pairs) => { setWords(Object.fromEntries(pairs)); continueRender(handle); })
      .catch((e) => cancelRender(e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);
  return (src: string) => words[`${dir}/${transcriptOf(src)}`] ?? [];
};

// Groups words into short pages: a new page after `max` words or a pause.
const paginate = (words: Word[], max: number) => {
  const pages: Word[][] = [];
  for (const w of words) {
    const page = pages[pages.length - 1];
    if (!page || page.length >= max || w.startMs - page[page.length - 1].endMs > 400) pages.push([w]);
    else page.push(w);
  }
  return pages;
};

const Captions: React.FC<{ words: Word[]; hidden: [number, number][]; style: NonNullable<Talk['captionStyle']> }> = ({ words, hidden, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = (frame / fps) * 1000;
  if (hidden.some(([a, b]) => ms >= a && ms < b)) return null;
  const pages = paginate(words, style.words ?? 3);
  const i = pages.findIndex((p, k) => ms >= p[0].startMs && ms < Math.min(pages[k + 1]?.[0].startMs ?? Infinity, p[p.length - 1].endMs + 600));
  if (i < 0) return null;
  const page = pages[i];
  const pop = Math.min(1, (ms - page[0].startMs) / 100);
  return (
    <div style={{ position: 'absolute', left: 60, right: 60, top: style.top ?? 1250, textAlign: 'center', fontFamily: body, fontWeight: 900, fontSize: style.size ?? 80, lineHeight: 1.1, color: colors.ink, WebkitTextStroke: '12px #000', paintOrder: 'stroke fill', textTransform: style.uppercase === false ? 'none' : 'uppercase', transform: `scale(${0.85 + 0.15 * pop})` }}>
      {page.map((w, k) => (
        <span key={k} style={{ color: ms >= w.startMs && ms < (page[k + 1]?.startMs ?? Infinity) ? style.highlight ?? '#ffd400' : undefined }}>{w.text.trim()} </span>
      ))}
    </div>
  );
};

const GraphicBody: React.FC<{ g: Graphic; dir: string }> = ({ g, dir }) => {
  const { fps } = useVideoConfig();
  switch (g.type) {
    case 'title':
      return <TitleCut {...g} />;
    case 'stat':
      return <StatCut {...g} />;
    case 'image':
      return has(`${dir}/${g.src}`) ? <PhotoCut src={`${dir}/${g.src}`} zoom={g.zoom} focus={g.focus} /> : <Placeholder kind="image" file={g.src} />;
    case 'clip':
      return has(`${dir}/${g.src}`)
        ? <OffthreadVideo src={staticFile(`${dir}/${g.src}`)} trimBefore={Math.round((g.trim ?? 0) * fps)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <Placeholder kind="clip" file={g.src} />;
  }
};

export const TalkTimeline: React.FC<Talk> = (talk) => {
  const { fps, durationInFrames } = useVideoConfig();
  const dir = talk.id;
  const wordsFor = useTranscripts(dir, talk.clips);
  const music = talk.music && has(`${dir}/${talk.music.src}`) ? talk.music : undefined;
  let cursor = 0;

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {talk.clips.map((clip, i) => {
        const from = cursor;
        const length = Math.round((clip.to - clip.from) * fps);
        cursor += length;
        if (length <= 0) return null;
        const graphics = clip.graphics ?? [];
        // Word times shifted so 0 = the start of this clip.
        const words = wordsFor(clip.src)
          .filter((w) => w.startMs >= clip.from * 1000 && w.startMs < clip.to * 1000)
          .map((w) => ({ ...w, startMs: w.startMs - clip.from * 1000, endMs: Math.min(w.endMs, clip.to * 1000) - clip.from * 1000 }));
        const hidden = graphics.filter((g) => !g.captions).map((g): [number, number] => [g.at * 1000, (g.at + g.for) * 1000]);
        const zoom = clip.zoom ?? 1;
        const [fx, fy] = clip.focus ?? [0.5, 0.5];
        return (
          <Sequence key={i} from={from} durationInFrames={length} name={`${i + 1} ${clip.src.split('/').pop()} ${clip.from}-${clip.to}`}>
            {has(`${dir}/${clip.src}`)
              ? <OffthreadVideo src={staticFile(`${dir}/${clip.src}`)} trimBefore={Math.round(clip.from * fps)} volume={clip.volume ?? 1} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transformOrigin: `${fx * 100}% ${fy * 100}%` }} />
              : <Placeholder kind="footage" file={clip.src} />}
            {graphics.map((g, k) => (
              <Sequence key={k} from={Math.round(g.at * fps)} durationInFrames={Math.max(1, Math.round(g.for * fps))} name={`graphic: ${g.type}`}>
                <GraphicBody g={g} dir={dir} />
                {g.sfx && has(`${dir}/${g.sfx}`) && <Audio src={staticFile(`${dir}/${g.sfx}`)} volume={0.8} />}
              </Sequence>
            ))}
            {clip.captions !== false && <Captions words={words} hidden={hidden} style={talk.captionStyle ?? {}} />}
          </Sequence>
        );
      })}
      {music && (
        <Audio
          src={staticFile(`${dir}/${music.src}`)}
          trimBefore={Math.round((music.start ?? 0) * fps)}
          volume={(f) => (music.volume ?? 0.08) * interpolate(f, [0, fps * 0.5, durationInFrames - fps * 1.5, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />
      )}
    </AbsoluteFill>
  );
};

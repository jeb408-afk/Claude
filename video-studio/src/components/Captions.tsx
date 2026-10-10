import { parseSrt, type Caption } from '@remotion/captions';
import { useEffect, useState } from 'react';
import { cancelRender, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { body } from '../theme';

export const useCaptions = (src?: string) => {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [handle] = useState(() => (src ? delayRender('captions') : null));
  useEffect(() => {
    if (!src || handle === null) return;
    fetch(staticFile(src))
      .then((r) => r.text())
      .then((t) => { setCaptions(parseSrt({ input: t }).captions); continueRender(handle); })
      .catch((e) => cancelRender(e));
  }, [src, handle]);
  return captions;
};

// One cue at a time, placed above the TikTok/Reels bottom UI.
export const CaptionLine: React.FC<{ captions: Caption[]; offsetMs: number }> = ({ captions, offsetMs }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ms = offsetMs + (frame / fps) * 1000;
  const cue = captions.find((c) => ms >= c.startMs && ms < c.endMs);
  if (!cue) return null;
  const age = ms - cue.startMs;
  const s = Math.min(1, age / 120);
  return (
    <div style={{ position: 'absolute', left: 70, right: 70, top: 1300, textAlign: 'center', fontFamily: body, fontWeight: 800, fontSize: 64, lineHeight: 1.15, color: '#fff', WebkitTextStroke: '10px #000', paintOrder: 'stroke fill', transform: `scale(${0.9 + 0.1 * s})` }}>
      {cue.text.trim()}
    </div>
  );
};

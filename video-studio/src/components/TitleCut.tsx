import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { background, body, colors, display } from '../theme';

export const TitleCut: React.FC<{ text: string; sub?: string; color?: string }> = ({ text, sub, color = colors.ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 11 } });
  const q = interpolate(frame, [10, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background, alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: colors.ink }}>
      <div style={{ fontFamily: display, fontSize: 230, lineHeight: 0.95, color, transform: `scale(${1.6 - 0.6 * s})`, opacity: Math.min(1, s * 3), padding: '0 60px', marginTop: -200 }}>{text}</div>
      {sub && <div style={{ fontFamily: body, fontWeight: 800, fontSize: 50, letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 40, opacity: q }}>{sub}</div>}
    </AbsoluteFill>
  );
};

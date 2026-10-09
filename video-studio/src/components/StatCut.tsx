import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { background, body, colors, display } from '../theme';

// Counter that eases up to value, with a label and an on-screen source.
export const StatCut: React.FC<{ value: number; prefix?: string; suffix?: string; decimals?: number; label: string; source?: string; color?: string }> = ({ value, prefix = '', suffix = '', decimals = 0, label, source, color = colors.ink }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = interpolate(frame, [4, fps * 1.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.exp) });
  const n = (value * p).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  const pop = spring({ frame, fps, config: { damping: 12 } });
  const rise = (delay: number) => {
    const q = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    return { opacity: q, transform: `translateY(${(1 - q) * 40}px)` };
  };
  const text = `${prefix}${n}${suffix}`;
  return (
    <AbsoluteFill style={{ background, alignItems: 'center', justifyContent: 'center', color: colors.ink, textAlign: 'center' }}>
      <div style={{ fontFamily: display, fontSize: Math.min(340, 1800 / text.length), color, transform: `scale(${0.85 + 0.15 * pop})`, marginTop: -200 }}>{text}</div>
      <div style={{ fontFamily: body, fontWeight: 800, fontSize: 52, letterSpacing: '.06em', textTransform: 'uppercase', padding: '0 80px', marginTop: 20, ...rise(14) }}>{label}</div>
      {source && <div style={{ position: 'absolute', top: 1440, fontFamily: body, fontWeight: 500, fontSize: 30, color: colors.muted, ...rise(20) }}>{source}</div>}
    </AbsoluteFill>
  );
};

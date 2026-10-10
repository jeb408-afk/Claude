import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';

// Slow push-in (Ken Burns). focus is the point the zoom moves toward, 0..1 on each axis.
export const PhotoCut: React.FC<{ src: string; zoom?: [number, number]; focus?: [number, number] }> = ({ src, zoom = [1.04, 1.14], focus = [0.5, 0.4] }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], zoom, { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill style={{ background: '#000', overflow: 'hidden' }}>
      <Img src={staticFile(src)} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale})`, transformOrigin: `${focus[0] * 100}% ${focus[1] * 100}%` }} />
    </AbsoluteFill>
  );
};

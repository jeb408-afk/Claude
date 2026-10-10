import { AbsoluteFill } from 'remotion';
import { body, colors, display } from '../theme';

// Stands in for media you haven't added yet, so the timeline always renders.
export const Placeholder: React.FC<{ kind: string; file?: string; note?: string }> = ({ kind, file, note }) => (
  <AbsoluteFill style={{ background: '#20262e', alignItems: 'center', justifyContent: 'center', gap: 24, border: `12px dashed ${colors.muted}` }}>
    <div style={{ fontFamily: display, fontSize: 140, color: colors.muted }}>{kind.toUpperCase()}</div>
    {note && <div style={{ fontFamily: body, fontSize: 48, fontWeight: 800, color: colors.ink, textAlign: 'center', padding: '0 80px' }}>{note}</div>}
    {file && <div style={{ fontFamily: 'monospace', fontSize: 34, color: colors.muted }}>{file}</div>}
  </AbsoluteFill>
);

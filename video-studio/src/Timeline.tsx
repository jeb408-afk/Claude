import { AbsoluteFill, Audio, getStaticFiles, interpolate, OffthreadVideo, Sequence, staticFile, useVideoConfig } from 'remotion';
import { CaptionLine, useCaptions } from './components/Captions';
import { PhotoCut } from './components/PhotoCut';
import { Placeholder } from './components/Placeholder';
import { StatCut } from './components/StatCut';
import { TitleCut } from './components/TitleCut';
import type { Cut, Project } from './types';

const present = new Set(getStaticFiles().map((f) => f.name));
const has = (p?: string): p is string => !!p && present.has(p);

const CutBody: React.FC<{ cut: Cut; dir: string; startFrame: number }> = ({ cut, dir, startFrame }) => {
  const { fps } = useVideoConfig();
  const f = (s?: string) => (s ? `${dir}/${s}` : undefined);
  switch (cut.type) {
    case 'photo':
      return has(f(cut.src)) ? <PhotoCut src={f(cut.src)!} zoom={cut.zoom} focus={cut.focus} /> : <Placeholder kind="photo" file={cut.src} note={cut.note} />;
    case 'broll':
    case 'clip':
      return has(f(cut.src))
        ? <OffthreadVideo src={staticFile(f(cut.src)!)} startFrom={Math.round((cut.trim ?? 0) * fps)} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <Placeholder kind={cut.type} file={cut.src} note={cut.note} />;
    case 'aroll':
      // Same clock as the voiceover: the Tella clip plays from this cut's timeline position.
      return has(f('aroll.mp4'))
        ? <OffthreadVideo src={staticFile(f('aroll.mp4')!)} startFrom={startFrame} muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <Placeholder kind="a-roll" file="aroll.mp4" note={cut.note} />;
    case 'stat':
      return <StatCut {...cut} />;
    case 'title':
      return <TitleCut {...cut} />;
  }
};

export const Timeline: React.FC<Project> = (project) => {
  const { fps, durationInFrames } = useVideoConfig();
  const dir = project.id;
  const captions = useCaptions(has(`${dir}/${project.captions}`) ? `${dir}/${project.captions}` : undefined);
  const music = project.music && has(`${dir}/${project.music.src}`) ? project.music : undefined;

  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {project.cuts.map((cut, i) => {
        const from = Math.round(cut.start * fps);
        const to = Math.round((project.cuts[i + 1]?.start ?? project.end) * fps);
        const showCaptions = cut.captions ?? ['photo', 'broll', 'aroll'].includes(cut.type);
        return (
          <Sequence key={i} from={from} durationInFrames={to - from} name={`${i + 1} ${cut.type}`}>
            <CutBody cut={cut} dir={dir} startFrame={from} />
            {cut.overlay && has(`${dir}/${cut.overlay}`) && (
              <AbsoluteFill><OffthreadVideo src={staticFile(`${dir}/${cut.overlay}`)} transparent muted /></AbsoluteFill>
            )}
            {showCaptions && <CaptionLine captions={captions} offsetMs={(from / fps) * 1000} />}
          </Sequence>
        );
      })}

      {project.voiceover && has(`${dir}/${project.voiceover}`) && <Audio src={staticFile(`${dir}/${project.voiceover}`)} />}
      {music && (
        <Audio
          src={staticFile(`${dir}/${music.src}`)}
          startFrom={Math.round((music.start ?? 0) * fps)}
          volume={(f) => (music.volume ?? 0.12) * interpolate(f, [0, fps * 0.5, durationInFrames - fps * 1.5, durationInFrames], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
        />
      )}
      {project.sfx?.filter((s) => has(`${dir}/${s.src}`)).map((s, i) => (
        <Sequence key={`sfx${i}`} from={Math.round(s.at * fps)} layout="none">
          <Audio src={staticFile(`${dir}/${s.src}`)} volume={s.volume ?? 0.8} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

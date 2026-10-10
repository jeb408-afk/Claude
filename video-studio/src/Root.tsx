import { Composition } from 'remotion';
import { projects } from '../projects';
import { TalkTimeline, talkLength } from './TalkTimeline';
import { Timeline } from './Timeline';
import './theme';

const FPS = 30;

export const Root: React.FC = () => (
  <>
    {projects.map((p) =>
      'kind' in p
        ? <Composition key={p.id} id={p.id} component={TalkTimeline} defaultProps={p} fps={FPS} width={1080} height={1920} durationInFrames={Math.max(1, Math.round(talkLength(p) * FPS))} />
        : <Composition key={p.id} id={p.id} component={Timeline} defaultProps={p} fps={FPS} width={1080} height={1920} durationInFrames={Math.round(p.end * FPS)} />,
    )}
  </>
);

import { Composition } from 'remotion';
import { projects } from '../projects';
import { Timeline } from './Timeline';
import './theme';

const FPS = 30;

export const Root: React.FC = () => (
  <>
    {projects.map((p) => (
      <Composition key={p.id} id={p.id} component={Timeline} defaultProps={p} fps={FPS} width={1080} height={1920} durationInFrames={Math.round(p.end * FPS)} />
    ))}
  </>
);

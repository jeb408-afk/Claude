import { porzingis } from './porzingis';
import type { Project, Talk } from '../src/types';

// Add each new video here. npm run rough-cut adds phone-footage projects for you.
export const projects: (Project | Talk)[] = [
  porzingis,
];

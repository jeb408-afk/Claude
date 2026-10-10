import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

// Fonts are bundled in public/fonts so renders don't depend on Google Fonts being reachable.
loadFont({ family: 'Anton', url: staticFile('fonts/anton.woff2') });
loadFont({ family: 'Inter', url: staticFile('fonts/inter.woff2'), weight: '100 900' });

export const display = 'Anton, Impact, sans-serif';
export const body = 'Inter, "Helvetica Neue", Arial, sans-serif';
export const colors = { bg: '#0a0c0f', bg2: '#1a1f26', ink: '#f5f5f2', muted: '#8d959e', red: '#ff3b47', green: '#39d98a' };
export const background = `radial-gradient(ellipse 90% 60% at 50% 38%, ${colors.bg2}, ${colors.bg} 72%)`;

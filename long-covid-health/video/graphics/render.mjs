// Renders every scene in scenes.html to 1080x1920 30fps video.
// Usage: node render.mjs [outDir] [sceneId...]
//   node render.mjs --stills outDir   one PNG per scene at its last frame (for checking layout)
// Opaque scenes -> H.264 .mp4. Alpha scenes -> ProRes 4444 .mov (transparent background).
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const FPS = 30;
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const stills = args[0] === '--stills';
if (stills) args.shift();
const outDir = path.resolve(args.shift() || path.join(here, 'out'));
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto('file://' + path.join(here, 'scenes.html'));
await page.evaluate(() => document.fonts.ready);
const scenes = await page.evaluate(() => window.SCENES);
const ids = args.length ? args : Object.keys(scenes);

for (const id of ids) {
  const { dur, alpha } = scenes[id];
  if (stills) {
    await page.evaluate(([i, t]) => window.renderFrame(i, t), [id, dur - 1 / FPS]);
    await page.screenshot({ path: path.join(outDir, id + '.png'), omitBackground: alpha });
    continue;
  }
  const file = path.join(outDir, id + (alpha ? '.mov' : '.mp4'));
  const enc = alpha
    ? ['-c:v', 'prores_ks', '-profile:v', '4444', '-pix_fmt', 'yuva444p10le', '-vendor', 'apl0']
    : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart'];
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', ...enc, '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c ? rej(new Error(id + ' ffmpeg exit ' + c)) : res())));
  const frames = Math.round(dur * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(([i, t]) => window.renderFrame(i, t), [id, f / FPS]);
    const png = await page.screenshot({ omitBackground: alpha });
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await done;
  console.log(`${id}: ${frames} frames -> ${path.basename(file)}`);
}
await browser.close();

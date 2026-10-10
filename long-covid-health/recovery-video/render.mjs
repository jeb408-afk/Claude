// Renders every scene in scenes.html to 1080x1920 30fps H.264, using your data.
// Usage:
//   node render.mjs [outDir] [sceneId...]   videos (default outDir: ./out)
//   node render.mjs --stills outDir          one PNG per scene, a few seconds in (for checking)
//   node render.mjs --images outDir          the still data images (crash, climb, scatter)
// Data: data/daily.csv (from the page's "Copy daily data as CSV") and data/config.json.
// Set CHROMIUM_PATH to use a specific browser binary.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const FPS = 30;
const here = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const stills = args[0] === '--stills';
const images = args[0] === '--images';
if (stills || images) args.shift();
const outDir = path.resolve(args.shift() || path.join(here, 'out'));
mkdirSync(outDir, { recursive: true });

const dataDir = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(here, 'data');
const DATA = {
  csv: readFileSync(path.join(dataDir, 'daily.csv'), 'utf8'),
  config: JSON.parse(readFileSync(path.join(dataDir, 'config.json'), 'utf8')),
};
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
await page.addInitScript(d => { window.DATA = d; }, DATA);
await page.goto('file://' + path.join(here, 'scenes.html'));
await page.evaluate(() => document.fonts.ready);
const scenes = await page.evaluate(() => window.SCENES);
const ids = args.length ? args : Object.keys(scenes).filter(k => !!scenes[k].image === images);

for (const id of ids) {
  const { dur } = scenes[id];
  if (images) {
    await page.evaluate(([i, t]) => window.renderFrame(i, t), [id, dur]);
    await page.screenshot({ path: path.join(outDir, id.replace(/^img_/, '') + '.png') });
    console.log(id);
    continue;
  }
  if (stills) {
    for (const frac of [0.35, 0.7, 0.98]) {
      await page.evaluate(([i, t]) => window.renderFrame(i, t), [id, dur * frac]);
      await page.screenshot({ path: path.join(outDir, `${id}_${Math.round(frac * 100)}.png`) });
    }
    continue;
  }
  const file = path.join(outDir, id + '.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', c => (c ? rej(new Error(id + ' ffmpeg exit ' + c)) : res())));
  const frames = Math.round(dur * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate(([i, t]) => window.renderFrame(i, t), [id, f / FPS]);
    const png = await page.screenshot();
    if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await done;
  console.log(`${id}: ${frames} frames -> ${path.basename(file)}`);
}
await browser.close();
if (errors.length) { console.error('Page errors:\n' + errors.join('\n')); process.exit(1); }

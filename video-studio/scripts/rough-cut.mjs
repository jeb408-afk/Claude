// Write a first edit for a phone-footage project: every clip in footage/, in name order,
// with pauses and "um"/"uh" cut out using the transcripts from transcribe.mjs.
//   node scripts/rough-cut.mjs myvideo [max_pause_seconds] [--force]
// Creates projects/<id>.ts and adds it to projects/index.ts. Won't overwrite without --force,
// since after this the project file is where your edits live.
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const force = args.includes('--force');
const [proj, pauseArg] = args.filter((a) => a !== '--force');
if (!proj) throw new Error('Usage: node scripts/rough-cut.mjs <project> [max_pause_seconds] [--force]');
const maxPause = Number(pauseArg ?? 0.5);
const pad = 0.12; // breathing room kept before and after speech, seconds
const filler = /^(um+|uh+|erm+|ah+|hmm+)[,.!?]*$/i;

const out = path.join(root, 'projects', `${proj}.ts`);
if (existsSync(out) && !force) throw new Error(`${path.relative(root, out)} exists. Add --force to replace it (your edits in it will be lost).`);

const dir = path.join(root, 'public', proj, 'footage');
const files = readdirSync(dir).filter((f) => f.endsWith('.mp4')).sort();
const r2 = (n) => Math.round(n * 100) / 100;
const lines = [];

for (const file of files) {
  const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path.join(dir, file)]).toString());
  const json = path.join(dir, file.replace(/\.mp4$/, '.json'));
  if (!existsSync(json)) {
    console.log(`${file}: no transcript, keeping the whole clip`);
    lines.push(`    { src: 'footage/${file}', from: 0, to: ${r2(duration)} },`);
    continue;
  }
  const words = JSON.parse(readFileSync(json, 'utf8')).filter((w) => !filler.test(w.text.trim()));
  const ranges = [];
  for (const w of words) {
    const s = w.startMs / 1000, e = w.endMs / 1000;
    const last = ranges[ranges.length - 1];
    if (last && s - last[1] <= maxPause) last[1] = Math.max(last[1], e);
    else ranges.push([s, e]);
  }
  for (const [s, e] of ranges) {
    const text = words.filter((w) => w.startMs / 1000 >= s && w.startMs / 1000 < e).map((w) => w.text.trim()).join(' ');
    lines.push(`    { src: 'footage/${file}', from: ${r2(Math.max(0, s - pad))}, to: ${r2(Math.min(duration, e + pad))} }, // ${text.slice(0, 70).replace(/\*\//g, '')}`);
  }
  console.log(`${file}: ${ranges.length} clips`);
}

const name = proj.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : '')).replace(/^\d/, '_$&');
writeFileSync(out, `import type { Talk } from '../src/types';

// Phone-footage edit. Each clip keeps one stretch of a file (from/to in seconds of that file).
// Delete a line to cut it, reorder lines to reorder, change from/to to trim.
// Add full-screen graphics to a clip with graphics: [...]; see SETUP.md for every option.
export const ${name}: Talk = {
  id: '${proj}',
  kind: 'talk',
  captionStyle: { highlight: '#ffd400', words: 3 },
  clips: [
${lines.join('\n')}
  ],
};
`);

const index = path.join(root, 'projects', 'index.ts');
let src = readFileSync(index, 'utf8');
if (!src.includes(`from './${proj}'`)) {
  src = `import { ${name} } from './${proj}';\n` + src.replace(/= \[\n/, `= [\n  ${name},\n`);
  writeFileSync(index, src);
}
console.log(`Wrote ${path.relative(root, out)}. Preview: npm run studio`);

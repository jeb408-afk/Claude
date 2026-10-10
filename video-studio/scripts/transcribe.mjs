// Transcribe every clip in public/<project>/footage with word timings, for captions.
//   node scripts/transcribe.mjs myvideo [model]
// Writes footage/<name>.json next to each clip. Clips that already have one are skipped,
// so fixing a misheard word in the .json is safe. Delete the .json to redo it.
// First run downloads whisper.cpp and the model into .whisper/ (one time, a few minutes).
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { downloadWhisperModel, installWhisperCpp, toCaptions, transcribe } from '@remotion/install-whisper-cpp';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const [proj, model = 'small.en'] = process.argv.slice(2);
if (!proj) throw new Error('Usage: node scripts/transcribe.mjs <project> [model]');
const dir = path.join(root, 'public', proj, 'footage');
const whisperPath = path.join(root, '.whisper');
const version = '1.7.6';

await installWhisperCpp({ to: whisperPath, version });
// A download that was cut off leaves a partial file that blocks the next try, so clear it on failure.
const modelFile = path.join(whisperPath, `ggml-${model}.bin`);
if (existsSync(modelFile) && statSync(modelFile).size < 1e6) rmSync(modelFile);
try {
  await downloadWhisperModel({ model, folder: whisperPath });
} catch (e) {
  rmSync(modelFile, { force: true });
  throw e;
}

for (const file of readdirSync(dir).filter((f) => f.endsWith('.mp4'))) {
  const out = path.join(dir, file.replace(/\.mp4$/, '.json'));
  if (existsSync(out)) { console.log(`skip ${file} (has transcript)`); continue; }
  console.log(`transcribing ${file}`);
  const wav = path.join(whisperPath, 'tmp.wav');
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', path.join(dir, file), '-ar', '16000', '-ac', '1', wav]);
  const result = await transcribe({ inputPath: wav, whisperPath, whisperCppVersion: version, model, modelFolder: whisperPath, tokenLevelTimestamps: true, splitOnWord: true });
  rmSync(wav);
  const { captions } = toCaptions({ whisperCppOutput: result });
  // One word per line keeps the file easy to read and fix by hand.
  const words = captions.filter((c) => c.text.trim()).map((c) => ({ text: c.text, startMs: c.startMs, endMs: c.endMs }));
  writeFileSync(out, '[\n' + words.map((w) => '  ' + JSON.stringify(w)).join(',\n') + '\n]\n');
  console.log(`  ${words.length} words -> ${path.relative(root, out)}`);
}
console.log(`Next: npm run rough-cut ${proj}`);

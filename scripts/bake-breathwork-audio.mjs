// =============================================================
// KALKI — BAKE-TIME BREATHWORK/DOOR AUDIO (Vol. 4 #12)
// -------------------------------------------------------------
// Zero-cost, run locally, no runtime dependency: narrations are
// generated at AUTHORING time and committed under public/audio/.
// The deployed site gains zero TTS infrastructure — <audio> tags
// point at static files.
//
// Pipeline per narration:
//   1. TTS via the z-ai CLI (z-ai-web-dev-sdk global install, voice
//      "jam", speed 0.95) → WAV 24 kHz mono (one request per script;
//      every script is pinned ≤1024 chars by the tests)
//   2. ffmpeg → MP3 mono 96 kbps (≈8× smaller than WAV; browsers
//      universally decode MP3; committed to the repo)
//
// NOTE ON CLOUDINARY: the roadmap suggested the existing uploader,
// but CLOUDINARY_URL exists only in Vercel's env — the honest
// zero-dependency path is committing the baked files under
// public/audio/ (same reason the restore drill runs from the repo).
// Scale path: rerun this script for new scripts; files are skipped
// unless --force.
//
// Usage:  node scripts/bake-breathwork-audio.mjs [--force] [--only <slug>]
// Needs:  z-ai CLI on PATH, ffmpeg on PATH.
// =============================================================

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  allNarrationScripts,
  TTS_VOICE,
  TTS_SPEED,
} from './breathwork-narrations.mjs';

const REPO = join(import.meta.dirname, '..');
const FORCE = process.argv.includes('--force');
const onlyIdx = process.argv.indexOf('--only');
const ONLY = onlyIdx !== -1 ? process.argv[onlyIdx + 1] : null;

function run(cmd, args, opts = {}) {
  execFileSync(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
}

function fileSize(p) {
  return statSync(p).size;
}

async function bake(item) {
  if (ONLY && item.slug !== ONLY) return;
  const outMp3 = join(REPO, item.outFile);
  const tmpWav = `/tmp/kalki-tts-${item.slug}.wav`;

  if (existsSync(outMp3) && !FORCE) {
    console.log(`↷ ${item.slug}: exists (${fileSize(outMp3)} bytes) — skipping (use --force)`);
    return;
  }

  if (item.script.length > 1024) {
    throw new Error(`${item.slug}: script is ${item.script.length} chars — exceeds the single-request TTS limit (shrink the script, do not chunk blind)`);
  }

  console.log(`🎙  ${item.slug}: ${item.script.length} chars → TTS (${TTS_VOICE}@${TTS_SPEED})`);
  // The CLI writes a WAV (24 kHz mono 16-bit) — response_format mp3 is
  // not supported by the TTS backend, hence the ffmpeg transcode below.
  run('z-ai', [
    'tts', '-i', item.script, '-o', tmpWav,
    '--voice', TTS_VOICE, '--speed', TTS_SPEED, '--format', 'wav',
  ]);

  if (!existsSync(tmpWav) || fileSize(tmpWav) < 1000) {
    throw new Error(`${item.slug}: TTS produced no/empty audio`);
  }

  mkdirSync(dirname(outMp3), { recursive: true });
  run('ffmpeg', [
    '-y', '-hide_banner', '-loglevel', 'error',
    '-i', tmpWav,
    '-codec:a', 'libmp3lame', '-b:a', '96k', '-ac', '1',
    '-metadata', `title=${item.title}`,
    '-metadata', 'album=KALKI — Audio Pilot',
    outMp3,
  ]);
  unlinkSync(tmpWav);

  if (!existsSync(outMp3) || fileSize(outMp3) < 10_000) {
    throw new Error(`${item.slug}: MP3 output missing/too small (${fileSize(outMp3)} bytes)`);
  }
  console.log(`✔  ${item.slug}: ${item.outFile} (${fileSize(outMp3)} bytes)`);
}

let failed = 0;
for (const item of allNarrationScripts) {
  try {
    await bake(item);
  } catch (error) {
    failed++;
    console.error(`✘ ${item.slug}:`, error.message);
  }
}

if (failed > 0) {
  console.error(`\nBAKE FAILED: ${failed} narration(s) did not bake`);
  process.exit(1);
}
console.log('\nBAKE COMPLETE');

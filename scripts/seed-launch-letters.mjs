#!/usr/bin/env node
// =============================================================
// KALKI — launch-letters seeder (Vol. 5 #6)
// -------------------------------------------------------------
// Seeds the five launch letters (content/launch-letters/) into
// the production letters archive as FOUNDER-REVIEW DRAFTS via
// POST /api/admin/letters. Idempotent: re-runs upsert in place.
//
//   node scripts/seed-launch-letters.mjs \
//     --base https://www.astrokalki.com \
//     --email archivist@kalki.mirror --password '...' [--publish]
//
// Default posture: isPublic:false (drafts — never public until the
// founder's explicit publish flip). --publish flips all five in the
// same call; the publish checklist is docs/letters-launch-checklist.md.
// =============================================================

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
function argOf(flag, fallback = undefined) {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const hasFlag = (flag) => args.includes(flag);

const BASE = (argOf('--base') || 'https://www.astrokalki.com').replace(/\/+$/, '');
const EMAIL = argOf('--email') || process.env.ADMIN_EMAIL;
const PASSWORD = argOf('--password') || process.env.ADMIN_PASSWORD;
const PUBLISH = hasFlag('--publish');

if (!EMAIL || !PASSWORD) {
  console.error('Usage: seed-launch-letters.mjs --base <url> --email <admin> --password <pw> [--publish]');
  process.exit(1);
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'launch-letters');
const manifest = JSON.parse(readFileSync(join(ROOT, 'manifest.json'), 'utf8'));

/** Strip leading `# key: value` metadata lines (single-hash only; the
 *  broadcast markup itself uses `## ` sections and `- ` bullets). */
function stripMeta(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  let i = 0;
  while (i < lines.length && /^# (?!#)/.test(lines[i])) i += 1;
  return lines.slice(i).join('\n').trim();
}

const letters = manifest.letters.map((entry) => ({
  slug: entry.slug,
  subject: entry.subject,
  body: stripMeta(readFileSync(join(ROOT, entry.file), 'utf8')),
  isPublic: PUBLISH,
}));

// ── Minimal cookie jar (NextAuth csrf → credentials → session) ──
const jar = new Map();
function absorb(res) {
  const cookies = res.headers.getSetCookie?.() ?? [];
  for (const c of cookies) {
    const [pair] = c.split(';');
    const eq = pair.indexOf('=');
    if (eq > 0) jar.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
  }
}
const cookieHeader = () => [...jar.entries()].map(([k, v]) => `${k}=${v}`).join('; ');

async function login() {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, { headers: { 'user-agent': 'kalki-seeder/1.0' } });
  absorb(csrfRes);
  const { csrfToken } = await csrfRes.json();
  const body = new URLSearchParams({ csrfToken, email: EMAIL, password: PASSWORD, json: 'true' });
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', cookie: cookieHeader(), 'user-agent': 'kalki-seeder/1.0' },
    body,
    redirect: 'manual',
  });
  absorb(res);
  if (!jar.has('next-auth.session-token') && !jar.has('__Secure-next-auth.session-token')) {
    throw new Error(`login failed (HTTP ${res.status}) — check credentials`);
  }
}

async function main() {
  console.log(`seeding ${letters.length} launch letters → ${BASE} (isPublic: ${PUBLISH})`);
  await login();

  const check = await fetch(`${BASE}/api/admin/letters`, { headers: { cookie: cookieHeader() } });
  if (!check.ok) throw new Error(`curation surface not reachable (HTTP ${check.status})`);

  const res = await fetch(`${BASE}/api/admin/letters`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: cookieHeader() },
    body: JSON.stringify({ letters }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`seed failed (HTTP ${res.status}): ${out.error ?? '?'}`);

  for (const row of out.letters ?? []) {
    console.log(`  ${row.created ? 'created' : 'updated '} ${row.slug}  isPublic=${row.isPublic}`);
  }
  console.log(PUBLISH
    ? 'published — verify /letters, /sitemap.xml, /feed.xml within one revalidation (≤1h).'
    : 'drafts seeded — founder review next (docs/letters-launch-checklist.md).');
}

main().catch((err) => {
  console.error('[seed-launch-letters]', err.message);
  process.exit(1);
});

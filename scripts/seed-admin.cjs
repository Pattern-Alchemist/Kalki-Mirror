#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Admin seeder (SUPERADMIN bootstrap)
   ---------------------------------------------------------------------------
   Usage:
     node scripts/seed-admin.cjs [email] [password]

   Target resolution (first match wins):
     1. TURSO_DATABASE_URL + TURSO_AUTH_TOKEN (env or .env.local) → PRODUCTION
     2. DATABASE_URL (env or .env.local)                          → local file
     3. file:./db/custom.db                                       → local file

   WHY THIS SCRIPT TALKS libSQL DIRECTLY (no Prisma client):
     The project uses the Prisma 7 `prisma-client` generator with a custom
     output (src/generated/prisma) — the legacy `require('@prisma/client')`
     entry point throws "Cannot find module '.prisma/client/default'" and
     the generated client is TypeScript, which a .cjs script cannot require.
     Direct libSQL + bcryptjs is the same pattern src/lib/auth.ts uses for
     credentials auth, so hashing and table access stay identical.

   Security notes:
     · Omitting [password] generates a strong random one and prints it ONCE.
       (The old hardcoded default lived in a public repository — anyone could
       read it; never seed production with a documented constant.)
     · Stamps `elevatedAt` on elevation so the Vol. 2 #12 2FA grace window
       anchors correctly — a null elevatedAt on an unenrolled elevated user
       reads as tampering in src/lib/admin/two-factor-policy.ts.
     · Rotating an existing admin's password is safe: the update branch
       never touches twoFactorEnabled / twoFactorSecret / backup codes.
   ═══════════════════════════════════════════════════════════════════════════ */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const REPO_ROOT = path.resolve(__dirname, '..');

// ── Minimal .env.local loader (no dotenv dependency) ────────────────────────
function loadEnvFile(file) {
  const out = {};
  try {
    const raw = fs.readFileSync(file, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (key && !(key in process.env)) out[key] = val;
    }
  } catch { /* file absent — fine */ }
  return out;
}

const envFile = loadEnvFile(path.join(REPO_ROOT, '.env.local'));
function env(name) { return process.env[name] || envFile[name] || ''; }

// ── libSQL client resolution (repo-local first, absolute path fallback) ─────
function loadLibSql() {
  try { return require('@libsql/client'); }
  catch {
    return require(path.join(REPO_ROOT, 'node_modules', '@libsql', 'client', 'lib-cjs', 'node.js'));
  }
}

// ── Resolve target DB ────────────────────────────────────────────────────────
const tursoUrl = env('TURSO_DATABASE_URL');
const tursoToken = env('TURSO_AUTH_TOKEN');
const localUrl = env('DATABASE_URL') || 'file:./db/custom.db';
const target = tursoUrl
  ? { url: tursoUrl, authToken: tursoToken || undefined, kind: 'PRODUCTION (Turso)' }
  : { url: localUrl, authToken: undefined, kind: 'LOCAL (SQLite)' };

// ── Args ─────────────────────────────────────────────────────────────────────
const email = (process.argv[2] || 'archivist@kalki.mirror').toLowerCase();
const provided = process.argv[3] || '';
const password = provided || (
  crypto.randomBytes(18).toString('base64url').slice(0, 24) + '!Aa1'
);

async function main() {
  const bcrypt = require('bcryptjs');
  const { createClient } = loadLibSql();

  const client = createClient({ url: target.url, authToken: target.authToken });
  const masked = target.url.replace(/\/\/[^@]+@/, '//***@');
  console.log(`[seed-admin] target: ${target.kind} — ${masked}`);

  const hash = await bcrypt.hash(password, 12);
  const now = new Date().toISOString();
  const id = 'c' + Date.now().toString(36) + crypto.randomBytes(9).toString('hex');

  // Upsert. On update: never clobber an existing elevation anchor — the 2FA
  // grace window is anchored to when the role was GRANTED, not re-seeded.
  await client.execute({
    sql: `INSERT INTO "User"
            (id, email, name, passwordHash, role, tier,
             goldKeysRemaining, twoFactorEnabled, elevatedAt, createdAt, updatedAt)
          VALUES (?, ?, ?, ?, 'SUPERADMIN', 'prithvi', 10, 0, ?, ?, ?)
          ON CONFLICT("email") DO UPDATE SET
            role        = 'SUPERADMIN',
            passwordHash = excluded.passwordHash,
            name         = excluded.name,
            elevatedAt   = COALESCE("User".elevatedAt, excluded.elevatedAt),
            updatedAt    = excluded.updatedAt`,
    args: [id, email, 'The Archivist', hash, now, now, now],
  });

  // Self-verify: read back + confirm the hash matches (proves write path).
  const res = await client.execute({
    sql: 'SELECT id, email, role, tier, twoFactorEnabled, elevatedAt, passwordHash FROM "User" WHERE email = ?',
    args: [email],
  });
  const row = res.rows[0];
  if (!row) throw new Error('seed failed: row not found after upsert');

  const ok = await bcrypt.compare(password, row.passwordHash);
  if (!ok) throw new Error('seed failed: bcrypt round-trip mismatch');

  console.log('[seed-admin] verified: bcrypt round-trip OK');
  console.log(`[seed-admin] email:            ${row.email}`);
  console.log(`[seed-admin] role:             ${row.role}`);
  console.log(`[seed-admin] twoFactorEnabled: ${Number(row.twoFactorEnabled) === 1}`);
  console.log(`[seed-admin] elevatedAt:       ${row.elevatedAt} (2FA grace ends +7d — Vol.2 #12)`);
  console.log(`[seed-admin] password:         ${password}`);
  if (!provided) console.log('[seed-admin] (random password — store it now; it is not persisted anywhere else)');
  client.close();
}

main().catch((e) => { console.error('[seed-admin] FAILED:', e.message); process.exit(1); });

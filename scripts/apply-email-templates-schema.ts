// =============================================================
// VOL. 2 #9 — Apply the EmailTemplate table to production Turso
// -------------------------------------------------------------
// Idempotent: CREATE TABLE IF NOT EXISTS. Run once after deploy.
// Usage: npx tsx scripts/apply-email-templates-schema.ts
// =============================================================

import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url || !token) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({ url, authToken: token });

const DDL = `
CREATE TABLE IF NOT EXISTS EmailTemplate (
  id        TEXT PRIMARY KEY NOT NULL,
  key       TEXT NOT NULL UNIQUE,
  subject   TEXT NOT NULL,
  body      TEXT NOT NULL,
  notes     TEXT,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS EmailTemplate_key_idx ON EmailTemplate(key);
`;

async function main() {
  console.log('Applying EmailTemplate schema to', url);
  const statements = DDL.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    try {
      await client.execute(stmt);
      console.log('✓', stmt.split('\n')[0].slice(0, 60));
    } catch (e) {
      console.error('✗', stmt.split('\n')[0].slice(0, 60), '—', e instanceof Error ? e.message : 'unknown');
    }
  }
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });

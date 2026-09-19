// =============================================================
// VOL. 2 #17 — Apply the Experiment table to production Turso
// -------------------------------------------------------------
// Idempotent: CREATE TABLE IF NOT EXISTS.
// Usage: npx tsx scripts/apply-experiment-schema.ts
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
CREATE TABLE IF NOT EXISTS Experiment (
  id          TEXT PRIMARY KEY NOT NULL,
  name        TEXT NOT NULL,
  hypothesis  TEXT NOT NULL,
  variants    TEXT NOT NULL,
  metric      TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'DRAFT',
  startDate   DATETIME,
  endDate     DATETIME,
  createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS Experiment_status_idx ON Experiment(status);
`;

async function main() {
  console.log('Applying Experiment schema to', url);
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

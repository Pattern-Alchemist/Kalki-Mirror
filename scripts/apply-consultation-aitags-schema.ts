// =============================================================
// VOL. 2 #11 — Add aiTags column to Consultation table
// -------------------------------------------------------------
// Idempotent ALTER TABLE ADD COLUMN (SQLite supports it without data loss).
// Usage: npx tsx scripts/apply-consultation-aitags-schema.ts
// =============================================================

import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url || !token) {
  console.error('Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({ url, authToken: token });

async function main() {
  console.log('Adding aiTags column to Consultation table at', url);
  try {
    // SQLite idempotent column add: try the ALTER; if it exists, the error
    // is "duplicate column name" which we treat as success.
    await client.execute('ALTER TABLE Consultation ADD COLUMN aiTags TEXT');
    console.log('✓ Column aiTags added.');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('duplicate column')) {
      console.log('✓ Column aiTags already exists — no-op.');
    } else {
      console.error('✗ Failed:', msg);
      process.exit(1);
    }
  }
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });

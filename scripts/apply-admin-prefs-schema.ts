// =============================================================
// VOL. 2 #20 — Add adminPrefs column to User table
// -------------------------------------------------------------
// Idempotent ALTER TABLE ADD COLUMN.
// Usage: npx tsx scripts/apply-admin-prefs-schema.ts
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
  console.log('Adding adminPrefs column to User table at', url);
  try {
    await client.execute('ALTER TABLE User ADD COLUMN adminPrefs TEXT');
    console.log('✓ Column adminPrefs added.');
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('duplicate column')) {
      console.log('✓ Column adminPrefs already exists — no-op.');
    } else {
      console.error('✗ Failed:', msg);
      process.exit(1);
    }
  }
  console.log('Done.');
}

main().catch(e => { console.error(e); process.exit(1); });

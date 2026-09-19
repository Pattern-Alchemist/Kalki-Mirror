// =============================================================
// PATH B #4 — Publish the 5 launch letters
// -------------------------------------------------------------
// The 5 letters were seeded as drafts (isPublic: 0) on Sep 8.
// The manifest confirms each letter grounds in verified site
// surfaces. This script flips all 5 to public (isPublic: 1)
// so the weekly digest cron can include them + the /letters
// archive renders them.
//
// Usage: npx tsx scripts/publish-launch-letters.ts
// =============================================================

import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const token = process.env.TURSO_AUTH_TOKEN;
if (!url || !token) { console.error('Missing env'); process.exit(1); }
const c = createClient({ url, authToken: token });

async function main() {
  const r = await c.execute({
    sql: "UPDATE Letter SET isPublic = 1 WHERE isPublic = 0",
    args: [],
  });
  console.log(`✅ Published ${r.rowsAffected} letters (isPublic: 0 → 1).`);

  const check = await c.execute('SELECT slug, subject, isPublic FROM Letter ORDER BY sentAt');
  console.log(`\nLetters now public: ${check.rows.filter(r => r.isPublic).length}/${check.rows.length}`);
  for (const row of check.rows) {
    console.log(`  ${row.isPublic ? '✓' : '✗'} ${row.slug} — "${row.subject}"`);
  }

  console.log(`\n🔍 Verify at: https://www.astrokalki.com/letters`);
  console.log(`📧 Weekly digest cron (Mon 17:30 IST) will now include these letters.`);
}

main().catch(e => { console.error(e); process.exit(1); });

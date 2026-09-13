/* Vol. 6 Week C schema delta — applied via libSQL directly (Prisma 7 CLI P1013 on libsql://).
 *
 * Adds the campaign attribution columns for #11:
 *
 *   InviteCode.campaign   — TEXT nullable, indexed (the campaign tag)
 *   Consultation.redeemedCode — TEXT nullable, indexed (which key redeemed this consultation's user)
 *
 * Additive-only; matches prisma/schema.prisma exactly (field names = column names).
 *
 * USAGE:
 *   unset DATABASE_URL  # the trap hit twice — scripts resolve DATABASE_URL first
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npx tsx scripts/apply-vol6c-schema.ts
 */
import { createClient } from '@libsql/client';

const STMTS = [
  // ── Vol. 6 #11: campaign attribution on InviteCode
  `ALTER TABLE "InviteCode" ADD COLUMN "campaign" TEXT`,
  `CREATE INDEX IF NOT EXISTS "InviteCode_campaign_idx" ON "InviteCode"("campaign")`,

  // ── Vol. 6 #11: redeemed-code join on Consultation (the key→consultation bridge)
  `ALTER TABLE "Consultation" ADD COLUMN "redeemedCode" TEXT`,
  `CREATE INDEX IF NOT EXISTS "Consultation_redeemedCode_idx" ON "Consultation"("redeemedCode")`,

  // ── Vol. 6 #14: completion-nudge ledger (mirrors TestimonialFollowUp pattern)
  `CREATE TABLE IF NOT EXISTS "CompletionNudge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "consultationId" TEXT NOT NULL UNIQUE,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL DEFAULT 'cron',
    "sentBy" TEXT NOT NULL DEFAULT 'system'
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "CompletionNudge_consultationId_key" ON "CompletionNudge"("consultationId")`,
];

const url = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL;
if (!url) {
  console.error('FAIL: TURSO_DATABASE_URL (or DATABASE_URL) must be set');
  process.exit(1);
}
if (process.env.DATABASE_URL && process.env.TURSO_DATABASE_URL && process.env.DATABASE_URL !== process.env.TURSO_DATABASE_URL) {
  console.error('FAIL: both DATABASE_URL and TURSO_DATABASE_URL are set but differ — scripts/* resolves DATABASE_URL first (the trap hit in Vols 1+2). Run `unset DATABASE_URL` first.');
  process.exit(1);
}

const client = createClient({
  url: url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  for (const sql of STMTS) {
    try {
      await client.execute(sql);
      console.log('OK  :', sql.slice(0, 80).replace(/\s+/g, ' '));
    } catch (e) {
      const msg = String(e);
      if (msg.includes('already exists') || msg.includes('duplicate column')) {
        console.log('SKIP:', sql.slice(0, 80).replace(/\s+/g, ' '));
      } else {
        console.error('FAIL:', sql.slice(0, 80), '\n     ', msg);
        process.exit(1);
      }
    }
  }

  const checks = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name = 'CompletionNudge'"
  );
  const inviteCols = await client.execute(`PRAGMA table_info("InviteCode")`);
  const consultCols = await client.execute(`PRAGMA table_info("Consultation")`);
  console.log(
    '\nverify:',
    checks.rows.length > 0 ? 'CompletionNudge table OK' : 'CompletionNudge MISSING',
    '|',
    inviteCols.rows.some((r: any) => r.name === 'campaign') ? 'InviteCode.campaign OK' : 'InviteCode.campaign MISSING',
    '|',
    consultCols.rows.some((r: any) => r.name === 'redeemedCode') ? 'Consultation.redeemedCode OK' : 'Consultation.redeemedCode MISSING',
  );
}

main().catch((e) => { console.error(e); process.exit(1); });

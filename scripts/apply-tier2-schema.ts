/* Tier-2 schema delta — applied via libSQL directly (Prisma 7 CLI P1013 on libsql://).
 * Additive-only; matches prisma/schema.prisma exactly (field names = column names).
 * EmailSend + EmailEvent power the email analytics loop (roadmap #10). */
import { createClient } from '@libsql/client';

const STMTS = [
  // EmailSend — every accepted provider send, logged at dispatch time
  `CREATE TABLE IF NOT EXISTS "EmailSend" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emailId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "doorDay" INTEGER,
    "subject" TEXT NOT NULL DEFAULT '',
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "EmailSend_emailId_key" ON "EmailSend"("emailId")`,
  `CREATE INDEX IF NOT EXISTS "EmailSend_email_idx" ON "EmailSend"("email")`,
  `CREATE INDEX IF NOT EXISTS "EmailSend_kind_doorDay_idx" ON "EmailSend"("kind","doorDay")`,
  // EmailEvent — svix-verified Resend webhook callbacks
  `CREATE TABLE IF NOT EXISTS "EmailEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emailId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "payload" TEXT,
    "occurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "EmailEvent_emailId_idx" ON "EmailEvent"("emailId")`,
  `CREATE INDEX IF NOT EXISTS "EmailEvent_email_type_idx" ON "EmailEvent"("email","type")`,
];

const client = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  for (const sql of STMTS) {
    try {
      await client.execute(sql);
      console.log('OK  :', sql.slice(0, 70).replace(/\s+/g, ' '));
    } catch (e) {
      if (String(e).includes('already exists') || String(e).includes('duplicate column')) {
        console.log('SKIP:', sql.slice(0, 70).replace(/\s+/g, ' '));
      } else {
        console.error('FAIL:', sql.slice(0, 70), '\n     ', e);
        process.exit(1);
      }
    }
  }

  const checks = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('EmailSend','EmailEvent')"
  );
  console.log('\nverify tables:', checks.rows.map((r) => String(r.name)).join(', '));
}

main().catch((e) => { console.error(e); process.exit(1); });

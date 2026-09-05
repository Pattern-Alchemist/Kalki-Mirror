/* Tier-1 schema delta — applied via libSQL directly (Prisma 7 CLI P1013 on libsql://).
 * Additive-only; matches prisma/schema.prisma exactly (field names = column names). */
import { createClient } from '@libsql/client';

const STMTS = [
  // Consultation — UPI payment reconciliation ledger
  `ALTER TABLE Consultation ADD COLUMN paymentState TEXT NOT NULL DEFAULT 'UNPAID'`,
  `ALTER TABLE Consultation ADD COLUMN paymentSession TEXT`,
  `ALTER TABLE Consultation ADD COLUMN utrRef TEXT`,
  `ALTER TABLE Consultation ADD COLUMN paidAt DATETIME`,
  `CREATE INDEX IF NOT EXISTS "Consultation_paymentState_idx" ON "Consultation"("paymentState")`,
  // Membership — Akash tiers manual-rail ledger
  `CREATE TABLE IF NOT EXISTS "Membership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "phone" TEXT NOT NULL DEFAULT '',
    "plan" TEXT NOT NULL,
    "tier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "utrRef" TEXT,
    "grantedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "Membership_status_idx" ON "Membership"("status")`,
  `CREATE INDEX IF NOT EXISTS "Membership_email_idx" ON "Membership"("email")`,
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
  "SELECT name FROM sqlite_master WHERE type IN ('table','index') AND name LIKE '%Membership%' OR name LIKE '%paymentState%'"
);
console.log('\nverify:', checks.rows.map((r) => String(r.name)).join(', '));
const probe = await client.execute('SELECT paymentState, COUNT(*) c FROM Consultation GROUP BY paymentState');
console.log('consultation.paymentState backfill:', probe.rows.map((r) => `${r.paymentState}=${r.c}`).join(' | '));
}

main().catch((e) => { console.error(e); process.exit(1); });

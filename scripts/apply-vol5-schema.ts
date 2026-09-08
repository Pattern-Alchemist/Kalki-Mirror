/* Vol. 5 schema delta — applied via libSQL directly (Prisma 7 CLI P1013 on
 * libsql://). Additive-only; matches prisma/schema.prisma exactly.
 * RateLimitHit powers the distributed limiter (Vol. 5 #3); CronRun is the
 * cron outcome ledger (Vol. 5 #4). Run with TURSO_DATABASE_URL +
 * TURSO_AUTH_TOKEN in env (server env of the project). */
import { createClient } from '@libsql/client';

const STMTS = [
  // RateLimitHit — sliding-window rows for the shared rate limiter
  `CREATE TABLE IF NOT EXISTS "RateLimitHit" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL,
    "ts" INTEGER NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS "RateLimitHit_key_ts_idx" ON "RateLimitHit"("key","ts")`,
  // CronRun — one row per cron execution (duration, items, outcome)
  `CREATE TABLE IF NOT EXISTS "CronRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "items" INTEGER,
    "outcome" TEXT NOT NULL,
    "error" TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS "CronRun_name_startedAt_idx" ON "CronRun"("name","startedAt")`,
];

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.error('TURSO_DATABASE_URL (or DATABASE_URL) required');
  process.exit(1);
}
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });

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
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('RateLimitHit','CronRun')"
  );
  console.log('\nverify tables:', checks.rows.map((r) => String(r.name)).join(', '));
}

main().catch((e) => { console.error(e); process.exit(1); });

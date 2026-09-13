/* Vol. 6 Week B schema delta — applied via libSQL directly (Prisma 7 CLI P1013 on libsql://).
 *
 * Adds the two new tables required by #7 (embed_cache) and #9 (gsc_snapshots):
 *
 *   embed_cache   — neural embedding cache, key = sha256(JSON([model, text]))
 *                   (the EMBED_API_KEY landing surface; #7 reads/writes via Prisma)
 *   gsc_snapshots — Google Search Console weekly aggregates, snapshot_date PK
 *                   (#9 writes weekly; #9 reads for the 8-week war-room sparkline)
 *
 * Additive-only; matches prisma/schema.prisma exactly (field names = column names).
 *
 * USAGE:
 *   unset DATABASE_URL  # the trap hit twice — scripts resolve DATABASE_URL first
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npx tsx scripts/apply-vol6b-schema.ts
 */
import { createClient } from '@libsql/client';

const STMTS = [
  // ── Vol. 6 #7: embed_cache (neural embedding cache for the hybrid retrieval bed)
  `CREATE TABLE IF NOT EXISTS "EmbedCache" (
    "cacheKey" TEXT NOT NULL PRIMARY KEY,
    "model" TEXT NOT NULL,
    "vec" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "EmbedCache_model_idx" ON "EmbedCache"("model")`,

  // ── Vol. 6 #9: gsc_snapshots (GSC weekly aggregates for the observatory)
  `CREATE TABLE IF NOT EXISTS "GscSnapshot" (
    "snapshotDate" TEXT NOT NULL PRIMARY KEY,
    "impressions" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "position" REAL NOT NULL,
    "topQueries" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
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
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('EmbedCache','GscSnapshot')"
  );
  console.log(
    '\nverify:',
    checks.rows.map((r) => String(r.name)).join(', '),
  );
}

main().catch((e) => { console.error(e); process.exit(1); });

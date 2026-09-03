#!/usr/bin/env node
/**
 * BACKUP DB — restore the documented `npm run db:backup` capability
 * (Admin OS v2, Ch 11.1 "Backups that run without you" + first-three-moves #3).
 *
 * What it does
 *   1. Connects to Turso/libSQL using TURSO_DATABASE_URL + TURSO_AUTH_TOKEN
 *      (aliases: DATABASE_URL / DATABASE_AUTH_TOKEN).
 *   2. Dumps every user table (schema + rows) as portable SQL.
 *   3. Gzips the dump into backups/<timestamp>-kalki-dump.sql.gz.
 *   4. Prunes old dumps (keep 14 by default, --keep N to override).
 *
 * Guarantees
 *   - Read-only against the source database (SELECT + sqlite_master reads only).
 *   - Never prints or stores credentials; the dump lands in gitignored backups/.
 *   - A dump contains passwordHashes — treat the file as a secret and store
 *     it somewhere private (this machine, an encrypted volume, or private
 *     cloud storage). Do not commit or share it.
 *
 * Usage
 *   npm run db:backup
 *   node scripts/backup-db.mjs --keep 30
 */

import { createClient } from '@libsql/client';
import { gzipSync } from 'zlib';
import { mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

// ── CLI ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const keepIdx = args.indexOf('--keep');
const KEEP = keepIdx !== -1 ? Math.max(1, parseInt(args[keepIdx + 1], 10) || 14) : 14;

// ── Credential resolution (env-only — matches src/lib/db.ts policy) ─────────
const url =
  process.env.TURSO_DATABASE_URL ||
  process.env.DATABASE_URL ||
  '';
const authToken =
  process.env.TURSO_AUTH_TOKEN ||
  process.env.DATABASE_AUTH_TOKEN ||
  '';

if (!url) {
  console.error('✗ No database URL found. Set TURSO_DATABASE_URL (or DATABASE_URL) in .env.local / shell.');
  process.exit(1);
}

// ── SQL helpers ──────────────────────────────────────────────────────────────
const sqlString = (v) => `'${String(v).replace(/'/g, "''")}'`;
const sqlValue = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : sqlString(v));

/** Render one INSERT with N value tuples, or NULL when rows is empty. */
function insertStmt(table, columns, rows) {
  if (!rows.length) return '';
  const tuples = rows
    .map((r) => `(${columns.map((c) => sqlValue(r[c])).join(', ')})`)
    .join(',\n  ');
  return `INSERT INTO "${table}" (${columns.map((c) => `"${c}"`).join(', ')}) VALUES\n  ${tuples};\n`;
}

// ── Dump ─────────────────────────────────────────────────────────────────────
const outDir = resolve(process.cwd(), 'backups');
mkdirSync(outDir, { recursive: true });

const started = Date.now();
console.log(`• Connecting to ${url.replace(/\/\/[^@]+@/, '//***@')} …`);

const client = createClient({ url, authToken: authToken || undefined });

// Internal tables that must never appear in a dump.
const EXCLUDED = [/^sqlite_%/, /^_cf_%/, /^_libsql_%/];
const excludeSql = EXCLUDED.map((p) => ` AND name NOT LIKE '${p.source.replace(/\\\//g, '')}'`.replace(/^ AND name NOT LIKE '\/\^/, " AND name NOT LIKE '").replace(/\$\/$/, "'")).join('');

let tables;
try {
  tables = (
    await client.execute({
      sql: `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name NOT LIKE '_libsql_%' ORDER BY name`,
    })
  ).rows.map((r) => String(r.name));
} catch (err) {
  console.error('✗ Could not list tables — check URL/token:', err.message);
  process.exit(1);
}

const chunks = [
  `-- ============================================================\n-- KALKI MIRROR — logical backup\n-- Source: ${url.replace(/\/\/[^@]+@/, '//***@')}\n-- Generated: ${new Date().toISOString()}\n-- Restore with: sqlite3 restored.db < this-file (after gunzip)\n-- ============================================================\n\nPRAGMA foreign_keys=OFF;\nBEGIN TRANSACTION;\n`,
];

let totalRows = 0;
const perTable = [];

for (const table of tables) {
  // Schema: CREATE TABLE + indexes/triggers bound to this table.
  const ddl = await client.execute({
    sql: `SELECT type, name, sql FROM sqlite_master WHERE tbl_name = ? AND sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY CASE type WHEN 'table' THEN 0 WHEN 'index' THEN 1 ELSE 2 END`,
    args: [table],
  });
  for (const row of ddl.rows) {
    chunks.push(`${String(row.sql).replace(/;\s*$/, '')};\n`);
  }

  // Data: fetch all rows, insert in one statement per table (this DB is
  // small at current scale; if FolioChunk grows past ~100 MB, switch this
  // loop to batched pages of 500).
  const data = await client.execute({ sql: `SELECT * FROM "${table}"` });
  const columns = data.columns;
  const rows = data.rows.map((r) => Object.fromEntries(columns.map((c, i) => [c, r[i]])));
  const stmt = insertStmt(table, columns, rows);
  if (stmt) chunks.push('\n' + stmt);
  totalRows += rows.length;
  perTable.push(`  ${table.padEnd(22)} ${String(rows.length).padStart(6)} rows`);
}

chunks.push('\nCOMMIT;\nPRAGMA foreign_keys=ON;\n');

// ── Write + gzip ─────────────────────────────────────────────────────────────
const sql = chunks.join('');
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const gzPath = join(outDir, `${stamp}-kalki-dump.sql.gz`);
const gz = gzipSync(Buffer.from(sql, 'utf8'));
writeFileSync(gzPath, gz);

// ── Retention: keep the newest KEEP dumps ────────────────────────────────────
const dumps = readdirSync(outDir)
  .filter((f) => f.endsWith('-kalki-dump.sql.gz'))
  .map((f) => join(outDir, f))
  .sort()
  .reverse();
let pruned = 0;
for (const old of dumps.slice(KEEP)) {
  unlinkSync(old);
  pruned++;
}

const sizeKb = Math.round(statSync(gzPath).size / 1024);
console.log(perTable.join('\n'));
console.log(`\n✓ Dumped ${tables.length} tables / ${totalRows} rows in ${((Date.now() - started) / 1000).toFixed(1)}s`);
console.log(`✓ ${gzPath} (${sizeKb} KB gzipped)${pruned ? ` · pruned ${pruned} old dump${pruned > 1 ? 's' : ''}` : ''}`);
console.log('  Treat this file as a secret: it contains password hashes.');

#!/usr/bin/env node
/**
 * RESTORE DRILL — restore + assertion engine (companion to restore-drill.sh,
 * Vol. 2 #13 workflow, Vol. 4 #20 script). Pure node so it runs identically
 * locally and in CI with zero extra binaries (@libsql/client is already a
 * runtime dependency; sqlite3 CLI is not).
 *
 * What it does:
 *   1. Reads the dump (.sql.gz or .sql) produced by backup-db.mjs.
 *   2. Restores it into the throwaway SQLite file (SCRATCH_DB_URL).
 *   3. Asserts: integrity_check=ok, table census, crown-jewel rows,
 *      canonical index present (schema truth), row fidelity vs the live
 *      source for the tables that matter.
 *
 * Exit 0 = drill passed. Non-zero = the backup is not trustworthy.
 */

import { createClient } from '@libsql/client';
import { gunzipSync } from 'zlib';
import { readFileSync, rmSync } from 'fs';

// ── CLI ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};
const dumpPath = flag('--dump');
const scratchPath = (flag('--scratch') ?? 'file:/tmp/kalki-drill.db').replace(/^file:/, '');
const sourceUrl = process.env.TURSO_DATABASE_URL ?? process.env.DATABASE_URL ?? '';
const sourceToken = process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN ?? '';

if (!dumpPath) {
  console.error('✗ usage: node scripts/restore-drill.mjs --dump backups/<ts>-kalki-dump.sql.gz [--scratch file:/tmp/kalki-drill.db]');
  process.exit(1);
}
if (!sourceUrl) {
  console.error('✗ no source URL — set TURSO_DATABASE_URL (or DATABASE_URL)');
  process.exit(1);
}

// ── 1. Load the dump ─────────────────────────────────────────────────────────
let sql;
if (dumpPath.endsWith('.gz')) {
  sql = gunzipSync(readFileSync(dumpPath)).toString('utf8');
} else {
  sql = readFileSync(dumpPath, 'utf8');
}
if (!sql.includes('CREATE TABLE')) {
  console.error('✗ dump carries no CREATE TABLE statements — refusing to assert against it');
  process.exit(1);
}

// ── 2. Restore ───────────────────────────────────────────────────────────────
rmSync(scratchPath, { force: true });
const scratch = createClient({ url: `file:${scratchPath}` });
try {
  await scratch.executeMultiple(sql);
} catch (err) {
  console.error('✗ restore failed while executing dump SQL:', err.message);
  process.exit(1);
}
console.log(`✓ Restored into ${scratchPath}`);

// ── 3. Assertions ────────────────────────────────────────────────────────────
const fail = (msg) => {
  console.error(`✗ DRILL FAILED: ${msg}`);
  process.exit(1);
};
const scalar = async (client, q) => Number((await client.execute({ sql: q })).rows[0].n);

const integrity = String((await scratch.execute({ sql: 'PRAGMA integrity_check;' })).rows[0].integrity_check ?? '');
if (integrity !== 'ok') fail(`integrity_check returned: ${integrity}`);
console.log('✓ integrity_check: ok');

const tables = (
  await scratch.execute({ sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';" })
).rows.map((r) => String(r.name));
if (tables.length < 20) fail(`only ${tables.length} tables restored (expected ≥ 20)`);
console.log(`✓ table count: ${tables.length}`);

for (const t of ['User', 'Membership', 'EmailSubscriber', 'EmailSend', 'ContentEntry', 'Consultation', 'OpsState']) {
  if (!tables.includes(t)) fail(`table ${t} missing after restore`);
  console.log(`  ${t}: ${await scalar(scratch, `SELECT count(*) AS n FROM "${t}"`)}`);
}

if ((await scalar(scratch, 'SELECT count(*) AS n FROM "User"')) === 0) {
  fail('User table restored EMPTY — the backup cannot be trusted');
}
console.log('✓ crown-jewel tables present (User non-empty)');

// Schema truth: the canonical ContentEntry index must exist under its real name.
if ((await scalar(scratch, "SELECT count(*) AS n FROM sqlite_master WHERE type='index' AND name='ContentEntry_minTier_caution_idx';")) !== 1) {
  fail('ContentEntry_minTier_caution_idx missing after restore');
}
console.log('✓ schema truth: canonical ContentEntry index present');

// ── 4. Row fidelity vs the live source ──────────────────────────────────────
const source = createClient({ url: sourceUrl, authToken: sourceToken || undefined });
for (const t of ['User', 'EmailSend', 'EmailSubscriber', 'Membership']) {
  const src = await scalar(source, `SELECT count(*) AS n FROM "${t}"`);
  const dst = await scalar(scratch, `SELECT count(*) AS n FROM "${t}"`);
  if (src !== dst) fail(`row fidelity: ${t} source=${src} restored=${dst}`);
  console.log(`✓ fidelity ${t}: ${src} = ${dst}`);
}

console.log('');
console.log('════════════════════════════════════════════════════');
console.log('✓ RESTORE DRILL PASSED — the backup restores into a');
console.log('  working database with integrity, schema truth and row');
console.log('  fidelity intact. Quarterly cadence: Jan/Apr/Jul/Oct.');
console.log('════════════════════════════════════════════════════');

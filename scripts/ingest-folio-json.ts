/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Folio JSON ingest into db/custom.db (Vol. 5 #7)
   ---------------------------------------------------------------------------
   The WRITE path of the bake ritual for NEW folios. Reads
   content/folios/*.json, validates against the pure contract
   (src/lib/rag/folio-ingest.ts), plans against the baked corpus and
   executes the plan into db/custom.db. Embeddings land as '[]' — the very
   next step of scripts/bake-corpus.sh fills them.

   NOT to be confused with scripts/ingest-folios.ts — the historical
   full-corpus re-ingest from the flat data modules (allSiddhis). The two
   scripts share the db and nothing else.

   Usage:
     npx tsx scripts/ingest-folio-json.ts --dry-run   # validate + plan only
     npx tsx scripts/ingest-folio-json.ts             # insert new slugs
     npx tsx scripts/ingest-folio-json.ts --replace   # re-bake listed slugs
     npx tsx scripts/ingest-folio-json.ts --dir d     # alternate source dir

   Exit 0 = plan executed (or nothing pending). Exit 1 = validation failed.
   ═══════════════════════════════════════════════════════════════════════════ */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { createClient } from '@libsql/client';
import {
  validateFolioJson,
  planIngest,
  type FolioJson,
} from '../src/lib/rag/folio-ingest';

const args = process.argv.slice(2);
const hasFlag = (f: string) => args.includes(f);
const argOf = (f: string) => {
  const i = args.indexOf(f);
  return i >= 0 && args[i + 1] ? args[i + 1] : undefined;
};

const ROOT = process.cwd();
const DIR = join(ROOT, argOf('--dir') ?? 'content', 'folios');
const DB_PATH = join(ROOT, 'db', 'custom.db');
const DRY = hasFlag('--dry-run');
const MODE = hasFlag('--replace') ? 'replace' : 'skip';

function loadFolios(): { file: string; folio: FolioJson }[] {
  let files: string[] = [];
  try {
    files = readdirSync(DIR).filter((f) => f.endsWith('.json'));
  } catch {
    console.log(`[ingest] no folio dir at ${DIR} — nothing to ingest (that is fine)`);
    return [];
  }
  const out: { file: string; folio: FolioJson }[] = [];
  const allErrors: string[] = [];
  for (const file of files) {
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(join(DIR, file), 'utf8'));
    } catch (e) {
      allErrors.push(`${file}: invalid JSON — ${(e as Error).message}`);
      continue;
    }
    const v = validateFolioJson(raw);
    if (v.ok) out.push({ file, folio: v.folio });
    else allErrors.push(`${file}:\n${v.errors.map((e) => `    - ${e}`).join('\n')}`);
  }
  if (allErrors.length > 0) {
    console.error('[ingest] folio JSON validation FAILED:');
    for (const e of allErrors) console.error(`  ${e}`);
    process.exit(1);
  }
  return out;
}

async function main() {
  const folios = loadFolios();
  if (folios.length === 0) {
    console.log('[ingest] 0 folio files — nothing to do.');
    return;
  }

  const client = createClient({ url: `file:${DB_PATH}` });
  const res = await client.execute('SELECT slug, section FROM FolioChunk');
  const existing = res.rows.map((r) => ({ slug: String(r.slug), section: String(r.section) }));

  const plan = planIngest(existing, folios.map((f) => f.folio), MODE);

  console.log(`[ingest] ${folios.length} folio file(s), mode=${MODE}`);
  for (const w of plan.writes) console.log(`    write  ${w.slug} · ${w.section}`);
  for (const s of plan.skipped) console.log(`    skip   ${s} (already baked — use --replace to re-bake)`);
  for (const r of plan.replaced) console.log(`    replace ${r} (old rows deleted, then re-inserted)`);
  console.log(`[ingest] plan: ${plan.inserts.length} insert(s), ${plan.skipped.length} skip, ${plan.replaced.length} replace`);

  if (DRY) {
    console.log('[ingest] --dry-run: plan printed, nothing written.');
    return;
  }
  if (plan.inserts.length === 0) {
    console.log('[ingest] nothing to insert.');
    return;
  }

  if (plan.replaced.length > 0) {
    for (const slug of plan.replaced) {
      await client.execute({ sql: 'DELETE FROM FolioChunk WHERE slug = ?', args: [slug] });
    }
  }
  for (const c of plan.inserts) {
    await client.execute({
      sql: 'INSERT INTO FolioChunk (id, slug, archetype, section, caution, text, embedding) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [randomUUID(), c.slug, c.archetype, c.section, c.caution, c.text, '[]'],
    });
  }
  console.log(`[ingest] wrote ${plan.inserts.length} chunk(s) into db/custom.db (embeddings '[]' — bake fills them next).`);
}

main().catch((e) => {
  console.error('[ingest]', e.message);
  process.exit(1);
});

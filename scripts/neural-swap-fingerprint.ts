/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — Neural-swap fingerprint probe (Vol. 4 #16)
   ---------------------------------------------------------------------------
   Run: npx tsx scripts/neural-swap-fingerprint.ts

   Reads the LIVE baked corpus (db/custom.db), recomputes the IDF map with
   the exact bake math, and compares it against src/lib/rag/idf-generated.ts
   via the pure verdict in src/lib/rag/swap-readiness.ts. Emits both a
   machine-readable JSON blob and KEY=VALUE lines (grep-friendly for the
   shell orchestrator). NO KEY REQUIRED — this probe never touches an API.
   ═══════════════════════════════════════════════════════════════════════════ */

import { createClient } from '@libsql/client';
import { join } from 'path';
import { tokenTerms } from '../src/lib/rag/embed';
import {
  CORPUS_SIZE,
  EMBED_MODEL,
  EMBED_DIM,
  IDF as GENERATED_IDF,
} from '../src/lib/rag/idf-generated';
import { idfSyncVerdict, estimateSwapCost } from '../src/lib/rag/swap-readiness';

const DB_PATH = join(process.cwd(), 'db', 'custom.db');

async function main(): Promise<void> {
  const client = createClient({ url: `file:${DB_PATH}` });
  const res = await client.execute('SELECT id, text FROM FolioChunk ORDER BY id');
  const rows = res.rows.map((r) => ({ id: String(r.id), text: String(r.text) }));
  const N = rows.length;

  // ── Recompute IDF with the exact bake math (df over the shared tokenizer) ─
  const df = new Map<string, number>();
  let totalChars = 0;
  for (const row of rows) {
    totalChars += row.text.length;
    for (const t of new Set(tokenTerms(row.text))) {
      df.set(t, (df.get(t) ?? 0) + 1);
    }
  }
  const recomputed: Record<string, number> = {};
  for (const [term, d] of df) {
    recomputed[term] = Math.round((Math.log((N + 1) / (d + 1)) + 1) * 1e6) / 1e6;
  }

  const verdict = idfSyncVerdict({
    recomputed,
    generated: GENERATED_IDF,
    corpusRows: N,
    generatedCorpusSize: CORPUS_SIZE,
  });

  const price = Number(process.env.NEURAL_EMBED_PRICE_PER_1M_USD ?? '0.02');
  const cost = estimateSwapCost(CORPUS_SIZE, totalChars, Number.isFinite(price) && price > 0 ? price : 0.02);

  const report = {
    dbPath: DB_PATH,
    corpusRows: N,
    generated: { corpusSize: CORPUS_SIZE, vocab: Object.keys(GENERATED_IDF).length, model: EMBED_MODEL, dims: EMBED_DIM },
    verdict,
    cost,
  };

  // KEY=VALUE lines for the shell rehearsal
  console.log(`CORPUS_ROWS=${N}`);
  console.log(`GENERATED_CORPUS_SIZE=${CORPUS_SIZE}`);
  console.log(`CORPUS_COUNT_MATCH=${verdict.corpusCountMatches ? 'yes' : 'no'}`);
  console.log(`RECOMPUTED_VOCAB=${verdict.recomputedVocab}`);
  console.log(`GENERATED_VOCAB=${verdict.generatedVocab}`);
  console.log(`RECOMPUTED_FP=${verdict.recomputedFingerprint}`);
  console.log(`GENERATED_FP=${verdict.generatedFingerprint}`);
  console.log(`FINGERPRINTS_MATCH=${verdict.recomputedFingerprint === verdict.generatedFingerprint ? 'yes' : 'no'}`);
  console.log(`IN_SYNC=${verdict.inSync ? 'yes' : 'no'}`);
  console.log(`MISSING_TERMS=${verdict.missing.length}`);
  console.log(`EXTRA_TERMS=${verdict.extra.length}`);
  console.log(`DRIFTED_VALUES=${verdict.drifted.length}`);
  console.log(`EST_TOKENS=${cost.estimatedTokens}`);
  console.log(`EST_BAKE_COST_USD=${cost.estimatedBakeCostUsd.toFixed(4)}`);
  console.log(`NEURAL_SWAP_REPORT_JSON=${JSON.stringify(report)}`);
}

main().catch((err: unknown) => {
  console.error(`[neural-swap-fingerprint] FAILED: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});

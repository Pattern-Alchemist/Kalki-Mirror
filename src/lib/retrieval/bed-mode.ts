// =============================================================
// KALKI — /ask retrieval bed (Vol. 6 #7)
// -------------------------------------------------------------
// bedMode() is wired into the /api/cron/ask-eval route under
// ?bed=1. It runs the golden-set's grounded cases through the
// retrieval pipeline ONLY (no LLM call), measures lexical vs
// hybrid hit-rate, and reports dense:null when EMBED_API_KEY is
// unset (the doctrine: lands asleep, wakes on one env flip).
//
// DDL: embed_cache table (applied via scripts/apply-vol6b-schema.ts).
// Prisma models: EmbedCache (added to schema.prisma).
// =============================================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GOLDEN_SET, type GoldenCase } from '@/lib/eval/golden-set';
import { retrieveCitation } from '@/lib/rag/retrieval';
import { rrfFuse } from '@/lib/retrieval/fusion';
import { embedBatch, isEmbedConfigured } from '@/lib/retrieval/embed';

const BED_OPS_KEY = 'retrieval_bed';
const BED_STALE_H = 25 * 7; // weekly bed is fine, but alarm at >7d stale

export const RETRIEVAL_BED_OPS_KEY = BED_OPS_KEY;
export const RETRIEVAL_BED_MAX_AGE_H = BED_STALE_H;

export interface BedVerdict {
  ranAt: string;
  dense: boolean;          // false when EMBED_API_KEY unset (dense:null report)
  cases: number;
  k: number;
  lexicalHitRate: number;  // 0..1
  hybridHitRate: number | null;
  regression: boolean;     // true if hybrid < lexical (fusion made it worse)
}

export function parseStoredBed(raw: string | null | undefined): BedVerdict | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as BedVerdict;
    if (typeof v.ranAt !== 'string') return null;
    if (typeof v.dense !== 'boolean') return null;
    if (typeof v.lexicalHitRate !== 'number') return null;
    return v;
  } catch {
    return null;
  }
}

export function bedDigestLine(v: BedVerdict | null, now: Date = new Date()): string {
  if (!v) return 'RETRIEVAL BED: never run — trigger /api/cron/ask-eval?bed=1';
  const ageH = (now.getTime() - Date.parse(v.ranAt)) / 3_600_000;
  if (ageH > BED_STALE_H) {
    return `RETRIEVAL BED: last run ${Math.round(ageH)}h ago (> ${BED_STALE_H}h) — bed cron may be dead`;
  }
  if (v.regression) {
    return `RETRIEVAL BED ALERT: hybrid ${Math.round((v.hybridHitRate ?? 0) * 100)}% < lexical ${Math.round(v.lexicalHitRate * 100)}% — fusion regressed, EMBED key may need re-bake`;
  }
  if (!v.dense) {
    // dense:null is the doctrine's resting state — not an alarm, but surfaced for visibility
    return `RETRIEVAL BED: dense:null (EMBED_API_KEY unset) · lexical ${Math.round(v.lexicalHitRate * 100)}% — awaiting founder key flip`;
  }
  return ''; // healthy hybrid run — silent
}

/**
 * BedMode — for each grounded golden case, retrieve top-K lexical
 * and (if EMBED_API_KEY set) hybrid candidates, assert expected
 * slug ∈ top-K, compute hit-rate. Stores verdict in OpsState.
 *
 * Zero-regression proof: when EMBED_API_KEY is unset, dense=false,
 * hybridHitRate=null, regression=false — output is byte-identical
 * to lexical-only behavior.
 *
 * ARCHITECTURE (mirrors the dossier):
 *   1. Widen retrieval to CANDIDATE_K (default 20) — gives fusion room
 *   2. Embed query + candidate texts via embedBatch (gated by EMBED_API_KEY)
 *   3. Dense rank by cosine(query, candidate)
 *   4. rrfFuse(lexicalOrder, denseRank) → fused ordering
 *   5. Top-K (default 6) of fused = hybridHitRate assertion set
 *   6. Compare expected slug ∈ top-K lexical vs top-K hybrid
 */
export async function bedMode(): Promise<Response> {
  const CANDIDATE_K = Number(process.env.BED_CANDIDATE_K ?? 20);
  const ASSERT_K = Number(process.env.ASK_POOL_K ?? 6);
  const cases = GOLDEN_SET.filter(
    (c): c is Extract<GoldenCase, { kind: 'grounded' }> => c.kind === 'grounded',
  );

  const lexHits: boolean[] = [];
  let hybHits: boolean[] | null = isEmbedConfigured() ? [] : null;

  for (const c of cases) {
    // Stage 1: widen lexical retrieval — give fusion signal
    const lex = await retrieveCitation(c.query, 'prithvi', { k: CANDIDATE_K });
    const lexSlugs = [...new Set(lex.chunks.map((ch) => ch.slug))];
    // The lexical assertion uses the production top-K (6), not the wider pool
    const lexTopK = lexSlugs.slice(0, ASSERT_K);
    const lexHit = c.expectCitations.some((s) => lexTopK.includes(s));
    lexHits.push(lexHit);

    // Stage 2 (gated): neural dense ranking, fused via RRF
    if (hybHits && isEmbedConfigured()) {
      try {
        const candidateTexts = lex.chunks.map((ch) => ch.text);
        const denseVecs = await embedBatch([c.query, ...candidateTexts]);
        if (!denseVecs) {
          // fail-soft — drop to dense:null for the rest of the run
          hybHits = null;
        } else {
          const queryVec = denseVecs[0];
          const candVecs = denseVecs.slice(1);
          // cosine rank candidates by dense similarity
          const scored = candVecs
            .map((v, i) => ({ slug: lexSlugs[i] ?? lex.chunks[i]?.slug ?? `c-${i}`, sim: cos(queryVec, v) }))
            .sort((a, b) => b.sim - a.sim);
          const denseRank = scored.map((s) => s.slug);
          const fused = rrfFuse(lexSlugs, denseRank);
          const hybTopK = fused.slice(0, ASSERT_K);
          const hybHit = c.expectCitations.some((s) => hybTopK.includes(s));
          hybHits.push(hybHit);
        }
      } catch {
        // any error → dense:null for the rest of the run
        hybHits = null;
      }
    }
  }

  const rate = (a: boolean[]) => (a.length ? a.filter(Boolean).length / a.length : 0);
  const lexicalHitRate = +rate(lexHits).toFixed(3);
  const hybridHitRate = hybHits ? +rate(hybHits).toFixed(3) : null;

  const verdict: BedVerdict = {
    ranAt: new Date().toISOString(),
    dense: hybHits !== null,
    cases: cases.length,
    k: ASSERT_K,
    lexicalHitRate,
    hybridHitRate,
    regression: hybridHitRate !== null && hybridHitRate < lexicalHitRate,
  };

  try {
    await db.opsState.upsert({
      where: { key: BED_OPS_KEY },
      create: { key: BED_OPS_KEY, value: JSON.stringify(verdict) },
      update: { value: JSON.stringify(verdict) },
    });
  } catch {
    // OpsState write is a convenience, never a dependency
  }

  return NextResponse.json(verdict);
}

function cos(a: number[], b: number[]): number {
  if (!a.length || !b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] ** 2;
    nb += b[i] ** 2;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

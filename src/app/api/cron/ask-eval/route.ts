// =============================================================
// KALKI — /api/cron/ask-eval (Vol. 6 #6)
// -------------------------------------------------------------
// POST route split into GET endpoints because GitHub Actions
// workflow_dispatch + cron schedule use curl GET (no Next server
// action required, no body shape to fight with).
//
// AUTH: Authorization: Bearer <CRON_SECRET>  (or ?key=<CRON_SECRET>)
//
// ENDPOINTS:
//   GET ?case=__list__
//     → { cases: [{id, kind}, ...] }
//
//   GET ?case=<id>
//     → runs ONE case against the live /api/ai/ask with the
//       cache-bypass header (x-eval: nocache), stores the verdict
//       in today's bucket, returns the verdict
//
//   GET ?finalize=1
//     → reads today's bucket, computes the rollup, stores
//       StoredGoldenAsk in OpsState, returns the rollup
//       (incomplete → status:incomplete, done:N, total:M)
//
//   GET ?bed=1   (Vol. 6 #7)
//     → retrieval-only mode: hit-rate lexical vs hybrid (no LLM call)
//       Stores verdict under retrieval_bed key. Fail if hybrid < lexical.
//
// PACING: the GitHub workflow sleeps 13s between cases (limiter
// contract: 5 req/min shared). One case per request keeps the
// serverless runtime under 60s — hobby-safe.
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { GOLDEN_SET, GOLDEN_IDS } from '@/lib/eval/golden-set';
import { judge, rollup, type AskOutcome, type CaseVerdict } from '@/lib/eval/ask-eval';
import {
  GOLDEN_ASK_OPS_KEY,
  parseStoredGoldenAsk,
  nextConsecutiveFailures,
  type StoredGoldenAsk,
} from '@/lib/eval/ask-eval-observe';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SITE = process.env.SITE_URL ?? 'https://www.astrokalki.com';
const BUDGET = Number(process.env.CHAIN_TIMEOUT_MS ?? 12_000);

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get('authorization') === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get('key') === secret;
}

const today = () => new Date().toISOString().slice(0, 10);
const bucketKey = (d: string) => `eval:golden_ask:bucket:${d}`;

/**
 * Probe the LIVE /api/ai/ask with cache-bypass. Mirrors the contract
 * scripts/smoke-ask.sh already speaks: POST /api/ai/ask with
 * { "query": "..." }, expect { grounded, citations, ... }.
 */
async function probe(query: string): Promise<AskOutcome> {
  const t0 = Date.now();
  try {
    const res = await fetch(`${SITE}/api/ai/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-eval': 'nocache',
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30_000),
    });
    const j = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    // Citations arrive as objects ({slug, section, similarity}) in the
    // current /api/ai/ask contract; legacy URL strings ("/archive/<slug>")
    // are also handled defensively. Extract the slug either way.
    const rawCitations = Array.isArray(j.citations) ? j.citations : [];
    const citations = extractCitationSlugs(rawCitations);
    return {
      grounded: Boolean(j.grounded),
      citations,
      ms: Date.now() - t0,
      cached: j.cached === true,
    };
  } catch (e) {
    return { grounded: false, citations: [], ms: Date.now() - t0, error: e instanceof Error ? e.message : String(e) };
  }
}

/**
 * Extract slugs from a raw citations array. Handles both the current
 * /api/ai/ask contract (objects with `slug` field) and legacy URL
 * strings ("/archive/<slug>"). Exported for unit testing.
 */
export function extractCitationSlugs(raw: unknown[]): string[] {
  return raw
    .map((c: unknown): string => {
      if (typeof c === 'string') {
        return c.split('/').filter(Boolean).pop() ?? c;
      }
      if (c && typeof c === 'object' && 'slug' in c && typeof (c as { slug: unknown }).slug === 'string') {
        return (c as { slug: string }).slug;
      }
      return '';
    })
    .filter((s: string) => s.length > 0);
}

async function readBucket(key: string): Promise<CaseVerdict[]> {
  try {
    const row = await db.opsState.findUnique({ where: { key } });
    if (!row?.value) return [];
    const parsed = JSON.parse(row.value);
    return Array.isArray(parsed) ? (parsed as CaseVerdict[]) : [];
  } catch {
    return [];
  }
}

async function writeBucket(key: string, cases: CaseVerdict[]): Promise<void> {
  await db.opsState.upsert({
    where: { key },
    create: { key, value: JSON.stringify(cases) },
    update: { value: JSON.stringify(cases) },
  });
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const p = req.nextUrl.searchParams;

  // ── bedMode (#7 — wire lives here) ─────────────────────────────
  if (p.get('bed') === '1') {
    const { bedMode } = await import('@/lib/retrieval/bed-mode');
    return bedMode();
  }

  // ── finalize ──────────────────────────────────────────────────
  if (p.get('finalize') === '1') {
    const key = bucketKey(today());
    const cases = await readBucket(key);
    if (cases.length < GOLDEN_SET.length) {
      return NextResponse.json({
        status: 'incomplete',
        done: cases.length,
        total: GOLDEN_SET.length,
      });
    }
    const r = rollup(cases);
    const prev = parseStoredGoldenAsk((await db.opsState.findUnique({ where: { key: GOLDEN_ASK_OPS_KEY } }))?.value ?? null);
    const stored: StoredGoldenAsk = {
      rollup: r,
      consecutiveFailures: nextConsecutiveFailures(prev, r),
      checkedAt: new Date().toISOString(),
    };
    await db.opsState.upsert({
      where: { key: GOLDEN_ASK_OPS_KEY },
      create: { key: GOLDEN_ASK_OPS_KEY, value: JSON.stringify(stored) },
      update: { value: JSON.stringify(stored) },
    });
    return NextResponse.json({ ok: true, ...r, consecutiveFailures: stored.consecutiveFailures });
  }

  // ── list ──────────────────────────────────────────────────────
  const id = p.get('case');
  if (!id || id === '__list__') {
    return NextResponse.json({
      cases: GOLDEN_SET.map((c) => ({ id: c.id, kind: c.kind })),
    });
  }

  // ── per-case probe ────────────────────────────────────────────
  if (!GOLDEN_IDS.includes(id)) {
    return NextResponse.json(
      { error: 'unknown_case', cases: GOLDEN_IDS },
      { status: 400 },
    );
  }
  const c = GOLDEN_SET.find((x) => x.id === id)!;
  const outcome = await probe(c.query);
  const verdict = judge(c, outcome, c.maxMs ?? BUDGET);

  const key = bucketKey(today());
  const cases = await readBucket(key);
  // idempotent re-runs overwrite by id
  const next = [...cases.filter((v) => v.id !== verdict.id), verdict];
  await writeBucket(key, next);

  return NextResponse.json(verdict);
}

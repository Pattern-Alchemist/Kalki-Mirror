// =============================================================
// KALKI — /ask cache pre-warm cron (Vol. 5 #5, Vercel cron)
// -------------------------------------------------------------
// GET /api/cron/prewarm-ask          → walk the ten queries through the
//                                      EXACT ask path, store what lands
// GET /api/cron/prewarm-ask?dryRun=1 → retrieval-only coverage proof
//                                      (no LLM call, nothing stored)
//
// AUTH (mirrors the other crons):
//   · Authorization: Bearer <CRON_SECRET> — attached by Vercel
//   · ?key=<CRON_SECRET>                  — manual runs
//
// WHY: the ask-cache (Vol. 4 #14) makes a repeated query free — but only
// AFTER the first seeker pays the cold LLM cost. This cron pays it at
// 02:20 IST, before traffic, so the ten highest-value corpus questions
// are warm and the post-deploy smoke's 12s /ask budget holds by
// construction. Same modules as the route — retrieveCitation at the
// prithvi tier, the pattern-bridge boost, the corpus-or-silence gate,
// the strict parser — only the HTTP shell (rate limit, ai_* events,
// NextResponse) is absent, because an internal call has no IP to limit
// and the ledger is its observability.
//
// HONESTY RULES:
//   · A query the corpus cannot ground is a reported no-op, never forced.
//   · An already-cached query is skipped free (lookupAsk first) — the
//     list self-completes across runs; cache TTL is 7 days.
//   · The run carries a 45s wall budget (Vercel caps crons at 60s): it
//     warms as many queries as fit and reports the tail honestly. The
//     ledger row records how much work the run actually did.
//
// SCHEDULE: vercel.json "20 2 * * *" — after chain-health (15 2) so the
// chain state is fresh, before the digest (30 2). Failures are logged
// misses, not thrown crons.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { retrieveCitation } from "@/lib/rag/retrieval";
import { bridgeSlugsFor } from "@/lib/rag/pattern-bridge";
import {
  patternSlugsMentioned,
  isCorpusSilent,
  buildAskMessages,
  askSystemPrompt,
  parseAskOutput,
  ASK_TOP_K,
} from "@/lib/ai/ask";
import { askCacheKey, lookupAsk, storeAsk } from "@/lib/ai/ask-cache";
import { callLLM } from "@/lib/ai/llm";
import { PREWARM_QUERIES } from "@/lib/ai/prewarm-queries";
import { withCronLedger } from "@/lib/cron-ledger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Wall budget for the real run — leave headroom inside the 60s Vercel cap. */
const RUN_WALL_BUDGET_MS = 45_000;

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  if (header === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("key") === secret;
}

/** Retrieval + silence-gate verdict for one query — shared by both modes. */
async function retrieveFor(query: string) {
  const mentioned = patternSlugsMentioned(query);
  const boostSlugs = bridgeSlugsFor(mentioned);
  return retrieveCitation(query, "prithvi", { k: ASK_TOP_K, boostSlugs });
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";

  // Day-rotated walk order: the 45s wall budget means a cold chain only
  // warms 3–4 queries per run. A fixed order would starve the tail forever;
  // rotating the start by day-of-year (plus skip-cached lookups) lets the
  // list self-complete across daily runs in 2–3 days.
  const dayOffset = Math.floor(Date.now() / 86_400_000) % PREWARM_QUERIES.length;
  const WALK_ORDER = [
    ...PREWARM_QUERIES.slice(dayOffset),
    ...PREWARM_QUERIES.slice(0, dayOffset),
  ];

  if (dryRun) {
    // Coverage proof: retrieval only — does each query clear the
    // corpus-or-silence gate? No LLM call, nothing stored.
    const coverage: Array<{
      query: string;
      silent: boolean;
      method?: string;
      topSimilarity?: number;
      folios?: string[];
      error?: string;
    }> = [];
    for (const query of WALK_ORDER) {
      try {
        const retrieval = await retrieveFor(query);
        const retrievedSlugs = [...new Set(retrieval.chunks.map((c) => c.slug))];
        const silent = isCorpusSilent(retrieval.rawTopSimilarity, retrieval.method);
        coverage.push({
          query,
          silent,
          method: retrieval.method,
          topSimilarity: Math.round(retrieval.rawTopSimilarity * 1000) / 1000,
          folios: retrievedSlugs.slice(0, 3),
        });
      } catch (err) {
        coverage.push({
          query,
          silent: true,
          error: err instanceof Error ? err.message.slice(0, 120) : "retrieval failed",
        });
      }
    }
    const groundedCount = coverage.filter((c) => !c.silent).length;
    return NextResponse.json({
      ok: true,
      dryRun: true,
      queries: PREWARM_QUERIES.length,
      groundedCount,
      coverage,
    });
  }

  const { result: payload } = await withCronLedger("prewarm-ask", async () => {
    const startedAt = Date.now();
    let warmed = 0;
    let alreadyCached = 0;
    let silent = 0;
    const misses: Array<{ query: string; error: string }> = [];
    const skippedTail: string[] = [];

    for (const query of WALK_ORDER) {
      if (Date.now() - startedAt > RUN_WALL_BUDGET_MS) {
        skippedTail.push(query);
        continue;
      }
      try {
        const retrieval = await retrieveFor(query);
        const retrievedSlugs = [...new Set(retrieval.chunks.map((c) => c.slug))];
        if (retrieval.chunks.length === 0 || isCorpusSilent(retrieval.rawTopSimilarity, retrieval.method)) {
          silent += 1; // the corpus is honest here too — nothing to warm
          continue;
        }
        const cacheKey = askCacheKey(query, retrievedSlugs);
        const cached = await lookupAsk(cacheKey);
        if (cached) {
          alreadyCached += 1;
          continue;
        }
        const result = await callLLM(buildAskMessages(query, retrieval.chunks), {
          systemPrompt: askSystemPrompt(),
          jsonMode: true,
          temperature: 0.3,
          maxTokens: 1024,
        });
        const parsedOut = parseAskOutput(result.text, retrievedSlugs);
        if (!parsedOut) {
          misses.push({ query, error: "ungrounded_output" });
          continue;
        }
        await storeAsk(
          cacheKey,
          { answer: parsedOut.answer, cited_folios: parsedOut.citedSlugs },
          result.model
        );
        warmed += 1;
      } catch (err) {
        misses.push({
          query,
          error: (err instanceof Error ? err.message : String(err)).slice(0, 120),
        });
      }
    }

    return {
      items: warmed,
      payload: NextResponse.json({
        ok: true,
        queries: PREWARM_QUERIES.length,
        warmed,
        alreadyCached,
        silent,
        misses,
        skippedTail,
        durationMs: Date.now() - startedAt,
        sentAt: new Date().toISOString(),
      }),
    };
  });
  return payload.payload;
}

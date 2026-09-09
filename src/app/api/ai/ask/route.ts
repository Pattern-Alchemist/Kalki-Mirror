export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured } from '@/lib/ai/llm';
import { withAiRoute } from '@/lib/ai/observe';
import {
  isCorpusSilent,
  patternSlugsMentioned,
  buildAskMessages,
  askSystemPrompt,
  parseAskOutput,
  validateAskChainOutput,
  buildCitations,
  ASK_TOP_K,
  type AskResult,
} from '@/lib/ai/ask';
import { askCacheKey, lookupAsk, storeAsk, recordAskHit } from '@/lib/ai/ask-cache';
import { retrieveCitation } from '@/lib/rag/retrieval';
import { bridgeSlugsFor } from '@/lib/rag/pattern-bridge';
import { getClientIp } from '@/lib/api-auth';
import { aiAskSchema } from '@/lib/validators/schemas';
import { aiRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/ai/ask — public grounded Q&A (Vol. 4 #14)
 *
 * One question in, one of two honest outcomes out:
 *   · grounded  — an answer synthesized ONLY from the retrieved corpus,
 *                 citing validated folio slugs (chips link to /archive/[slug])
 *   · silence   — "the corpus is silent on this" (retrieval too weak, or the
 *                 LLM failed the grounding contract; both are silence)
 *
 * Reuses the wizard's exact retrieval stack (citation pool at the public
 * 'prithvi' tier + deterministic pattern-bridge boost) and SynthesisCache.
 * Rate limited: 5 req/min per IP. Observability: ai_ask events (#17).
 */
async function handle(request: NextRequest): Promise<NextResponse> {
  try {
    if (!isLLMConfigured()) {
      return NextResponse.json(
        { error: 'AI engine is not configured. The geometry awaits calibration.' },
        { status: 503 }
      );
    }

    const ip = getClientIp(request);
    const { limited } = await aiRateLimit(ip);
    if (limited) {
      return NextResponse.json(
        { error: 'Too many questions. Let the corpus breathe, then ask again.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = aiAskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }
    const { query } = parsed.data;

    // ── Retrieval: the wizard's citation pool at the PUBLIC tier ──────────
    // prithvi = strictest caution ladder; the bridge boosts folios linked to
    // any pattern the seeker names, but never widens the caution filter.
    const mentioned = patternSlugsMentioned(query);
    const boostSlugs = bridgeSlugsFor(mentioned);
    const retrieval = await retrieveCitation(query, 'prithvi', {
      k: ASK_TOP_K,
      boostSlugs,
    });

    const retrievedSlugs = [...new Set(retrieval.chunks.map((c) => c.slug))];

    // ── Corpus-or-silence gate #1: retrieval strength ─────────────────────
    if (retrieval.chunks.length === 0 || isCorpusSilent(retrieval.rawTopSimilarity, retrieval.method)) {
      const silent: AskResult = { grounded: false, reason: 'corpus_silent' };
      return NextResponse.json(silent);
    }

    // ── Cache: identical (query · retrieved folio set) → zero LLM cost ────
    const cacheKey = askCacheKey(query, retrievedSlugs);
    const cached = await lookupAsk(cacheKey);
    if (cached) {
      recordAskHit(cacheKey);
      const hit: AskResult = {
        grounded: true,
        answer: cached.output.answer,
        citations: buildCitations(cached.output.cited_folios, retrieval.chunks),
        model: cached.model,
        method: retrieval.method,
        cached: true,
      };
      return NextResponse.json(hit);
    }

    // ── Synthesis: grounded, cited, compact ───────────────────────────────
    const result = await callLLM(buildAskMessages(query, retrieval.chunks), {
      systemPrompt: askSystemPrompt(),
      jsonMode: true,
      temperature: 0.3,
      maxTokens: 1024,
      // The chain walk enforces THIS route's output contract per model:
      // garbage walks on, an honest grounded=false comes home as silence,
      // a clean grounded answer comes home as the answer. Found live
      // 2026-09-09 — 3/4 chain models dead, the single survivor returned
      // off-contract text, and the route silenced while a healthy model
      // sat later in its own chain. Gate #2 below still stands as the
      // final honesty floor (the walk validator can only save an ask when
      // a LATER model answers clean; it can never loosen strictness).
      validate: (text) => validateAskChainOutput(text, retrievedSlugs),
    });

    const parsedOut = parseAskOutput(result.text, retrievedSlugs);
    if (!parsedOut) {
      // Gate #2: the LLM broke the grounding contract (bad JSON, grounded=false,
      // empty answer, or a citation it was never shown) → silence, not improvisation.
      const silent: AskResult = { grounded: false, reason: 'ungrounded_output' };
      return NextResponse.json(silent);
    }

    await storeAsk(
      cacheKey,
      { answer: parsedOut.answer, cited_folios: parsedOut.citedSlugs },
      result.model
    );

    const grounded: AskResult = {
      grounded: true,
      answer: parsedOut.answer,
      citations: buildCitations(parsedOut.citedSlugs, retrieval.chunks),
      model: result.model,
      method: retrieval.method,
      cached: false,
    };
    return NextResponse.json(grounded);
  } catch (err: unknown) {
    console.error('[ai/ask]', err);
    return NextResponse.json(
      { error: 'The archivist is momentarily unavailable. Try again shortly.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return withAiRoute('ai_ask', '/api/ai/ask', request, handle);
}

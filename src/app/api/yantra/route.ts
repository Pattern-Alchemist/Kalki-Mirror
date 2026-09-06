export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { YANTRA_SYSTEM_PROMPT, buildYantraUserPrompt, type YantraAnalysis } from '@/lib/ai/yantra-prompt';
import { retrievePrescription, retrieveCitation } from '@/lib/rag/retrieval';
import { bridgeSlugsForNames } from '@/lib/rag/pattern-bridge';
import { ALL_ARCHETYPES } from '@/lib/data/archetypes';
import type { Tier } from '@/lib/data/types';
import { optionalAuth, getClientIp } from '@/lib/api-auth';
import { yantraSchema } from '@/lib/validators/schemas';
import { initiateRateLimit } from '@/lib/rate-limit';


/**
 * POST /api/yantra
 *
 * Accepts a behavioral pattern query and returns
 * a RAG-grounded YANTRA analysis.
 *
 * Rate limited: 5 req/min per IP.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    const { limited } = await initiateRateLimit(ip);
    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests. The geometry needs time to stabilize.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = yantraSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { query, context } = parsed.data;

    // Use session tier if available, fall back to context tier, then prithvi
    const token = await optionalAuth(request);
    const sessionTier = (token?.tier as string) || null;
    const userTier = (sessionTier || context?.tier || 'prithvi') as Tier;

    // RAG retrieval — two pools
    let folioChunks: { slug: string; section: string; caution: string; text: string }[] = [];
    let retrievalMethod = 'none';

    try {
      // Vol. 1 #16 — behavioral bridge: named patterns in the context payload
      // deterministically boost their linked folios inside the filtered pools.
      const boostSlugs = bridgeSlugsForNames(context?.dominantPatterns ?? []);
      const [presResult, citeResult] = await Promise.all([
        retrievePrescription(query, { k: 4, boostSlugs }),
        retrieveCitation(query, userTier, { k: 4, boostSlugs }),
      ]);

      // Deduplicate
      const seen = new Set<string>();
      const merged = [...presResult.chunks, ...citeResult.chunks]
        .filter(c => {
          const key = `${c.slug}:${c.section}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

      folioChunks = merged.map(c => ({
        slug: c.slug,
        section: c.section,
        caution: c.caution,
        text: c.text,
      }));
      retrievalMethod = merged.length > 0 ? (presResult.method || 'keyword') : 'none';
    } catch {
      retrievalMethod = 'fallback';
    }

    // Build the grounded prompt
    const userPrompt = buildYantraUserPrompt(query, {
      dominantPatterns: context?.dominantPatterns,
      currentTransit: context?.currentTransit,
      sadhanaStreaks: context?.sadhanaStreaks,
      folioChunks,
      archetypeList: ALL_ARCHETYPES.map(a => ({
        id: a.id,
        name: a.name,
        sanskrit: a.sanskrit,
        pattern: a.pattern,
        bija: a.bija,
      })),
    });

    // NOTE: The system prompt is NO LONGER exposed via GET.
    // In production: call your LLM API here with YANTRA_SYSTEM_PROMPT + userPrompt.

    return NextResponse.json({
      status: 'grounded_prompt_ready',
      retrieval_method: retrievalMethod,
      folio_blocks_injected: folioChunks.length,
      archive_refs: [...new Set(folioChunks.map(c => c.slug))],
      system_prompt_length: YANTRA_SYSTEM_PROMPT.length,
      user_prompt_length: userPrompt.length,
      user_prompt: userPrompt,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'YANTRA processing error. The geometry requires recalibration.' },
      { status: 500 }
    );
  }
}

// GET /api/yantra/prompt has been REMOVED — system prompt is no longer publicly exposed.

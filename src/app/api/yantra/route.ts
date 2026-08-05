export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { YANTRA_SYSTEM_PROMPT, buildYantraUserPrompt, type YantraAnalysis } from '@/lib/ai/yantra-prompt';
import { retrievePrescription, retrieveCitation } from '@/lib/rag/retrieval';
import { ALL_ARCHETYPES } from '@/lib/data/archetypes';
import type { Tier } from '@/lib/data/types';

/**
 * POST /api/yantra
 *
 * Accepts a behavioral pattern query and returns
 * a RAG-grounded YANTRA analysis.
 *
 * When an LLM provider is connected, this routes to the LLM
 * with the grounded prompt (folio chunks + archetype list).
 * Currently returns the complete prompt structure for development.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context } = body as {
      query: string;
      context?: {
        dominantPatterns?: string[];
        currentTransit?: string;
        sadhanaStreaks?: { practice: string; days: number }[];
        tier?: string;
      };
    };

    if (!query || typeof query !== 'string' || query.length < 10) {
      return NextResponse.json(
        { error: 'Insufficient input. Describe the behavioral pattern in detail.' },
        { status: 400 }
      );
    }

    if (query.length > 2000) {
      return NextResponse.json(
        { error: 'Input exceeds maximum length. Be precise, not exhaustive.' },
        { status: 400 }
      );
    }

    const userTier = (context?.tier || 'prithvi') as Tier;

    // RAG retrieval — two pools
    let folioChunks: { slug: string; section: string; caution: string; text: string }[] = [];
    let retrievalMethod = 'none';

    try {
      const [presResult, citeResult] = await Promise.all([
        retrievePrescription(query, { k: 4 }),
        retrieveCitation(query, userTier, { k: 4 }),
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

    // In production: call your LLM API here with YANTRA_SYSTEM_PROMPT + userPrompt
    // const completion = await callLLM(YANTRA_SYSTEM_PROMPT, userPrompt);
    // const analysis: YantraAnalysis = JSON.parse(completion);

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

/**
 * GET /api/yantra/prompt
 *
 * Returns the raw YANTRA system prompt for inspection.
 */
export async function GET() {
  return NextResponse.json({
    system_prompt: YANTRA_SYSTEM_PROMPT,
    grounding_rules: [
      'GROUNDING: tantric_citation must trace to a provided <folio> block; include source_slug',
      'PRESCRIPTION: prescribed_sadhana may draw ONLY from OPEN-tier folios',
      'CLASSIFICATION: archetype id must come from the provided ARCHETYPE LIST',
    ],
    forbidden_words: ['vibe', 'manifest', 'zodiac', 'energy healing', 'universe', 'journey', 'chakras', 'toxic', 'trauma', 'crystal', 'reiki', 'angel numbers'],
    required_lexicon: ['geometry', 'architecture', 'pattern', 'loop', 'resonance', 'discernment', 'algorithm', 'mechanics', 'vector', 'structure', 'system', 'calculus', 'axis', 'coordinates', 'frequency', 'oscillation'],
  });
}

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { YANTRA_SYSTEM_PROMPT, buildYantraUserPrompt, type YantraAnalysis } from '@/lib/ai/yantra-prompt';
import { retrievePrescription, retrieveCitation } from '@/lib/rag/retrieval';
import { ALL_ARCHETYPES } from '@/lib/data/archetypes';
import type { Tier } from '@/lib/data/types';
import { optionalAuth } from '@/lib/api-auth';

/**
 * In-memory rate limiter for /api/yantra and /api/initiate.
 * Tracks IP → [{ timestamp }]. Allows 5 requests per minute.
 */
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entries = rateLimitMap.get(ip) || [];
  // Prune old entries
  const recent = entries.filter(t => now - t < RATE_LIMIT_WINDOW);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';
}

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
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. The geometry needs time to stabilize.' },
        { status: 429 }
      );
    }

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

    // Use session tier if available, fall back to context tier, then prithvi
    const token = await optionalAuth(request);
    const sessionTier = (token?.tier as string) || null;
    const userTier = (sessionTier || context?.tier || 'prithvi') as Tier;

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

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { allPatterns } from '@/lib/data/patterns';
import { ALL_ARCHETYPES } from '@/lib/data/archetypes';
import { getClientIp } from '@/lib/api-auth';
import { aiPatternExplainSchema } from '@/lib/validators/schemas';

// ── Rate limiter: 5 req/min per IP ──
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entries = rateLimitMap.get(ip) || [];
  const recent = entries.filter(t => now - t < RATE_LIMIT_WINDOW);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_LIMIT_MAX) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

/**
 * POST /api/ai/pattern-explain
 *
 * Pattern plain-English explanation — takes a pattern slug,
 * looks up the full pattern data, and asks the LLM to
 * produce a structured explanation in modern language.
 *
 * Rate limited: 5 req/min per IP.
 */
/**
 * Rule-based fallback: returns a structured explanation from the
 * static pattern data when the LLM is unavailable.
 */
function fallbackExplanation(pattern: typeof allPatterns[number], archetype: typeof ALL_ARCHETYPES[number] | undefined) {
  return {
    name: pattern.name,
    explanation: pattern.description,
    modernAnalogy: archetype
      ? `Like a ${archetype.element.toLowerCase()}-based algorithm that keeps executing the same subroutine — ${pattern.name.toLowerCase()} operates as an unconscious program running beneath conscious awareness, shaping decisions, relationships, and self-perception.`
      : `${pattern.name} operates as an unconscious behavioral program — a recurring loop that shapes decisions, relationships, and self-perception without conscious awareness.`,
    signs: [...pattern.signs],
    practice: pattern.practice,
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!isLLMConfigured()) {
      // Attempt to serve a rule-based response instead of 503
      const body = await request.json().catch(() => null);
      if (body?.patternSlug) {
        const pattern = allPatterns.find(p => p.slug === body.patternSlug);
        const archetype = ALL_ARCHETYPES.find(a =>
          a.relatedPatternSlugs.includes(body.patternSlug)
        );
        if (pattern) {
          console.warn('[/api/ai/pattern-explain] LLM not configured, using fallback for:', body.patternSlug);
          return NextResponse.json(fallbackExplanation(pattern, archetype));
        }
      }
      return NextResponse.json(
        { error: 'AI engine is not configured. The geometry awaits calibration.' },
        { status: 503 }
      );
    }

    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. The geometry needs time to stabilize.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = aiPatternExplainSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { patternSlug, context } = parsed.data;

    // Find the pattern
    const pattern = allPatterns.find(p => p.slug === patternSlug);
    if (!pattern) {
      return NextResponse.json(
        { error: `Pattern "${patternSlug}" not found in the pattern matrix.` },
        { status: 404 }
      );
    }

    // Find related archetype for richer context
    const relatedArchetype = ALL_ARCHETYPES.find(a =>
      a.relatedPatternSlugs.includes(patternSlug)
    );

    const systemPrompt = `${YANTRA_PERSONA}

You are explaining a behavioral pattern from the KALKI pattern-matrix to a practitioner.
Given the pattern's full data, produce a clear, structured explanation in modern English.

Return JSON with this exact structure:
{
  "name": "<pattern name>",
  "explanation": "<2-3 paragraph plain-English explanation of what this pattern is, how it forms, and how it operates>",
  "modernAnalogy": "<a concise modern analogy — e.g. a technology, system, or everyday phenomenon that maps to this pattern>",
  "signs": ["<sign 1 in plain language>", "<sign 2>", ...],
  "practice": "<the prescribed sādhana practice rewritten in plain, actionable language>"
}`;

    const contextBlock = context
      ? `\n\nAdditional user context: "${context}"`
      : '';

    const archetypeBlock = relatedArchetype
      ? `\n\nRelated archetype: ${relatedArchetype.name} (${relatedArchetype.sanskrit}) — ${relatedArchetype.pattern}`
      : '';

    const userPrompt = `Pattern data:
${JSON.stringify(pattern, null, 2)}${archetypeBlock}${contextBlock}

Explain this pattern in plain English. Respond ONLY with valid JSON.`;

    const result = await callLLM(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        jsonMode: true,
        temperature: 0.4,
        maxTokens: 1536,
      }
    );

    let parsedResponse: {
      name: string;
      explanation: string;
      modernAnalogy: string;
      signs: string[];
      practice: string;
    };
    try {
      parsedResponse = JSON.parse(result.text);
    } catch {
      return NextResponse.json(
        { error: 'AI response could not be parsed. The geometry returned garbled data.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      name: parsedResponse.name || pattern.name,
      explanation: parsedResponse.explanation || '',
      modernAnalogy: parsedResponse.modernAnalogy || '',
      signs: Array.isArray(parsedResponse.signs) ? parsedResponse.signs : [],
      practice: parsedResponse.practice || '',
    });
  } catch (error) {
    console.error('[/api/ai/pattern-explain]', error);
    return NextResponse.json(
      { error: 'AI pattern explanation failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}

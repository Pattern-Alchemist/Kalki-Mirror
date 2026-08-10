export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { getClientIp } from '@/lib/api-auth';
import { aiExplainSchema } from '@/lib/validators/schemas';

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
 * POST /api/ai/explain
 *
 * Codex explainer — rewrites dense Vedic/Sanskrit content into
 * accessible language. Supports 'beginner' and 'technical' styles.
 *
 * Rate limited: 5 req/min per IP.
 */
export async function POST(request: NextRequest) {
  try {
    if (!isLLMConfigured()) {
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
    const parsed = aiExplainSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content, style } = parsed.data;

    const stylePrompts: Record<string, string> = {
      beginner:
        'Rewrite this Vedic/Tantric content into clear, accessible modern English. Preserve the core meaning but remove jargon. At the end, list 5 key terms with brief definitions.',
      technical:
        'Rewrite this Vedic/Tantric content into precise, technically accurate language suitable for an advanced practitioner. Preserve all Sanskrit terminology with diacritical marks. At the end, list 5 key terms with brief technical definitions.',
    };

    const systemPrompt = `${YANTRA_PERSONA}

${stylePrompts[style]}

Return JSON: { "explanation": "<your rewritten explanation>", "keyTerms": ["term1: definition", "term2: definition", ...] }`;

    const userPrompt = `Content to explain:\n\n${content}`;

    const result = await callLLM(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        jsonMode: true,
        temperature: 0.4,
        maxTokens: 2048,
      }
    );

    let parsedResponse: { explanation: string; keyTerms: string[] };
    try {
      parsedResponse = JSON.parse(result.text);
    } catch {
      return NextResponse.json(
        { error: 'AI response could not be parsed. The geometry returned garbled data.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      explanation: parsedResponse.explanation || '',
      keyTerms: Array.isArray(parsedResponse.keyTerms) ? parsedResponse.keyTerms : [],
    });
  } catch (error) {
    console.error('[/api/ai/explain]', error);
    return NextResponse.json(
      { error: 'AI explanation failed. The codex requires recalibration.' },
      { status: 500 }
    );
  }
}

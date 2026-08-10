export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { getClientIp } from '@/lib/api-auth';
import { japaGuideSchema } from '@/lib/validators/schemas';

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
 * POST /api/ai/japa-guide
 *
 * Japa session guide — generates a pre-session guided focus text
 * for mantra repetition, including deity, focus, intention, and reflection.
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
    const parsed = japaGuideSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { mantra, count, experience } = parsed.data;

    const systemPrompt = `${YANTRA_PERSONA}

Generate a brief guided focus text for a japa (mantra repetition) session. Include the deity associated with this mantra, what to focus on during repetition, the intended spiritual outcome, and a post-session reflection prompt.

Return JSON: { "guide": "<3-5 sentence guided focus text for the session>", "deity": "<deity or principle this mantra invokes>", "focus": "<what to concentrate on during repetition>", "intention": "<the intended spiritual outcome or resonance>", "postSessionReflection": "<1-2 sentence reflection prompt for after the session>" }`;

    const experienceContext = experience
      ? `\n\nPractitioner context: ${experience}`
      : '';

    const userPrompt = `Mantra: "${mantra}"
Repetition count: ${count}${experienceContext}

Generate a japa session guide for this mantra. Respond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON object.`;

    const result = await callLLM(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        jsonMode: true,
        temperature: 0.5,
        maxTokens: 1024,
      }
    );

    let parsedResponse: {
      guide: string;
      deity: string;
      focus: string;
      intention: string;
      postSessionReflection: string;
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
      guide: parsedResponse.guide || '',
      deity: parsedResponse.deity || '',
      focus: parsedResponse.focus || '',
      intention: parsedResponse.intention || '',
      postSessionReflection: parsedResponse.postSessionReflection || '',
    });
  } catch (error) {
    console.error('[/api/ai/japa-guide]', error);
    return NextResponse.json(
      { error: 'Japa guide generation failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}

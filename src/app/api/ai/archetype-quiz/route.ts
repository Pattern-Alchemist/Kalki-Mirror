export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { getClientIp } from '@/lib/api-auth';
import { archetypeQuizSchema } from '@/lib/validators/schemas';

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
 * POST /api/ai/archetype-quiz
 *
 * Personality quiz — analyzes answers to spiritual/personality questions
 * and determines the dominant Mahavidya archetype from the 10 Mahavidyas.
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
    const parsed = archetypeQuizSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { answers } = parsed.data;

    const systemPrompt = `${YANTRA_PERSONA}

Based on these answers to a spiritual/personality assessment, determine which of the 10 Mahavidya archetypes best matches this person. Consider their patterns, fears, strengths, and inclinations.

The 10 Mahavidyas are: bagalamukhi, chhinnamasta, dhoomavati, kali, tara, tripurasundari, bhuvaneshvari, bhairavi, matangi, kamala.

Return JSON: { "archetypeId": "<lowercase id>", "archetypeName": "<English name>", "sanskrit": "<Sanskrit name in IAST>", "description": "<2-3 sentence description of how this archetype resonates with their patterns>", "bija": "<seed syllable associated with this archetype>", "pattern": "<the core behavioral/life pattern this archetype governs>", "confidence": <number 0-100>, "secondaryArchetype": "<id of secondary archetype or null>" }`;

    const userPrompt = `Answers to spiritual/personality assessment (${answers.length} questions):

${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Analyze these answers and determine the dominant Mahavidya archetype. Respond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON object.`;

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
      archetypeId: string;
      archetypeName: string;
      sanskrit: string;
      description: string;
      bija: string;
      pattern: string;
      confidence: number;
      secondaryArchetype: string | null;
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
      archetypeId: parsedResponse.archetypeId || 'kali',
      archetypeName: parsedResponse.archetypeName || 'Unknown',
      sanskrit: parsedResponse.sanskrit || '',
      description: parsedResponse.description || '',
      bija: parsedResponse.bija || '',
      pattern: parsedResponse.pattern || '',
      confidence: typeof parsedResponse.confidence === 'number' ? parsedResponse.confidence : 0,
      secondaryArchetype: parsedResponse.secondaryArchetype || null,
    });
  } catch (error) {
    console.error('[/api/ai/archetype-quiz]', error);
    return NextResponse.json(
      { error: 'Archetype analysis failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { getClientIp } from '@/lib/api-auth';
import { transitInterpretationSchema } from '@/lib/validators/schemas';
import { aiRateLimit } from '@/lib/rate-limit';


/**
 * POST /api/ai/transit-interpretation
 *
 * Daily transit insight — interprets current planetary positions
 * for spiritual practice, mantras, and energetic resonance.
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
    const { limited } = await aiRateLimit(ip);
    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests. The geometry needs time to stabilize.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = transitInterpretationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { positions } = parsed.data;

    const systemPrompt = `${YANTRA_PERSONA}

Given these current planetary positions, provide a Vedic-informed interpretation for spiritual practice. Be specific about recommended practices, mantras, and energies. Return JSON: { interpretation: paragraph, recommendedPractice: specific practice name, energyNote: one sentence }`;

    const userPrompt = `Current planetary positions:
${JSON.stringify(positions, null, 2)}

Provide the transit interpretation. Respond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON object.`;

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
      interpretation: string;
      recommendedPractice: string;
      energyNote: string;
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
      interpretation: parsedResponse.interpretation || '',
      recommendedPractice: parsedResponse.recommendedPractice || '',
      energyNote: parsedResponse.energyNote || '',
    });
  } catch (error) {
    console.error('[/api/ai/transit-interpretation]', error);
    return NextResponse.json(
      { error: 'Transit interpretation failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}

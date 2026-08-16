export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { getClientIp } from '@/lib/api-auth';
import { breathworkSchema } from '@/lib/validators/schemas';
import { aiRateLimit } from '@/lib/rate-limit';


/**
 * POST /api/ai/breathwork
 *
 * Breathwork protocol — generates a Pranayama/breathwork sequence
 * with phase-by-phase instructions and timings.
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
    const parsed = breathworkSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { type, duration } = parsed.data;

    const systemPrompt = `${YANTRA_PERSONA}

Generate a Pranayama/breathwork protocol for the given type and duration. Include phase-by-phase instructions with timings.

Breathwork types:
- calming: parasympathetic activation, slow rhythms
- energizing: sympathetic activation, stimulating patterns
- focus: concentration-enhancing, balanced breath
- nadi-shuddhi: alternate nostril purification
- bhramari: humming bee breath
- custom: general balanced protocol

Return JSON: { "name": "<protocol name>", "description": "<1-2 sentence description>", "phases": [{ "name": "<phase name>", "durationSec": <duration in seconds>, "instruction": "<clear instruction for this phase>", "breathCount": <optional number of breath cycles> }], "benefits": ["<benefit1>", "<benefit2>", ...], "caution": "<caution note or null>" }`;

    const userPrompt = `Breathwork type: ${type}
Duration: ${duration} minutes

Generate a complete Pranayama protocol. Ensure the total duration of all phases approximately equals ${duration} minutes (${duration * 60} seconds). Include 3-8 phases. Respond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON object.`;

    const result = await callLLM(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        jsonMode: true,
        temperature: 0.4,
        maxTokens: 2048,
      }
    );

    let parsedResponse: {
      name: string;
      description: string;
      phases: {
        name: string;
        durationSec: number;
        instruction: string;
        breathCount?: number;
      }[];
      benefits: string[];
      caution: string | null;
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
      name: parsedResponse.name || `${type} breathwork`,
      description: parsedResponse.description || '',
      phases: Array.isArray(parsedResponse.phases) ? parsedResponse.phases : [],
      benefits: Array.isArray(parsedResponse.benefits) ? parsedResponse.benefits : [],
      caution: parsedResponse.caution || null,
    });
  } catch (error) {
    console.error('[/api/ai/breathwork]', error);
    return NextResponse.json(
      { error: 'Breathwork protocol failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}

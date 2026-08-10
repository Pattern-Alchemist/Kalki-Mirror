export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { getClientIp } from '@/lib/api-auth';
import { consultationScreenSchema } from '@/lib/validators/schemas';

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

const VALID_URGENCIES = ['low', 'medium', 'high'] as const;
const VALID_ARCHETYPES = [
  'bagalamukhi', 'chhinnamasta', 'dhoomavati', 'kali',
  'tara', 'tripurasundari', 'bhuvaneshvari', 'bhairavi',
  'matangi', 'kamala',
] as const;

/**
 * POST /api/ai/consultation-screen
 *
 * Pre-consultation analysis — categorizes a consultation request,
 * assesses urgency, identifies focus areas, and suggests matching
 * Mahavidya archetypes for the admin view.
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
    const parsed = consultationScreenSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, message } = parsed.data;

    const systemPrompt = `${YANTRA_PERSONA}

Analyze this consultation request from a prospective client. Categorize their need, assess urgency, identify 3-5 key focus areas, suggest 1-2 matching Mahavidya archetypes by ID (from: bagalamukhi, chhinnamasta, dhoomavati, kali, tara, tripurasundari, bhuvaneshvari, bhairavi, matangi, kamala), and write a 2-sentence summary for the archivist. Return JSON.`;

    const userPrompt = `Prospective client: "${name}"

Their message:
"""${message}"""

Return JSON with this exact schema:
{
  "category": "string — one of: relationship, career, health, spiritual-growth, emotional-pattern, life-transition, ancestral-work, other",
  "urgency": "low" | "medium" | "high",
  "focusAreas": ["string — 3-5 key focus areas"],
  "suggestedArchetypes": ["string — 1-2 archetype IDs from the list above"],
  "summary": "string — 2-sentence summary for the archivist"
}

Respond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON object.`;

    const result = await callLLM(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        jsonMode: true,
        temperature: 0.3,
        maxTokens: 1024,
      }
    );

    let parsedResponse: {
      category: string;
      urgency: string;
      focusAreas: string[];
      suggestedArchetypes: string[];
      summary: string;
    };
    try {
      parsedResponse = JSON.parse(result.text);
    } catch {
      return NextResponse.json(
        { error: 'AI response could not be parsed. The geometry returned garbled data.' },
        { status: 502 }
      );
    }

    // Sanitize urgency to valid values
    const urgency = VALID_URGENCIES.includes(parsedResponse.urgency as typeof VALID_URGENCIES[number])
      ? parsedResponse.urgency
      : 'medium';

    // Filter suggested archetypes to valid IDs
    const validArchetypeSet = new Set(VALID_ARCHETYPES);
    const suggestedArchetypes = (parsedResponse.suggestedArchetypes || [])
      .filter((a: string) => validArchetypeSet.has(a as typeof VALID_ARCHETYPES[number]))
      .slice(0, 2);

    return NextResponse.json({
      category: parsedResponse.category || 'other',
      urgency,
      focusAreas: Array.isArray(parsedResponse.focusAreas)
        ? parsedResponse.focusAreas.slice(0, 5)
        : [],
      suggestedArchetypes,
      summary: parsedResponse.summary || '',
    });
  } catch (error) {
    console.error('[/api/ai/consultation-screen]', error);
    return NextResponse.json(
      { error: 'Consultation screening failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}

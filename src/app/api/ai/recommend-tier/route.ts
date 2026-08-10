export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { getClientIp } from '@/lib/api-auth';
import { recommendTierSchema } from '@/lib/validators/schemas';

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
 * POST /api/ai/recommend-tier
 *
 * Pricing page plan recommender — analyzes answers about interest in
 * Vedic wisdom and recommends the best membership tier.
 *
 * Tiers: prithvi (Antechamber), jal (Initiate), agni (Practitioner), akash (Vault).
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
    const parsed = recommendTierSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { answers } = parsed.data;

    const systemPrompt = `${YANTRA_PERSONA}

Based on these answers about their interest in Vedic wisdom, recommend which membership tier suits them best. Explain why. List specific content they'd unlock.

Membership tiers:
- prithvi (Antechamber): Foundation tier. Basic access to introductory practices, foundational archetypes, and entry-level patterns. Best for curious beginners.
- jal (Initiate): Intermediate tier. Access to structured sādhana protocols, detailed archetype analyses, mantra libraries, and breathwork sequences. Best for committed practitioners establishing a daily practice.
- agni (Practitioner): Advanced tier. Full access to advanced practices, detailed transit interpretations, pattern deep-dives, yantra construction guides, and community consultations. Best for experienced practitioners seeking depth.
- akash (Vault): Master tier. Complete unrestricted access to all content including sealed practices, research codices, advanced Mahavidya workings, and priority consultations. Best for serious practitioners and scholars.

Return JSON: { "recommendedTier": "<prithvi|jal|agni|akash>", "tierElement": "<element name: Earth|Water|Fire|Space>", "reason": "<2-3 sentence explanation of why this tier fits>", "unlockedFeatures": ["<feature1>", "<feature2>", ...] }`;

    const userPrompt = `Answers to "What draws you to Vedic wisdom?" quiz (${answers.length} questions):

${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Recommend the most suitable membership tier based on their interests, depth of engagement, and what they'd benefit from most. Respond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON object.`;

    const result = await callLLM(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        jsonMode: true,
        temperature: 0.5,
        maxTokens: 1024,
      }
    );

    const validTiers = ['prithvi', 'jal', 'agni', 'akash'];

    let parsedResponse: {
      recommendedTier: string;
      tierElement: string;
      reason: string;
      unlockedFeatures: string[];
    };

    try {
      parsedResponse = JSON.parse(result.text);
    } catch {
      return NextResponse.json(
        { error: 'AI response could not be parsed. The geometry returned garbled data.' },
        { status: 502 }
      );
    }

    const tier = validTiers.includes(parsedResponse.recommendedTier)
      ? parsedResponse.recommendedTier
      : 'prithvi';

    const tierElementMap: Record<string, string> = {
      prithvi: 'Earth',
      jal: 'Water',
      agni: 'Fire',
      akash: 'Space',
    };

    return NextResponse.json({
      recommendedTier: tier,
      tierElement: parsedResponse.tierElement || tierElementMap[tier] || 'Earth',
      reason: parsedResponse.reason || '',
      unlockedFeatures: Array.isArray(parsedResponse.unlockedFeatures) ? parsedResponse.unlockedFeatures : [],
    });
  } catch (error) {
    console.error('[/api/ai/recommend-tier]', error);
    return NextResponse.json(
      { error: 'Tier recommendation failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { getClientIp } from '@/lib/api-auth';
import { recommendTierSchema } from '@/lib/validators/schemas';
import { aiRateLimit } from '@/lib/rate-limit';


// ── Rule-based fallback when LLM is not configured or fails ──
const ANSWER_TIER_WEIGHTS: Record<string, Record<string, number>> = {
  // Q1: What draws you
  'intellectual-curiosity': { prithvi: 3, jal: 1, agni: 0, akash: 0 },
  'solve-patterns':         { prithvi: 1, jal: 3, agni: 1, akash: 0 },
  'daily-practice':         { prithvi: 0, jal: 2, agni: 3, akash: 1 },
  'complete-mastery':       { prithvi: 0, jal: 0, agni: 2, akash: 3 },
  // Q2: Experience level
  'beginner':           { prithvi: 3, jal: 1, agni: 0, akash: 0 },
  'tried-meditation':   { prithvi: 1, jal: 3, agni: 1, akash: 0 },
  'regular-practice':   { prithvi: 0, jal: 2, agni: 3, akash: 1 },
  'advanced':           { prithvi: 0, jal: 0, agni: 2, akash: 3 },
  // Q3: Depth of access
  'basics':               { prithvi: 3, jal: 1, agni: 0, akash: 0 },
  'structured-practices': { prithvi: 0, jal: 3, agni: 2, akash: 0 },
  'advanced-siddhis':     { prithvi: 0, jal: 1, agni: 3, akash: 2 },
  'everything':           { prithvi: 0, jal: 0, agni: 1, akash: 3 },
};

const TIER_INFO: Record<string, { tierElement: string; reason: string; unlockedFeatures: string[] }> = {
  prithvi: {
    tierElement: 'Earth',
    reason: 'Your curiosity and foundational interest in Vedic wisdom aligns with Prithvi — the solid earth from which all deeper practice grows. This tier provides the essential maps and introductory practices to orient your trajectory.',
    unlockedFeatures: ['Introductory practices', 'Foundational archetypes', 'Entry-level patterns', 'Basic breathwork sequences'],
  },
  jal: {
    tierElement: 'Water',
    reason: 'Your commitment to establishing a regular practice places you in the Jal stream — the flowing water that deepens with consistent effort. This tier provides structured sādhana protocols, detailed archetype analyses, and the mantra libraries your practice needs.',
    unlockedFeatures: ['Structured sādhana protocols', 'Full archetype analyses', 'Mantra library', 'Breathwork sequences', 'Pattern analysis tools'],
  },
  agni: {
    tierElement: 'Fire',
    reason: 'Your depth of experience and appetite for advanced technique places you in the Agni stream — the transformative fire that burns through superficial understanding. This tier provides advanced siddhis, detailed transit interpretations, and yantra construction guides.',
    unlockedFeatures: ['Advanced siddhis', 'Detailed transit interpretations', 'Pattern deep-dives', 'Yantra construction guides', 'Community consultations'],
  },
  akash: {
    tierElement: 'Space',
    reason: 'Your pursuit of complete mastery places you in Akash — the boundless sky that contains all practices without restriction. This tier provides unrestricted access to sealed practices, research codices, and priority consultations.',
    unlockedFeatures: ['All content including sealed practices', 'Research codices', 'Advanced Mahavidya workings', 'Priority consultations', 'Early access to new content'],
  },
};

function fallbackRecommendation(answers: string[]) {
  const scores: Record<string, number> = { prithvi: 0, jal: 0, agni: 0, akash: 0 };
  for (const a of answers) {
    const weights = ANSWER_TIER_WEIGHTS[a];
    if (!weights) continue;
    for (const [tier, w] of Object.entries(weights)) {
      scores[tier] = (scores[tier] || 0) + w;
    }
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const tier = sorted[0]?.[0] || 'prithvi';
  const info = TIER_INFO[tier];
  return { recommendedTier: tier, ...info };
}

/**
 * POST /api/ai/recommend-tier
 *
 * Pricing page plan recommender — analyzes answers about interest in
 * Vedic wisdom and recommends the best membership tier.
 *
 * Tiers: prithvi (Prithvi), jal (Jal), agni (Agni), akash (Akash).
 *
 * Falls back to rule-based scoring when LLM is not configured or fails.
 *
 * Rate limited: 5 req/min per IP.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { limited } = await aiRateLimit(ip);
    if (limited) {
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

    // ── LLM Path (when configured) ──
    if (isLLMConfigured()) {
      const systemPrompt = `${YANTRA_PERSONA}

Based on these answers about their interest in Vedic wisdom, recommend which membership tier suits them best. Explain why. List specific content they'd unlock.

Membership tiers:
- prithvi (Prithvi): Foundation tier. Basic access to introductory practices, foundational archetypes, and entry-level patterns. Best for curious beginners.
- jal (Jal): Intermediate tier. Access to structured sādhana protocols, detailed archetype analyses, mantra libraries, and breathwork sequences. Best for committed practitioners establishing a daily practice.
- agni (Agni): Advanced tier. Full access to advanced practices, detailed transit interpretations, pattern deep-dives, yantra construction guides, and community consultations. Best for experienced practitioners seeking depth.
- akash (Akash): Master tier. Complete unrestricted access to all content including sealed practices, research codices, advanced Mahavidya workings, and priority consultations. Best for serious practitioners and scholars.

Return JSON: { "recommendedTier": "<prithvi|jal|agni|akash>", "tierElement": "<element name: Earth|Water|Fire|Space>", "reason": "<2-3 sentence explanation of why this tier fits>", "unlockedFeatures": ["<feature1>", "<feature2>", ...] }`;

      const userPrompt = `Answers to "What draws you to Vedic wisdom?" quiz (${answers.length} questions):

${answers.map((a, i) => `${i + 1}. ${a}`).join('\n')}

Recommend the most suitable membership tier based on their interests, depth of engagement, and what they'd benefit from most. Respond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON object.`;

      try {
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
          console.warn('[/api/ai/recommend-tier] JSON parse failed, using fallback');
          return NextResponse.json(fallbackRecommendation(answers));
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
      } catch (llmError) {
        // LLM failed — fall back to rule-based recommendation
        console.warn('[/api/ai/recommend-tier] LLM failed, using fallback:', llmError);
        return NextResponse.json(fallbackRecommendation(answers));
      }
    }

    // ── Fallback Path (when LLM not configured) ──
    return NextResponse.json(fallbackRecommendation(answers));

  } catch (error) {
    console.error('[/api/ai/recommend-tier]', error);
    return NextResponse.json(
      { error: 'Tier recommendation failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}

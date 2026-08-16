export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { callLLM, isLLMConfigured, YANTRA_PERSONA } from '@/lib/ai/llm';
import { getClientIp, requireAuth } from '@/lib/api-auth';
import { aiDraftSchema } from '@/lib/validators/schemas';
import { aiRateLimit } from '@/lib/rate-limit';


const VALID_CAUTIONS = ['OPEN', 'MODERATE', 'HIGH', 'SEALED'] as const;
const VALID_TIERS = ['prithvi', 'jal', 'agni', 'akash'] as const;

/**
 * POST /api/ai/draft
 *
 * Admin AI content draft generator — produces a full content entry
 * draft for practices, archetypes, patterns, research, or codex.
 *
 * Requires authentication.
 * Rate limited: 5 req/min per IP.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Auth check ──
    const { error: authError } = await requireAuth(request);
    if (authError) return authError;

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
    const parsed = aiDraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { type, title, context } = parsed.data;

    const systemPrompt = `${YANTRA_PERSONA}

Generate a comprehensive content entry draft for type '${type}' with title '${title}'. Include the main body text (Markdown), and suggest caution level (OPEN/MODERATE/HIGH/SEALED), minimum tier (prithvi/jal/agni/akash), and related siddhi slugs. Return JSON.`;

    const contextBlock = context
      ? `\n\nAdditional context from the admin:\n${context}`
      : '';

    const userPrompt = `Content type: ${type}
Title: "${title}"${contextBlock}

Return JSON with this exact schema:
{
  "draft": "string — the full Markdown body of the content entry (comprehensive, well-structured with headings, paragraphs, and lists as appropriate for the type)",
  "suggestedCaution": "OPEN" | "MODERATE" | "HIGH" | "SEALED",
  "suggestedTier": "prithvi" | "jal" | "agni" | "akash",
  "relatedSiddhis": ["string — slug of related siddhis, up to 5"]
}

Respond ONLY with valid JSON matching the schema above. Do not include any text outside the JSON object.`;

    const result = await callLLM(
      [{ role: 'user', content: userPrompt }],
      {
        systemPrompt,
        jsonMode: true,
        temperature: 0.5,
        maxTokens: 2048,
      }
    );

    let parsedResponse: {
      draft: string;
      suggestedCaution: string;
      suggestedTier: string;
      relatedSiddhis: string[];
    };
    try {
      parsedResponse = JSON.parse(result.text);
    } catch {
      return NextResponse.json(
        { error: 'AI response could not be parsed. The geometry returned garbled data.' },
        { status: 502 }
      );
    }

    // Sanitize suggested caution
    const suggestedCaution = VALID_CAUTIONS.includes(parsedResponse.suggestedCaution as typeof VALID_CAUTIONS[number])
      ? parsedResponse.suggestedCaution
      : 'MODERATE';

    // Sanitize suggested tier
    const suggestedTier = VALID_TIERS.includes(parsedResponse.suggestedTier as typeof VALID_TIERS[number])
      ? parsedResponse.suggestedTier
      : 'prithvi';

    return NextResponse.json({
      draft: parsedResponse.draft || '',
      suggestedCaution,
      suggestedTier,
      relatedSiddhis: Array.isArray(parsedResponse.relatedSiddhis)
        ? parsedResponse.relatedSiddhis.slice(0, 5)
        : [],
    });
  } catch (error) {
    console.error('[/api/ai/draft]', error);
    return NextResponse.json(
      { error: 'Draft generation failed. The pattern-matrix requires recalibration.' },
      { status: 500 }
    );
  }
}

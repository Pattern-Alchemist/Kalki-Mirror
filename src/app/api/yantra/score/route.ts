export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { computePrescriptions } from '@/lib/yantra/scoring';
import { getClientIp } from '@/lib/api-auth';
import { yantraRateLimit } from '@/lib/rate-limit';
import type { Tier } from '@/lib/data/types';

/**
 * POST /api/yantra/score — the DETERMINISTIC half of the YANTRA engine.
 *
 * Unlike /api/yantra (RAG prompt-grounding for the future LLM narrative
 * layer), this endpoint is pure computation: same input → same output,
 * every score decomposed into named components. Public and rate-limited.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { limited } = await yantraRateLimit(ip);
    if (limited) {
      return NextResponse.json(
        { error: 'Too many requests. The geometry needs time to stabilize.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const patternIds = Array.isArray(body?.patternIds) ? body.patternIds : [];
    if (
      patternIds.length === 0 ||
      patternIds.length > 5 ||
      patternIds.some((p: unknown) => typeof p !== 'string')
    ) {
      return NextResponse.json(
        { error: 'Provide 1–5 pattern slugs in patternIds.' },
        { status: 400 }
      );
    }

    const tier: Tier = ['prithvi', 'jal', 'agni', 'akash'].includes(body?.tier)
      ? body.tier
      : 'prithvi';
    const cautionTolerance = ['low', 'medium', 'high'].includes(body?.cautionTolerance)
      ? body.cautionTolerance
      : 'low';

    const output = computePrescriptions({ patternIds, tier, cautionTolerance });
    return NextResponse.json(output);
  } catch {
    return NextResponse.json(
      { error: 'YANTRA processing error. The geometry requires recalibration.' },
      { status: 500 }
    );
  }
}

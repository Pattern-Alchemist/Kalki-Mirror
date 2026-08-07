import { NextRequest, NextResponse } from 'next/server';
import { getTransitGeometry, formatTransitForPrompt } from '@/lib/ephemeris/transits';
import { getClientIp } from '@/lib/api-auth';
import { transitsSchema } from '@/lib/validators/schemas';

// ── In-memory rate limiter: 20 req/min per IP ──
const rateLimitMap = new Map<string, number[]>();
const RATE_WINDOW = 60_000;
const RATE_MAX = 20;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entries = rateLimitMap.get(ip) || [];
  const recent = entries.filter(t => now - t < RATE_WINDOW);
  rateLimitMap.set(ip, recent);
  if (recent.length >= RATE_MAX) return true;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

/**
 * GET /api/transits?natalMoon=XXX
 * 
 * Returns current planetary positions and karmic friction points.
 * If natalMoon (degrees 0-360) is provided, calculates
 * Saturn/Mars aspects against the natal Moon.
 * Rate limited: 20 req/min per IP.
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limit
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. The geometry needs time to stabilize.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = transitsSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { natalMoon } = parsed.data;

    const geometry = getTransitGeometry(natalMoon);
    const promptContext = formatTransitForPrompt(geometry);

    return NextResponse.json({
      timestamp: geometry.timestamp,
      positions: geometry.positions,
      frictions: geometry.frictions,
      yantra_context: promptContext,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ephemeris calculation failed. The geometry could not be resolved.' },
      { status: 500 }
    );
  }
}

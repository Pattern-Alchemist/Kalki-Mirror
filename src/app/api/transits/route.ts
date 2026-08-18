import { NextRequest, NextResponse } from 'next/server';
import { getTransitGeometry, formatTransitForPrompt } from '@/lib/ephemeris/transits';
import { getClientIp } from '@/lib/api-auth';
import { transitsSchema } from '@/lib/validators/schemas';
import { transitRateLimit } from '@/lib/rate-limit';


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
    const { limited } = await transitRateLimit(ip);
    if (limited) {
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
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ephemeris calculation failed. The geometry could not be resolved.' },
      { status: 500 }
    );
  }
}

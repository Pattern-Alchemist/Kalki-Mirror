import { NextRequest, NextResponse } from 'next/server';
import { getTransitGeometry, formatTransitForPrompt } from '@/lib/ephemeris/transits';

/**
 * GET /api/transits?natalMoon=XXX
 * 
 * Returns current planetary positions and karmic friction points.
 * If natalMoon (degrees 0-360) is provided, calculates
 * Saturn/Mars aspects against the natal Moon.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const natalMoonStr = searchParams.get('natalMoon');
    
    const natalMoon = natalMoonStr ? parseFloat(natalMoonStr) : undefined;
    
    if (natalMoon !== undefined && (isNaN(natalMoon) || natalMoon < 0 || natalMoon > 360)) {
      return NextResponse.json(
        { error: 'Natal Moon longitude must be 0-360 degrees.' },
        { status: 400 }
      );
    }

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

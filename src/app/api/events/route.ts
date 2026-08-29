export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { recordEvent } from '@/lib/analytics-db';

/**
 * POST /api/events — first-party analytics ingestion (TGA §12).
 * Fire-and-forget from the client; always returns 204 regardless of
 * storage outcome so telemetry can never surface an error to a seeker.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (typeof body?.event === 'string') {
      await recordEvent({
        event: body.event,
        path: typeof body.path === 'string' ? body.path.slice(0, 300) : undefined,
        slug: typeof body.slug === 'string' ? body.slug.slice(0, 200) : undefined,
        properties:
          body.properties && typeof body.properties === 'object'
            ? (body.properties as Record<string, unknown>)
            : undefined,
        referrer: request.headers.get('referer')?.slice(0, 300) ?? undefined,
        sessionId: typeof body.sessionId === 'string' ? body.sessionId.slice(0, 64) : undefined,
      });
    }
  } catch {
    // fail-open
  }
  return new NextResponse(null, { status: 204 });
}

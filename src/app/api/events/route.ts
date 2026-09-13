export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { recordEvent } from '@/lib/analytics-db';
import { EVENT_NAMES } from '@/lib/analytics-shared';
import { getClientIp } from '@/lib/api-auth';
import { eventsRateLimit, tooManyRequestsResponse } from '@/lib/rate-limit';

/**
 * POST /api/events — first-party analytics ingestion (TGA §12).
 * Fire-and-forget from the client; returns 204 on accepted events
 * regardless of storage outcome so telemetry can never surface an error
 * to a seeker.
 *
 * Vol. 3 #18: unknown event names are rejected with 422. Only the 22
 * names in EVENT_NAMES are rendered by the dashboards — anything else is
 * a client bug or store pollution, and both land verbatim in war-room if
 * accepted. A 422 is loud for developers while staying invisible to
 * seekers (the tracker treats any non-2xx as fire-and-forget).
 *
 * Vol. 6 #10 — abuse gate at the head: 60 events / 5 min / IP.
 * fail-OPEN: a beacon loss is tolerable (dashboards dampen noise), so
 * a limiter-down degrades to unlimited-ingestion. Sustained > 50
 * blocks/hr surfaces in the existing /health 429 snapshot.
 */
export async function POST(request: NextRequest) {
  try {
    // Vol. 6 #10 — rate limit BEFORE schema/enum checks: limiter first,
    // schema second. fail-open: limiter-down = proceed (beacon loss
    // tolerable, but the rateLimit snapshot records it).
    try {
      const ip = getClientIp(request);
      const rl = await eventsRateLimit(ip);
      if (rl.limited) {
        return tooManyRequestsResponse(rl.reset);
      }
    } catch {
      // fail-open — beacons never retry, telemetry must not 503
    }

    const body = await request.json();
    if (typeof body?.event === 'string') {
      if (!(EVENT_NAMES as readonly string[]).includes(body.event)) {
        return NextResponse.json(
          { error: 'Unknown event name', known: EVENT_NAMES.length },
          { status: 422 }
        );
      }
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

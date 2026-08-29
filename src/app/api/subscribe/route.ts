export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, recordEvent } from '@/lib/analytics-db';
import { getClientIp } from '@/lib/api-auth';
import { subscribeRateLimit } from '@/lib/rate-limit';

/**
 * POST /api/subscribe — email capture (owned channel, zero external APIs).
 * Stores the address in the first-party Subscriber table; the welcome drip
 * itself is sent manually by the founder until an email provider is chosen.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { limited } = await subscribeRateLimit(ip);
    if (limited) {
      return NextResponse.json(
        { error: 'Too many attempts. The gate rests a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email : '';
    const source = typeof body?.source === 'string' ? body.source.slice(0, 100) : undefined;

    const result = await addSubscriber(email, source);
    if (!result.ok) {
      if (result.status === 'invalid') {
        return NextResponse.json(
          { error: 'That address does not look complete.' },
          { status: 400 }
        );
      }
      // unavailable — accept optimistically so the UX never blocks on storage
      return NextResponse.json({ success: true, status: 'pending' });
    }

    if (result.status === 'created') {
      // best-effort event; ignore failures
      void recordEvent({ event: 'email_subscribed', path: source });
    }

    return NextResponse.json({ success: true, status: result.status });
  } catch {
    return NextResponse.json({ error: 'The mirror is fogged. Try again.' }, { status: 500 });
  }
}

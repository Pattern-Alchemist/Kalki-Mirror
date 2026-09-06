export const runtime = 'nodejs';

import { NextRequest, NextResponse, after } from 'next/server';
import { addSubscriber, recordEvent } from '@/lib/analytics-db';
import { getClientIp } from '@/lib/api-auth';
import { subscribeRateLimit } from '@/lib/rate-limit';
import { db } from '@/lib/db';
import { sendWelcome } from '@/lib/emails/course-send';

/**
 * POST /api/subscribe — email capture (owned channel, zero external APIs).
 *
 * Vol. 3 #7 — ONE LIST, ONE BRAIN. The raw first-party Subscriber row
 * (analytics ledger) is still written first and still owns the response
 * semantics, but every capture now ALSO upserts the Prisma EmailSubscriber
 * table — the same list the 10 Doors course reads, sends to, and reports
 * engagement on. Two stores used to mean two audiences; now /api/subscribe
 * feeds the same brain the course does:
 *   · new to EmailSubscriber  → created active, welcome email via after()
 *   · returning / unsubscribed → re-activated (attribution never rewritten —
 *     same "written once" rule the course subscribe route applies)
 *   · Prisma outage           → fail-soft: the raw ledger's verdict still
 *     returns success, so the UX and the analytics row never block on the
 *     second store
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

    const clean = email.trim().toLowerCase();
    const result = await addSubscriber(clean, source);
    if (!result.ok && result.status === 'invalid') {
      return NextResponse.json(
        { error: 'That address does not look complete.' },
        { status: 400 }
      );
    }

    // ── Vol. 3 #7: mirror into the Prisma list (fail-soft) ──
    let listCreated = false;
    let listOk = false;
    if (result.ok || result.status === 'unavailable') {
      try {
        const existing = await db.emailSubscriber.findUnique({
          where: { email: clean },
          select: { id: true },
        });
        if (existing) {
          // Returning email: re-activate if needed. Attribution written once.
          await db.emailSubscriber.update({
            where: { email: clean },
            data: { status: 'active' },
          });
          listOk = true;
        } else {
          await db.emailSubscriber.create({
            data: { email: clean, status: 'active' },
          });
          listOk = true;
          listCreated = true;
        }
      } catch (err) {
        // Second store is best-effort — the raw ledger already owns the lead.
        console.error('[subscribe] EmailSubscriber upsert failed (fail-soft)', err);
      }
    }

    if (listCreated) {
      // Welcome email: once, for first-time list members, post-response —
      // identical semantics to the course subscribe route.
      after(async () => {
        try {
          await sendWelcome(clean);
        } catch (e) {
          console.error('[subscribe] welcome send failed (post-response)', e);
        }
      });
    }

    if (result.status === 'created') {
      // best-effort event; ignore failures
      void recordEvent({ event: 'email_subscribed', path: source });
    }

    // Response semantics unchanged from the raw-ledger era: success even
    // when storage was unavailable (optimistic), real status when known.
    if (!result.ok && !listOk) {
      // both stores unavailable — accept optimistically so the UX never blocks
      return NextResponse.json({ success: true, status: 'pending' });
    }
    const status = result.ok ? result.status : listCreated ? 'created' : 'exists';
    return NextResponse.json({ success: true, status });
  } catch {
    return NextResponse.json({ error: 'The mirror is fogged. Try again.' }, { status: 500 });
  }
}

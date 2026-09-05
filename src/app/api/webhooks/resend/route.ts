// =============================================================
// KALKI — Resend webhook receiver (Tier 2 #10: email analytics)
// -------------------------------------------------------------
// POST /api/webhooks/resend
//
// Receives Svix-signed delivery events from Resend:
//   email.sent · email.delivered · email.opened ·
//   email.clicked · email.bounced · email.complained
//
// Security:
//   · Every request is verified against RESEND_WEBHOOK_SECRET
//     via the Svix HMAC scheme (src/lib/webhooks/svix.ts).
//   · Unsigned / replayed / malformed requests → 401/400.
//
// Storage:
//   · Each accepted event lands in EmailEvent keyed by the
//     Resend email id (correlates to EmailSend.emailId).
//   · bounced  → subscriber marked "bounced"
//   · complained → subscriber marked "unsubscribed" (RFC-safe)
//
// Posture (mirrors src/lib/resend.ts): storage failures never
// 500 a signed webhook — Resend would retry, we log and ack.
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySvixSignature } from '@/lib/webhooks/svix';

export const dynamic = 'force-dynamic';

/** Event types we persist. Unknown signed types are acked but ignored. */
const KNOWN_TYPES = new Set([
  'email.sent',
  'email.delivered',
  'email.opened',
  'email.clicked',
  'email.bounced',
  'email.complained',
]);

interface ResendWebhookData {
  email_id?: string;
  from?: string;
  to?: string | string[];
  subject?: string;
  click?: { url?: string };
}

export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[resend-webhook] RESEND_WEBHOOK_SECRET not set — rejecting');
    return NextResponse.json({ error: 'webhook not configured' }, { status: 503 });
  }

  const rawBody = await request.text();
  const ok = verifySvixSignature(
    {
      id: request.headers.get('svix-id'),
      timestamp: request.headers.get('svix-timestamp'),
      signature: request.headers.get('svix-signature'),
    },
    rawBody,
    secret,
  );
  if (!ok) {
    console.warn('[resend-webhook] signature verification failed');
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 });
  }

  let payload: { type?: string; created_at?: string; data?: ResendWebhookData };
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'malformed payload' }, { status: 400 });
  }

  const type = String(payload.type ?? '');
  if (!KNOWN_TYPES.has(type)) {
    // Signed but not in our vocabulary — ack so Resend stops retrying.
    return NextResponse.json({ received: true, ignored: type || 'unknown' });
  }

  const data = payload.data ?? {};
  const emailId = String(data.email_id ?? '');
  const toEmail = Array.isArray(data.to) ? String(data.to[0] ?? '') : String(data.to ?? '');
  if (!emailId || !toEmail) {
    return NextResponse.json({ received: true, ignored: 'missing correlation fields' });
  }

  try {
    await db.emailEvent.create({
      data: {
        emailId,
        email: toEmail.toLowerCase(),
        type,
        url: type === 'email.clicked' ? data.click?.url ?? null : null,
        payload: rawBody.slice(0, 8000),
        ...(payload.created_at && !Number.isNaN(Date.parse(payload.created_at))
          ? { occurredAt: new Date(payload.created_at) }
          : {}),
      },
    });

    // Lifecycle reactions — best effort, never fail the webhook.
    if (type === 'email.bounced') {
      await db.emailSubscriber
        .updateMany({ where: { email: toEmail.toLowerCase() }, data: { status: 'bounced' } })
        .catch(() => {});
    } else if (type === 'email.complained') {
      await db.emailSubscriber
        .updateMany({ where: { email: toEmail.toLowerCase() }, data: { status: 'unsubscribed' } })
        .catch(() => {});
    }
  } catch (err) {
    console.error('[resend-webhook] event write failed (acked anyway)', err);
  }

  return NextResponse.json({ received: true });
}

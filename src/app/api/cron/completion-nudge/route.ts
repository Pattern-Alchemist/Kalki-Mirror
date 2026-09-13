// =============================================================
// KALKI — /api/cron/completion-nudge (Vol. 6 #14)
// -------------------------------------------------------------
// GET — the stale-consultation nudge cron.
//
// AUTH: Authorization: Bearer <CRON_SECRET> (or ?key=<CRON_SECRET>)
//
// BEHAVIOR:
//   · ?dryRun=1 — lists stale candidates without sending
//   · default — sends one nudge per stale consultation (oldest first,
//     capped at 20/run), idempotent via the CompletionNudge ledger
//
// Schedule: daily 21:00 IST (vercel.json — after course-send at 20:00 IST,
// before the daily-digest at 08:00 IST next morning so the digest can
// report the nudge count).
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import {
  withCronLedger,
} from '@/lib/cron-ledger';
import {
  findStaleConsultations,
  sendCompletionNudge,
  countStaleConsultations,
} from '@/lib/ops/completion-nudge';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get('authorization') ?? '';
  if (header === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get('key') === secret;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === '1';

  const candidates = await findStaleConsultations(20);

  if (dryRun) {
    const staleCount = await countStaleConsultations();
    return NextResponse.json({
      ok: true,
      dryRun: true,
      staleCount,
      candidates: candidates.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        createdAt: c.createdAt.toISOString(),
        ageHours: Math.round((Date.now() - c.createdAt.getTime()) / 3_600_000),
        status: c.status,
        outcome: c.outcome,
      })),
    });
  }

  const { result } = await withCronLedger('completion-nudge', async () => {
    const results: Array<{ id: string; ok: boolean; skipped?: string }> = [];
    let sent = 0;
    let failed = 0;

    for (const c of candidates) {
      const r = await sendCompletionNudge(c.id, { channel: 'cron' });
      results.push({ id: c.id, ok: r.ok, skipped: r.skipped });
      if (r.ok) sent += 1;
      else if (r.skipped === 'send_failed') failed += 1;
    }

    return {
      response: NextResponse.json({
        ok: true,
        dueCount: candidates.length,
        sent,
        failed,
        results: results.slice(0, 10), // cap the response body
        sentAt: new Date().toISOString(),
      }),
      items: sent,
    };
  });

  return result.response;
}

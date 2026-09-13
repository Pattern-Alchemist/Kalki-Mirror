// =============================================================
// KALKI — /api/cron/weekly-digest (Vol. 6 #13)
// -------------------------------------------------------------
// GET — the seeker weekly digest cron.
//
// AUTH: Authorization: Bearer <CRON_SECRET> (or ?key=<CRON_SECRET>)
//
// BEHAVIOR:
//   · ?dryRun=1 — reports recipient count + content preview, sends nothing
//   · default — gathers the week's new letters + spotlight, sends one
//     email per active subscriber (capped at 200/run), stamps the
//     OpsState marker (idempotent: re-running on the same Monday skips)
//
// Schedule: Monday 12:00 UTC (Monday 17:30 IST) — after the Sunday
// observatory + before the Tuesday chain-health. vercel.json.
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { withCronLedger } from '@/lib/cron-ledger';
import { runWeeklyDigest } from '@/lib/ops/weekly-digest';

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

  const { result } = await withCronLedger('weekly-digest', async () => {
    const r = await runWeeklyDigest({ dryRun });
    return {
      response: NextResponse.json({ ...r, dryRun, sentAt: new Date().toISOString() }),
      items: r.sent,
    };
  });

  return result.response;
}

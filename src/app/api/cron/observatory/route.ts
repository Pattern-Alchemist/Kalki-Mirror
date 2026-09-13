// =============================================================
// KALKI — /api/cron/observatory (Vol. 6 #9)
// -------------------------------------------------------------
// GET — the founder-gated GSC observatory cron.
//
// AUTH: Authorization: Bearer <CRON_SECRET> (or ?key=<CRON_SECRET>)
//
// BEHAVIOR:
//   · unconfigured (GSC_REFRESH_TOKEN + client_id + client_secret unset)
//     → honest skip, OpsState marker set to {configured:false, checkedAt:now}
//       so the digest surfaces "awaiting founder consent" (mirrors
//       restore-drill). The cron ran — silence detection stays armed.
//   · configured → pullGsc({days:28}) → upsert GscSnapshot on week-key
//     → compute WoW delta against last snapshot → set alarm flag if
//       impressions dropped > 40% → store StoredObservatory in OpsState
//       → return snapshot + delta + alarm
//
// Schedule: Sunday 06:00 UTC (the .github/workflows/observatory.yml).
// Why GitHub Actions not Vercel cron: hobby cron limit + the dossier
// says "any new schedules go to GitHub Actions".
// =============================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  OBSERVATORY_OPS_KEY,
  isObservatoryConfigured,
  pullGsc,
  wowDelta,
  shouldAlarm,
  persistSnapshot,
  readRecentSnapshots,
  type StoredObservatory,
} from '@/lib/observatory/gsc';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (req.headers.get('authorization') === `Bearer ${secret}`) return true;
  return req.nextUrl.searchParams.get('key') === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const configured = isObservatoryConfigured();
  const checkedAt = new Date().toISOString();

  if (!configured) {
    // Honest skip — mirrors the restore-drill pattern. The cron ran.
    const stored: StoredObservatory = {
      snapshot: null,
      prevSnapshot: null,
      wowDelta: null,
      alarm: false,
      configured: false,
      checkedAt,
    };
    try {
      await db.opsState.upsert({
        where: { key: OBSERVATORY_OPS_KEY },
        create: { key: OBSERVATORY_OPS_KEY, value: JSON.stringify(stored) },
        update: { value: JSON.stringify(stored) },
      });
    } catch {
      // OpsState write is a convenience, never a dependency
    }
    return NextResponse.json({
      status: 'skipped',
      reason: 'awaiting founder consent (GSC_REFRESH_TOKEN + GSC_CLIENT_ID + GSC_CLIENT_SECRET)',
      checkedAt,
    });
  }

  // Configured — pull the snapshot
  const snapshot = await pullGsc({ days: 28 });
  if (!snapshot) {
    const stored: StoredObservatory = {
      snapshot: null,
      prevSnapshot: null,
      wowDelta: null,
      alarm: false,
      configured: true,
      checkedAt,
      error: 'pullGsc returned null — OAuth refresh failed, GSC API error, or empty response',
    };
    try {
      await db.opsState.upsert({
        where: { key: OBSERVATORY_OPS_KEY },
        create: { key: OBSERVATORY_OPS_KEY, value: JSON.stringify(stored) },
        update: { value: JSON.stringify(stored) },
      });
    } catch {
      // ignore
    }
    return NextResponse.json({ status: 'error', error: stored.error, checkedAt }, { status: 502 });
  }

  // Persist to GscSnapshot table (idempotent on week-key)
  await persistSnapshot(snapshot);

  // Read the previous week's snapshot for WoW delta
  const recent = await readRecentSnapshots(8);
  const prev = recent.find((s) => s.date !== snapshot.date) ?? null;
  const delta = wowDelta(prev, snapshot);
  const alarm = shouldAlarm(delta);

  const stored: StoredObservatory = {
    snapshot,
    prevSnapshot: prev,
    wowDelta: delta,
    alarm,
    configured: true,
    checkedAt,
  };
  try {
    await db.opsState.upsert({
      where: { key: OBSERVATORY_OPS_KEY },
      create: { key: OBSERVATORY_OPS_KEY, value: JSON.stringify(stored) },
      update: { value: JSON.stringify(stored) },
    });
  } catch {
    // ignore
  }

  return NextResponse.json({
    status: 'ok',
    snapshot,
    wowDelta: delta,
    alarm,
    checkedAt,
  });
}

// =============================================================
// KALKI — Google Search Console observatory (Vol. 6 #9)
// -------------------------------------------------------------
// Mirrors the Sentry pattern: lands asleep, wakes on one env flip.
// When GSC_REFRESH_TOKEN is unset:
//   isObservatoryConfigured() → false
//   pullGsc() → null (honest skip, like restore-drill)
//   the digest surfaces "awaiting founder consent"
//
// When the trio is set (GSC_REFRESH_TOKEN + GSC_CLIENT_ID +
// GSC_CLIENT_SECRET):
//   pullGsc({days:28}) refreshes the OAuth token, calls searchConsole
//   /searchAnalytics/query with dimensions=[query], aggregates
//   impressions/clicks/position (position-weighted by impressions),
//   builds top-10 queries, returns Snapshot.
//
// Storage: weekly Sunday-key upsert into GscSnapshot table (DDL
// applied via scripts/apply-vol6b-schema.ts). The war-room reads
// the last 8 rows for the sparkline; the digest reads the latest
// two rows for the WoW delta.
//
// ALARM: impressions drop > 40% WoW (cannibalization/regression net).
// =============================================================

import { db } from '@/lib/db';

export const OBSERVATORY_OPS_KEY = 'gsc_observatory';
export const OBSERVATORY_MAX_AGE_H = 7 * 24 + 6; // weekly cadence + 6h grace

export const isObservatoryConfigured = (): boolean =>
  Boolean(process.env.GSC_REFRESH_TOKEN) &&
  Boolean(process.env.GSC_CLIENT_ID) &&
  Boolean(process.env.GSC_CLIENT_SECRET);

export interface GscQueryRow {
  keys: string[];
  impressions: number;
  clicks: number;
  position: number;
  ctr: number;
}

export interface TopQuery {
  q: string;
  i: number;
  c: number;
  p: number;
}

export interface Snapshot {
  date: string; // YYYY-MM-DD, the Sunday week-key
  impressions: number;
  clicks: number;
  position: number;
  topQueries: TopQuery[];
}

export interface StoredObservatory {
  snapshot: Snapshot | null;       // null when configured-but-pull-failed
  prevSnapshot?: Snapshot | null; // for WoW delta
  wowDelta: { impressionsPct: number; clicksPct: number } | null;
  alarm: boolean;                  // impressions <= -40% WoW
  configured: boolean;            // mirrors isObservatoryConfigured
  checkedAt: string;             // ISO timestamp
  error?: string;                 // honest reason when configured-but-failed
}

/** The site identifier — defaults to sc-domain:astrokalki.com (founder's property type). */
const GSC_SITE = () => process.env.GSC_SITE ?? 'sc-domain:astrokalki.com';

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SEARCH_CONSOLE_URL = (site: string) =>
  `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

/** Refresh the OAuth access token from the founder's refresh token. */
async function refreshAccessToken(fetchImpl?: FetchLike): Promise<string | null> {
  const doFetch = fetchImpl ?? fetch;
  try {
    const res = await doFetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: process.env.GSC_REFRESH_TOKEN!,
        client_id: process.env.GSC_CLIENT_ID!,
        client_secret: process.env.GSC_CLIENT_SECRET!,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

/** Sunday week-key (UTC) — the snapshotDate primary key. */
export function weekKey(d: Date = new Date()): string {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() - out.getUTCDay()); // back to Sunday
  out.setUTCHours(0, 0, 0, 0);
  return out.toISOString().slice(0, 10);
}

/**
 * Pull a 28-day GSC snapshot. Returns null when:
 *   - observatory not configured (the resting state)
 *   - OAuth refresh fails
 *   - searchConsole call fails
 *   - response shape unexpected
 * Never throws — the route wraps this and the digest reads OpsState.
 */
export async function pullGsc(opts: { days?: number; fetchImpl?: FetchLike } = {}): Promise<Snapshot | null> {
  if (!isObservatoryConfigured()) return null;
  const doFetch = opts.fetchImpl ?? fetch;
  const days = opts.days ?? 28;

  const accessToken = await refreshAccessToken(doFetch);
  if (!accessToken) return null;

  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 864e5);
  const body = {
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    dimensions: ['query'],
    rowLimit: 1000,
  };

  try {
    const res = await doFetch(SEARCH_CONSOLE_URL(GSC_SITE()), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { rows?: GscQueryRow[] };
    const rows = data.rows ?? [];
    if (rows.length === 0) return null;

    const impressions = rows.reduce((s, r) => s + r.impressions, 0);
    const clicks = rows.reduce((s, r) => s + r.clicks, 0);
    // position-weighted by impressions (the standard GSC aggregation)
    const position = impressions
      ? rows.reduce((s, r) => s + r.position * r.impressions, 0) / impressions
      : 0;

    const topQueries: TopQuery[] = [...rows]
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 10)
      .map((r) => ({
        q: r.keys[0] ?? '',
        i: r.impressions,
        c: r.clicks,
        p: r.position,
      }));

    return {
      date: weekKey(),
      impressions,
      clicks,
      position,
      topQueries,
    };
  } catch {
    return null;
  }
}

/** WoW delta — percentage change between two snapshots. Null when prev missing. */
export function wowDelta(prev: Snapshot | null, curr: Snapshot | null): {
  impressionsPct: number;
  clicksPct: number;
} | null {
  if (!prev || !curr) return null;
  const ip = prev.impressions === 0 ? null : ((curr.impressions - prev.impressions) / prev.impressions) * 100;
  const cp = prev.clicks === 0 ? null : ((curr.clicks - prev.clicks) / prev.clicks) * 100;
  if (ip === null || cp === null) return null;
  return {
    impressionsPct: Math.round(ip * 10) / 10,
    clicksPct: Math.round(cp * 10) / 10,
  };
}

/** Alarm when impressions dropped > 40% WoW — the cannibalization/regression net. */
export function shouldAlarm(delta: ReturnType<typeof wowDelta>): boolean {
  if (!delta) return false;
  return delta.impressionsPct <= -40;
}

/* ── OpsState interop (read side lives in consumers) ────────────────── */

export function parseStoredObservatory(raw: string | null | undefined): StoredObservatory | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as Partial<StoredObservatory>;
    if (!obj || typeof obj !== 'object') return null;
    if (typeof obj.configured !== 'boolean') return null;
    if (typeof obj.checkedAt !== 'string') return null;
    return {
      snapshot: obj.snapshot ?? null,
      prevSnapshot: obj.prevSnapshot ?? null,
      wowDelta: obj.wowDelta ?? null,
      alarm: obj.alarm ?? false,
      configured: obj.configured,
      checkedAt: obj.checkedAt,
      error: obj.error,
    };
  } catch {
    return null;
  }
}

export function observatoryAgeHours(s: StoredObservatory | null, now: Date = new Date()): number {
  if (!s || typeof s.checkedAt !== 'string') return Infinity;
  const t = Date.parse(s.checkedAt);
  if (Number.isNaN(t)) return Infinity;
  return Math.max(0, (now.getTime() - t) / 3_600_000);
}

/**
 * The one-line digest verdict. Empty string = healthy (silent on green).
 * - When unconfigured: surfaces the consent line (NOT an alarm — the
 *   doctrine's resting state, mirrors Sentry's DSN-unset posture).
 * - When stale > 7d6h: ALARM (observatory cron dead).
 * - When impressions dropped > 40% WoW: ALARM (cannibalization/regression).
 * - When configured-but-pull-failed (error path): visible error line.
 * - Otherwise: one WoW delta summary line.
 */
export function observatoryDigestLine(s: StoredObservatory | null, now: Date = new Date()): string {
  if (!s) return 'OBSERVATORY: never run — trigger /api/cron/observatory';
  if (!s.configured) {
    return 'OBSERVATORY: awaiting founder consent (GSC_REFRESH_TOKEN + GSC_CLIENT_ID + GSC_CLIENT_SECRET)';
  }
  const age = observatoryAgeHours(s, now);
  if (age > OBSERVATORY_MAX_AGE_H) {
    return `OBSERVATORY: last run ${Math.round(age)}h ago (> ${OBSERVATORY_MAX_AGE_H}h) — observatory cron may be dead`;
  }
  if (s.error) {
    return `OBSERVATORY: pull failed — ${s.error.slice(0, 80)}`;
  }
  if (s.alarm) {
    const delta = s.wowDelta;
    return `OBSERVATORY ALERT: impressions ${delta?.impressionsPct ?? '?'}% WoW (cannibalization/regression net fired)`;
  }
  if (!s.snapshot) {
    return 'OBSERVATORY: no snapshot (GSC returned zero rows — new property or empty window)';
  }
  const { impressions, clicks, topQueries } = s.snapshot;
  const top = topQueries[0];
  const deltaStr = s.wowDelta
    ? ` · ${s.wowDelta.impressionsPct >= 0 ? '+' : ''}${s.wowDelta.impressionsPct}% imp WoW`
    : '';
  return `OBSERVATORY: ${impressions} imp · ${clicks} clicks${deltaStr}${top ? ` · top: "${top.q}" ${top.i}` : ''}`;
}

/** Materialize a snapshot to the GscSnapshot table (idempotent upsert by week-key). */
export async function persistSnapshot(snap: Snapshot): Promise<void> {
  try {
    await db.gscSnapshot.upsert({
      where: { snapshotDate: snap.date },
      create: {
        snapshotDate: snap.date,
        impressions: snap.impressions,
        clicks: snap.clicks,
        position: snap.position,
        topQueries: JSON.stringify(snap.topQueries),
      },
      update: {
        impressions: snap.impressions,
        clicks: snap.clicks,
        position: snap.position,
        topQueries: JSON.stringify(snap.topQueries),
      },
    });
  } catch {
    // persistence is best-effort — the OpsState marker is the source of truth
  }
}

/** Read the last N snapshots for the war-room sparkline. */
export async function readRecentSnapshots(n: number = 8): Promise<Snapshot[]> {
  try {
    const rows = await db.gscSnapshot.findMany({
      orderBy: { snapshotDate: 'desc' },
      take: n,
    });
    return rows.map((r) => ({
      date: r.snapshotDate,
      impressions: r.impressions,
      clicks: r.clicks,
      position: r.position,
      topQueries: JSON.parse(r.topQueries) as TopQuery[],
    }));
  } catch {
    return [];
  }
}

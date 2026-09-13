import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  isObservatoryConfigured,
  weekKey,
  wowDelta,
  shouldAlarm,
  parseStoredObservatory,
  observatoryAgeHours,
  observatoryDigestLine,
  pullGsc,
  OBSERVATORY_MAX_AGE_H,
  type Snapshot,
  type StoredObservatory,
  type FetchLike,
} from '@/lib/observatory/gsc';

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #9 — GSC observatory.
   Mirrors the Sentry pattern: lands asleep, wakes on env flip.
   The WoW math is pure; the network path is mocked-fetch.
   ══════════════════════════════════════════════════════════════ */

const NOW = new Date('2026-09-13T12:00:00Z');

describe('isObservatoryConfigured — the env-gated resting state', () => {
  const orig = { ...process.env };
  beforeEach(() => {
    delete process.env.GSC_REFRESH_TOKEN;
    delete process.env.GSC_CLIENT_ID;
    delete process.env.GSC_CLIENT_SECRET;
  });
  afterEach(() => { process.env = { ...orig }; });

  it('returns false when all three GSC env vars are unset', () => {
    expect(isObservatoryConfigured()).toBe(false);
  });

  it('returns false when only one or two are set', () => {
    process.env.GSC_REFRESH_TOKEN = 'r';
    expect(isObservatoryConfigured()).toBe(false);
    process.env.GSC_CLIENT_ID = 'cid';
    expect(isObservatoryConfigured()).toBe(false);
  });

  it('returns true only when all three are set', () => {
    process.env.GSC_REFRESH_TOKEN = 'r';
    process.env.GSC_CLIENT_ID = 'cid';
    process.env.GSC_CLIENT_SECRET = 'cs';
    expect(isObservatoryConfigured()).toBe(true);
  });
});

describe('weekKey — the Sunday week-key', () => {
  it('returns Sunday 00:00 UTC for any day in the same week', () => {
    // 2026-09-13 is a Sunday
    expect(weekKey(new Date('2026-09-13T15:00:00Z'))).toBe('2026-09-13');
    // 2026-09-12 is a Saturday — week-key should be 2026-09-06
    expect(weekKey(new Date('2026-09-12T15:00:00Z'))).toBe('2026-09-06');
    // 2026-09-14 is a Monday — week-key should be 2026-09-13
    expect(weekKey(new Date('2026-09-14T03:00:00Z'))).toBe('2026-09-13');
  });

  it('is idempotent (weekKey(weekKey-derived-date) === weekKey)', () => {
    const k1 = weekKey(new Date('2026-09-13'));
    const k2 = weekKey(new Date(k1 + 'T00:00:00Z'));
    expect(k1).toBe(k2);
  });
});

describe('wowDelta — percentage change between snapshots', () => {
  it('returns null when prev is missing', () => {
    const curr: Snapshot = { date: '2026-09-13', impressions: 1000, clicks: 50, position: 12, topQueries: [] };
    expect(wowDelta(null, curr)).toBeNull();
    expect(wowDelta(undefined as never, curr)).toBeNull();
  });

  it('returns null when curr is missing', () => {
    const prev: Snapshot = { date: '2026-09-06', impressions: 1000, clicks: 50, position: 12, topQueries: [] };
    expect(wowDelta(prev, null)).toBeNull();
  });

  it('computes positive delta correctly', () => {
    const prev: Snapshot = { date: '2026-09-06', impressions: 1000, clicks: 50, position: 12, topQueries: [] };
    const curr: Snapshot = { date: '2026-09-13', impressions: 1200, clicks: 60, position: 11, topQueries: [] };
    const d = wowDelta(prev, curr);
    expect(d).not.toBeNull();
    expect(d!.impressionsPct).toBe(20);
    expect(d!.clicksPct).toBe(20);
  });

  it('computes negative delta correctly (rounded to 1 decimal)', () => {
    const prev: Snapshot = { date: '2026-09-06', impressions: 1000, clicks: 50, position: 12, topQueries: [] };
    const curr: Snapshot = { date: '2026-09-13', impressions: 850, clicks: 40, position: 13, topQueries: [] };
    const d = wowDelta(prev, curr);
    expect(d!.impressionsPct).toBe(-15);
    expect(d!.clicksPct).toBe(-20);
  });

  it('returns null when prev impressions is 0 (avoid divide-by-zero)', () => {
    const prev: Snapshot = { date: '2026-09-06', impressions: 0, clicks: 0, position: 0, topQueries: [] };
    const curr: Snapshot = { date: '2026-09-13', impressions: 100, clicks: 5, position: 10, topQueries: [] };
    expect(wowDelta(prev, curr)).toBeNull();
  });
});

describe('shouldAlarm — the cannibalization/regression net', () => {
  it('returns false when delta is null', () => {
    expect(shouldAlarm(null)).toBe(false);
  });

  it('returns false when impressions dropped less than 40%', () => {
    expect(shouldAlarm({ impressionsPct: -10, clicksPct: -5 })).toBe(false);
    expect(shouldAlarm({ impressionsPct: -39.9, clicksPct: -5 })).toBe(false);
  });

  it('returns true when impressions dropped 40% or more', () => {
    expect(shouldAlarm({ impressionsPct: -40, clicksPct: -30 })).toBe(true);
    expect(shouldAlarm({ impressionsPct: -60, clicksPct: -50 })).toBe(true);
  });

  it('returns false when impressions grew (even if clicks dropped)', () => {
    expect(shouldAlarm({ impressionsPct: 50, clicksPct: -50 })).toBe(false);
  });
});

describe('parseStoredObservatory — defensive shape check', () => {
  it('returns null for missing/corrupt input', () => {
    expect(parseStoredObservatory(null)).toBeNull();
    expect(parseStoredObservatory('')).toBeNull();
    expect(parseStoredObservatory('not-json')).toBeNull();
    expect(parseStoredObservatory(JSON.stringify({ configured: true }))).toBeNull(); // missing checkedAt
  });

  it('round-trips a valid StoredObservatory', () => {
    const s: StoredObservatory = {
      snapshot: { date: '2026-09-13', impressions: 1000, clicks: 50, position: 12, topQueries: [] },
      prevSnapshot: null,
      wowDelta: null,
      alarm: false,
      configured: true,
      checkedAt: NOW.toISOString(),
    };
    const round = parseStoredObservatory(JSON.stringify(s));
    expect(round).not.toBeNull();
    expect(round!.configured).toBe(true);
    expect(round!.snapshot?.impressions).toBe(1000);
  });
});

describe('observatoryAgeHours', () => {
  it('returns Infinity for missing/invalid', () => {
    expect(observatoryAgeHours(null)).toBe(Infinity);
    expect(observatoryAgeHours({ checkedAt: 'bad' } as StoredObservatory)).toBe(Infinity);
  });

  it('computes hours since checkedAt', () => {
    const threeHoursAgo = new Date(NOW.getTime() - 3 * 3_600_000);
    const s: StoredObservatory = {
      snapshot: null, prevSnapshot: null, wowDelta: null, alarm: false,
      configured: true, checkedAt: threeHoursAgo.toISOString(),
    };
    expect(Math.round(observatoryAgeHours(s, NOW))).toBe(3);
  });
});

describe('observatoryDigestLine — the one-line verdict', () => {
  it('never-run triggers the run-hint', () => {
    expect(observatoryDigestLine(null, NOW)).toMatch(/never run/);
  });

  it('unconfigured surfaces the consent line (NOT an alarm)', () => {
    const s: StoredObservatory = {
      snapshot: null, prevSnapshot: null, wowDelta: null, alarm: false,
      configured: false, checkedAt: NOW.toISOString(),
    };
    const line = observatoryDigestLine(s, NOW);
    expect(line).toMatch(/awaiting founder consent/);
    expect(line).not.toMatch(/ALERT/);
  });

  it('alarms when stale > 7d6h', () => {
    const stale = new Date(NOW.getTime() - 8 * 24 * 3_600_000);
    const s: StoredObservatory = {
      snapshot: null, prevSnapshot: null, wowDelta: null, alarm: false,
      configured: true, checkedAt: stale.toISOString(),
    };
    expect(observatoryDigestLine(s, NOW)).toMatch(/last run.*ago.*dead/);
  });

  it('surfaces the error line when configured-but-pull-failed', () => {
    const s: StoredObservatory = {
      snapshot: null, prevSnapshot: null, wowDelta: null, alarm: false,
      configured: true, checkedAt: NOW.toISOString(),
      error: 'pullGsc returned null — OAuth refresh failed',
    };
    expect(observatoryDigestLine(s, NOW)).toMatch(/pull failed/);
  });

  it('alarms when impressions > 40% WoW drop', () => {
    const s: StoredObservatory = {
      snapshot: { date: '2026-09-13', impressions: 500, clicks: 25, position: 15, topQueries: [] },
      prevSnapshot: { date: '2026-09-06', impressions: 1000, clicks: 50, position: 12, topQueries: [] },
      wowDelta: { impressionsPct: -50, clicksPct: -50 },
      alarm: true,
      configured: true,
      checkedAt: NOW.toISOString(),
    };
    const line = observatoryDigestLine(s, NOW);
    expect(line).toMatch(/ALERT/);
    expect(line).toMatch(/impressions -50% WoW/);
  });

  it('healthy snapshot with WoW delta is one summary line (not silent — the founder wants visibility)', () => {
    const s: StoredObservatory = {
      snapshot: {
        date: '2026-09-13', impressions: 1200, clicks: 60, position: 11,
        topQueries: [{ q: 'gayatri mantra', i: 210, c: 15, p: 3.2 }],
      },
      prevSnapshot: { date: '2026-09-06', impressions: 1000, clicks: 50, position: 12, topQueries: [] },
      wowDelta: { impressionsPct: 20, clicksPct: 20 },
      alarm: false,
      configured: true,
      checkedAt: NOW.toISOString(),
    };
    const line = observatoryDigestLine(s, NOW);
    expect(line).toMatch(/1200 imp.*60 clicks/);
    expect(line).toMatch(/\+20% imp WoW/);
    expect(line).toMatch(/top: "gayatri mantra" 210/);
    expect(line).not.toMatch(/ALERT/);
  });

  it('OBSERVATORY_MAX_AGE_H is 174 (7d + 6h grace)', () => {
    expect(OBSERVATORY_MAX_AGE_H).toBe(174);
  });
});

/* ── Mocked-fetch pull test ────────────────────────────────────────── */

function fakeFetch(tokenResponse: unknown, queryResponse: unknown): FetchLike {
  let tokenCallCount = 0;
  return async (url: string) => {
    if (url.includes('oauth2.googleapis.com')) {
      tokenCallCount++;
      return {
        ok: true,
        status: 200,
        json: async () => tokenResponse,
      } as unknown as Response;
    }
    if (url.includes('searchconsole.googleapis.com')) {
      return {
        ok: true,
        status: 200,
        json: async () => queryResponse,
      } as unknown as Response;
    }
    return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
  };
}

describe('pullGsc — network path with mocked fetch', () => {
  const orig = { ...process.env };
  beforeEach(() => {
    process.env.GSC_REFRESH_TOKEN = 'r';
    process.env.GSC_CLIENT_ID = 'cid';
    process.env.GSC_CLIENT_SECRET = 'cs';
    process.env.GSC_SITE = 'sc-domain:astrokalki.com';
  });
  afterEach(() => { process.env = { ...orig }; });

  it('returns null when unconfigured (the resting state)', async () => {
    delete process.env.GSC_REFRESH_TOKEN;
    expect(await pullGsc({ fetchImpl: fakeFetch({ access_token: 'x' }, { rows: [] }) })).toBeNull();
  });

  it('aggregates impressions, clicks, position, top-10 queries', async () => {
    const tokenResponse = { access_token: 'access-123' };
    const queryResponse = {
      rows: [
        { keys: ['gayatri mantra'], impressions: 210, clicks: 15, position: 3.2, ctr: 0.071 },
        { keys: ['soham meditation'], impressions: 180, clicks: 12, position: 4.1, ctr: 0.067 },
        { keys: ['yoga nidra'], impressions: 90, clicks: 3, position: 8.5, ctr: 0.033 },
      ],
    };
    const snap = await pullGsc({ fetchImpl: fakeFetch(tokenResponse, queryResponse) });
    expect(snap).not.toBeNull();
    expect(snap!.impressions).toBe(480);
    expect(snap!.clicks).toBe(30);
    // position-weighted by impressions: (210*3.2 + 180*4.1 + 90*8.5) / 480
    expect(snap!.position).toBeCloseTo((672 + 738 + 765) / 480, 1);
    expect(snap!.topQueries).toHaveLength(3);
    expect(snap!.topQueries[0]).toEqual({ q: 'gayatri mantra', i: 210, c: 15, p: 3.2 });
    expect(snap!.topQueries[1].q).toBe('soham meditation');
  });

  it('returns null when OAuth refresh fails', async () => {
    const fetchImpl: FetchLike = async () => ({ ok: false, status: 400, json: async () => ({}) } as unknown as Response);
    expect(await pullGsc({ fetchImpl })).toBeNull();
  });

  it('returns null when GSC API returns no rows', async () => {
    const snap = await pullGsc({ fetchImpl: fakeFetch({ access_token: 'x' }, { rows: [] }) });
    expect(snap).toBeNull();
  });

  it('returns null on any throw (never throws into the cron route)', async () => {
    const throwingFetch: FetchLike = async () => { throw new Error('network down'); };
    expect(await pullGsc({ fetchImpl: throwingFetch })).toBeNull();
  });
});

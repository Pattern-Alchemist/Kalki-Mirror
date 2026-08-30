/**
 * ANALYTICS + SUBSCRIBERS — first-party event store (zero external APIs)
 *
 * TGA §12 event dictionary, implemented as a Turso table written through the
 * raw libSQL client (not Prisma) so it never depends on client generation
 * order in CI. Tables self-create idempotently on first write — no migration
 * step required on rotation or fresh environments.
 *
 * Fail-open by design: analytics must NEVER break a page or an API response.
 */

import { createClient, type Client } from '@libsql/client';
import {
  EVENT_NAMES,
  EVENT_META,
  GROUP_NAMES,
  normalizeRange,
  referrerDomain,
  csvEscape,
  type EventName,
  type EventPayload,
  type EventGroup,
  type AnalyticsRange,
  type AnalyticsSnapshot,
} from './analytics-shared';

// Re-exported so every existing `@/lib/analytics-db` import (tests, API
// routes, client type imports) keeps working — the pure dictionary data now
// lives in analytics-shared.ts, which is safe for the client bundle.
export * from './analytics-shared';

// Same credential resolution as src/lib/db.ts (rotated together — G-10).
const TURSO_URL_FALLBACK = 'libsql://kalki-mirror-pattern-alchemist.aws-ap-south-1.turso.io';
const TURSO_TOKEN_FALLBACK = process.env.VERCEL === '1'
  ? 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODY5MDk3MDksImlkIjoiMDFhMDBjMWQtMWUwMS03YzFiLTlhYmItODUyZDgwOGRmMWVlIiwia2lkIjoiRHRnLUxVWDlCZ0VHbXVReEk5WVUzWnFqMjRPTUlGQllHZHpqYTBkT0VuUSIsInJpZCI6IjE5MjA2MDJkLTJmNTYtNDA2Yi05MDI2LWUyNTc4ZjUyMDgyMyJ9.0AavPuqz6W7qQtaHgYHscL21-1YgxlRt0DwRLBi-mHjDGemOrNX9gVkP9Ie2Zl7OXLicEDLBV29ZvHdNb9aNAQ'
  : '';

function resolveUrl(): string {
  return process.env.TURSO_DATABASE_URL || (process.env.VERCEL === '1' ? TURSO_URL_FALLBACK : '');
}

let client: Client | null = null;
let tableReady: Promise<void> | null = null;

function getClient(): Client | null {
  const url = resolveUrl();
  if (!url) return null; // local dev without Turso — analytics silently disabled
  if (!client) {
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || TURSO_TOKEN_FALLBACK || undefined,
    });
  }
  return client;
}

/** Idempotent DDL — runs at most once per cold start, lazily on first write. */
async function ensureTables(): Promise<void> {
  if (tableReady) return tableReady;
  const c = getClient();
  if (!c) {
    tableReady = Promise.resolve();
    return tableReady;
  }
  tableReady = (async () => {
    await c.execute(`
      CREATE TABLE IF NOT EXISTS AnalyticsEvent (
        id TEXT PRIMARY KEY,
        event TEXT NOT NULL,
        path TEXT,
        slug TEXT,
        properties TEXT,
        referrer TEXT,
        sessionId TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await c.execute(`
      CREATE TABLE IF NOT EXISTS Subscriber (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        source TEXT,
        createdAt TEXT NOT NULL DEFAULT (datetime('now')),
        confirmed INTEGER NOT NULL DEFAULT 0
      )
    `);
  })().catch(() => {
    // Reset so a transient cold-start failure can retry on next write.
    tableReady = null;
  });
  return tableReady;
}

// ─── Event dictionary (TGA §12 — 15 events) ────────────────────────────────
// Dictionary data (EVENT_NAMES, EVENT_META, types) lives in analytics-shared.ts.

const EVENT_SET = new Set<string>(EVENT_NAMES);

/** Record an event. Never throws — returns false when storage is unavailable. */
export async function recordEvent(payload: EventPayload): Promise<boolean> {
  try {
    if (!EVENT_SET.has(payload.event)) return false;
    await ensureTables();
    const c = getClient();
    if (!c) return false;
    await c.execute({
      sql: 'INSERT INTO AnalyticsEvent (id, event, path, slug, properties, referrer, sessionId) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [
        crypto.randomUUID(),
        payload.event,
        payload.path ?? null,
        payload.slug ?? null,
        payload.properties ? JSON.stringify(payload.properties).slice(0, 2000) : null,
        payload.referrer ?? null,
        payload.sessionId ?? null,
      ],
    });
    return true;
  } catch {
    return false; // fail-open: analytics never breaks the request
  }
}

export interface SubscribeResult {
  ok: boolean;
  status: 'created' | 'exists' | 'invalid' | 'unavailable';
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Add or ignore a subscriber. Never throws. */
export async function addSubscriber(email: string, source?: string): Promise<SubscribeResult> {
  const clean = email.trim().toLowerCase();
  if (!EMAIL_RE.test(clean) || clean.length > 254) {
    return { ok: false, status: 'invalid' };
  }
  try {
    await ensureTables();
    const c = getClient();
    if (!c) return { ok: false, status: 'unavailable' };
    const existing = await c.execute({
      sql: 'SELECT id FROM Subscriber WHERE email = ?',
      args: [clean],
    });
    if (existing.rows.length > 0) {
      return { ok: true, status: 'exists' };
    }
    await c.execute({
      sql: 'INSERT INTO Subscriber (id, email, source) VALUES (?, ?, ?)',
      args: [crypto.randomUUID(), clean, source ?? null],
    });
    return { ok: true, status: 'created' };
  } catch {
    return { ok: false, status: 'unavailable' };
  }
}

// ─── Read path — founder analytics dashboard (admin only) ─────────────────


function emptySnapshot(range: AnalyticsRange): AnalyticsSnapshot {
  return {
    available: false,
    range,
    generatedAt: new Date().toISOString(),
    totals: {
      events: 0, eventsWindow: 0, eventsPrevWindow: 0, events7d: 0, events30d: 0,
      sessionsWindow: 0, sessionsPrevWindow: 0, subscribers: 0, subscribersWindow: 0,
    },
    daily: [],
    events: [],
    topContent: [],
    topReferrers: [],
    funnel: { dossierStarted: 0, dossierCompleted: 0, pricingViewed: 0, consultationStarted: 0 },
    recentEvents: [],
    recentSubscribers: [],
  };
}

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Content events that carry a meaningful slug for the Top Content rollup. */
const CONTENT_EVENTS: readonly EventName[] = [
  'folio_viewed', 'pattern_viewed', 'glossary_term_viewed',
  'archetype_viewed', 'aghori_lesson_viewed', 'aghori_phase_viewed',
  'breathwork_viewed', 'sequence_viewed', 'karma_page_viewed',
];

/**
 * Builds the per-group SUM(CASE…) columns for the daily query, derived from
 * EVENT_META so the dictionary can never drift from the chart. Event names
 * come from the closed EVENT_NAMES set — safe to interpolate.
 */
export function groupColumnSql(): string {
  return GROUP_NAMES.map((g) => {
    const names = EVENT_NAMES.filter((n) => EVENT_META[n].group === g);
    const list = names.map((n) => `'${n}'`).join(', ');
    return `SUM(CASE WHEN event IN (${list}) THEN 1 ELSE 0 END) AS "${g}"`;
  }).join(', ');
}

/** Zero-fills a windowed daily series so sparse traffic renders gap-free. */
function zeroFillDaily(
  rows: Array<{ day: string; count: number } & Record<EventGroup, number>>,
  range: AnalyticsRange,
): AnalyticsSnapshot['daily'] {
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out: AnalyticsSnapshot['daily'] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  for (let i = range - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const key = d.toISOString().slice(0, 10);
    const row = byDay.get(key);
    out.push({
      day: key,
      count: row?.count ?? 0,
      Discovery: row?.Discovery ?? 0,
      Education: row?.Education ?? 0,
      Practice: row?.Practice ?? 0,
      Conversion: row?.Conversion ?? 0,
      Retention: row?.Retention ?? 0,
    });
  }
  return out;
}

/**
 * Full read-side snapshot for the founder analytics dashboard.
 * `range` selects the primary window (7/30/90 days); every windowed metric
 * also computes the previous equal-length window so the UI can show trends.
 * Never throws — returns available:false when storage is unreachable
 * so the UI can explain itself instead of erroring.
 */
export async function getAnalyticsSnapshot(
  range: AnalyticsRange = 30,
): Promise<AnalyticsSnapshot> {
  const R = normalizeRange(range);
  try {
    await ensureTables();
    const c = getClient();
    if (!c) return emptySnapshot(R);
    const R2 = R * 2;

    const [totalsRes, dailyRes, eventRes, topRes, refRes, subRes, subListRes, recentRes] =
      await Promise.all([
        c.execute(`
          SELECT
            COUNT(*) AS events,
            SUM(CASE WHEN createdAt >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS events7d,
            SUM(CASE WHEN createdAt >= datetime('now', '-30 days') THEN 1 ELSE 0 END) AS events30d,
            SUM(CASE WHEN createdAt >= datetime('now', '-${R} days') THEN 1 ELSE 0 END) AS eventsWindow,
            SUM(CASE WHEN createdAt >= datetime('now', '-${R2} days') AND createdAt < datetime('now', '-${R} days') THEN 1 ELSE 0 END) AS eventsPrevWindow,
            COUNT(DISTINCT CASE WHEN createdAt >= datetime('now', '-${R} days') THEN sessionId END) AS sessionsWindow,
            COUNT(DISTINCT CASE WHEN createdAt >= datetime('now', '-${R2} days') AND createdAt < datetime('now', '-${R} days') THEN sessionId END) AS sessionsPrevWindow
          FROM AnalyticsEvent
        `),
        c.execute(`
          SELECT
            date(createdAt) AS day,
            COUNT(*) AS count,
            ${groupColumnSql()}
          FROM AnalyticsEvent
          WHERE createdAt >= datetime('now', '-${R} days')
          GROUP BY day ORDER BY day ASC
        `),
        c.execute(`
          SELECT
            event,
            SUM(CASE WHEN createdAt >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS c7,
            SUM(CASE WHEN createdAt >= datetime('now', '-30 days') THEN 1 ELSE 0 END) AS c30,
            SUM(CASE WHEN createdAt >= datetime('now', '-${R} days') THEN 1 ELSE 0 END) AS cw,
            COUNT(*) AS ctotal
          FROM AnalyticsEvent
          GROUP BY event
        `),
        c.execute({
          sql: `
            SELECT slug, event, COUNT(*) AS views
            FROM AnalyticsEvent
            WHERE slug IS NOT NULL AND slug != ''
              AND createdAt >= datetime('now', '-${R} days')
              AND event IN (${CONTENT_EVENTS.map((e) => `'${e}'`).join(', ')})
            GROUP BY slug, event ORDER BY views DESC LIMIT 10
          `,
        }),
        c.execute(`
          SELECT referrer, COUNT(*) AS visits, COUNT(DISTINCT sessionId) AS sessions
          FROM AnalyticsEvent
          WHERE createdAt >= datetime('now', '-${R} days')
          GROUP BY referrer
          ORDER BY visits DESC
          LIMIT 500
        `),
        c.execute(`
          SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN createdAt >= datetime('now', '-${R} days') THEN 1 ELSE 0 END) AS recent
          FROM Subscriber
        `),
        c.execute(`
          SELECT email, source, createdAt
          FROM Subscriber ORDER BY createdAt DESC LIMIT 20
        `),
        c.execute(`
          SELECT event, path, slug, referrer, sessionId, createdAt
          FROM AnalyticsEvent ORDER BY createdAt DESC LIMIT 15
        `),
      ]);

    const t = totalsRes.rows[0] ?? {};
    const s = subRes.rows[0] ?? {};
    const windowOf = (name: EventName) =>
      num(eventRes.rows.find((r) => r.event === name)?.cw);

    const events: AnalyticsSnapshot['events'] = EVENT_NAMES.map((name) => {
      const row = eventRes.rows.find((r) => r.event === name);
      return {
        event: name,
        label: EVENT_META[name].label,
        group: EVENT_META[name].group,
        count7d: num(row?.c7),
        count30d: num(row?.c30),
        countAll: num(row?.ctotal),
        countWindow: num(row?.cw),
      };
    }).sort((a, b) => b.countWindow - a.countWindow || b.countAll - a.countAll);

    // Roll raw referrer URLs up to domains (top 8 by visits).
    const refRollup = new Map<string, { visits: number; sessions: number }>();
    for (const r of refRes.rows) {
      const domain = referrerDomain(r.referrer == null ? null : String(r.referrer));
      const agg = refRollup.get(domain) ?? { visits: 0, sessions: 0 };
      agg.visits += num(r.visits);
      agg.sessions += num(r.sessions);
      refRollup.set(domain, agg);
    }
    const topReferrers = [...refRollup.entries()]
      .map(([domain, v]) => ({ domain, ...v }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 8);

    const dailyRaw = dailyRes.rows.map((r) => ({
      day: String(r.day),
      count: num(r.count),
      Discovery: num(r.Discovery),
      Education: num(r.Education),
      Practice: num(r.Practice),
      Conversion: num(r.Conversion),
      Retention: num(r.Retention),
    }));

    return {
      available: true,
      range: R,
      generatedAt: new Date().toISOString(),
      totals: {
        events: num(t.events),
        eventsWindow: num(t.eventsWindow),
        eventsPrevWindow: num(t.eventsPrevWindow),
        events7d: num(t.events7d),
        events30d: num(t.events30d),
        sessionsWindow: num(t.sessionsWindow),
        sessionsPrevWindow: num(t.sessionsPrevWindow),
        subscribers: num(s.total),
        subscribersWindow: num(s.recent),
      },
      daily: zeroFillDaily(dailyRaw, R),
      events,
      topContent: topRes.rows.map((r) => ({
        slug: String(r.slug),
        event: String(r.event) as EventName,
        views: num(r.views),
      })),
      topReferrers,
      funnel: {
        dossierStarted: windowOf('dossier_started'),
        dossierCompleted: windowOf('dossier_completed'),
        pricingViewed: windowOf('pricing_viewed'),
        consultationStarted: windowOf('consultation_started'),
      },
      recentEvents: recentRes.rows.map((r) => ({
        event: String(r.event) as EventName,
        label: EVENT_META[String(r.event) as EventName]?.label ?? String(r.event),
        group: EVENT_META[String(r.event) as EventName]?.group ?? 'Discovery',
        path: r.path == null ? null : String(r.path),
        slug: r.slug == null ? null : String(r.slug),
        referrer: r.referrer == null ? null : String(r.referrer),
        sessionId: r.sessionId == null ? null : String(r.sessionId),
        createdAt: String(r.createdAt),
      })),
      recentSubscribers: subListRes.rows.map((r) => ({
        email: String(r.email),
        source: r.source == null ? null : String(r.source),
        createdAt: String(r.createdAt),
      })),
    };
  } catch {
    return emptySnapshot(R);
  }
}

/**
 * Full subscriber list as CSV (mailing-list export). Returns null when the
 * store is unreachable — the route turns that into a 503.
 */
export async function getAllSubscribersCsv(): Promise<string | null> {
  try {
    await ensureTables();
    const c = getClient();
    if (!c) return null;
    const res = await c.execute(
      'SELECT email, source, createdAt, confirmed FROM Subscriber ORDER BY createdAt DESC',
    );
    const header = 'email,source,joined_at,confirmed';
    const rows = res.rows.map((r) =>
      [r.email, r.source, r.createdAt, num(r.confirmed) === 1 ? 'yes' : 'no']
        .map((v) => csvEscape(String(v ?? '')))
        .join(','),
    );
    return [header, ...rows].join('\r\n');
  } catch {
    return null;
  }
}

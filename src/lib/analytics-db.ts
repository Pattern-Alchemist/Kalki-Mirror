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

export const EVENT_NAMES = [
  'folio_viewed',
  'pattern_viewed',
  'glossary_term_viewed',
  'search_performed',
  'archetype_viewed',
  'karma_page_viewed',
  'aghori_lesson_viewed',
  'aghori_phase_viewed',
  'breathwork_viewed',
  'sequence_viewed',
  'pricing_viewed',
  'dossier_started',
  'dossier_completed',
  'consultation_started',
  'email_subscribed',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

const EVENT_SET = new Set<string>(EVENT_NAMES);

export interface EventPayload {
  event: string;
  path?: string;
  slug?: string;
  properties?: Record<string, unknown>;
  referrer?: string;
  sessionId?: string;
}

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

/**
 * Event dictionary metadata (TGA §12 two-lattice dictionary, rendered
 * for humans). Every one of the 15 events carries a label + group so
 * the dashboard can teach the founder what each number means.
 */
export const EVENT_META: Record<
  EventName,
  { label: string; group: 'Discovery' | 'Education' | 'Practice' | 'Conversion' | 'Retention' }
> = {
  folio_viewed: { label: 'Siddhi folio opened', group: 'Discovery' },
  pattern_viewed: { label: 'Pattern page opened', group: 'Discovery' },
  glossary_term_viewed: { label: 'Lexicon term opened', group: 'Discovery' },
  search_performed: { label: 'Site search used', group: 'Discovery' },
  archetype_viewed: { label: 'Archetype page opened', group: 'Discovery' },
  karma_page_viewed: { label: 'Karma map opened (US front door)', group: 'Discovery' },
  aghori_phase_viewed: { label: 'Course phase opened', group: 'Education' },
  aghori_lesson_viewed: { label: 'Course lesson opened', group: 'Education' },
  breathwork_viewed: { label: 'Breath practice opened', group: 'Practice' },
  sequence_viewed: { label: 'Practice sequence opened', group: 'Practice' },
  pricing_viewed: { label: 'Pricing viewed', group: 'Conversion' },
  dossier_started: { label: 'Assessment started', group: 'Conversion' },
  dossier_completed: { label: 'Assessment completed', group: 'Conversion' },
  consultation_started: { label: 'Consultation intent (WhatsApp)', group: 'Conversion' },
  email_subscribed: { label: 'Newsletter signup', group: 'Retention' },
};

export interface AnalyticsSnapshot {
  /** false when the event store is unreachable (e.g. local dev without Turso) */
  available: boolean;
  totals: {
    events: number;
    events7d: number;
    events30d: number;
    sessions30d: number;
    subscribers: number;
    subscribers30d: number;
  };
  /** last 30 days, oldest first */
  daily: Array<{ day: string; count: number }>;
  /** all 15 dictionary events with windowed counts, sorted by 30d desc */
  events: Array<{
    event: EventName;
    label: string;
    group: string;
    count7d: number;
    count30d: number;
    countAll: number;
  }>;
  /** top content slugs by views, last 30 days */
  topContent: Array<{ slug: string; views: number }>;
  funnel: {
    dossierStarted: number;
    dossierCompleted: number;
    pricingViewed: number;
    consultationStarted: number;
  };
  recentSubscribers: Array<{ email: string; source: string | null; createdAt: string }>;
}

const EMPTY_SNAPSHOT: AnalyticsSnapshot = {
  available: false,
  totals: { events: 0, events7d: 0, events30d: 0, sessions30d: 0, subscribers: 0, subscribers30d: 0 },
  daily: [],
  events: [],
  topContent: [],
  funnel: { dossierStarted: 0, dossierCompleted: 0, pricingViewed: 0, consultationStarted: 0 },
  recentSubscribers: [],
};

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Full read-side snapshot for the founder analytics dashboard.
 * Never throws — returns available:false when storage is unreachable
 * so the UI can explain itself instead of erroring.
 */
export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  try {
    await ensureTables();
    const c = getClient();
    if (!c) return EMPTY_SNAPSHOT;

    const [totalsRes, dailyRes, eventRes, topRes, subRes, subListRes] = await Promise.all([
      c.execute(`
        SELECT
          COUNT(*) AS events,
          SUM(CASE WHEN createdAt >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS events7d,
          SUM(CASE WHEN createdAt >= datetime('now', '-30 days') THEN 1 ELSE 0 END) AS events30d,
          COUNT(DISTINCT CASE WHEN createdAt >= datetime('now', '-30 days') THEN sessionId END) AS sessions30d
        FROM AnalyticsEvent
      `),
      c.execute(`
        SELECT date(createdAt) AS day, COUNT(*) AS count
        FROM AnalyticsEvent
        WHERE createdAt >= datetime('now', '-30 days')
        GROUP BY day ORDER BY day ASC
      `),
      c.execute(`
        SELECT
          event,
          SUM(CASE WHEN createdAt >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS c7,
          SUM(CASE WHEN createdAt >= datetime('now', '-30 days') THEN 1 ELSE 0 END) AS c30,
          COUNT(*) AS ctotal
        FROM AnalyticsEvent
        GROUP BY event
      `),
      c.execute(`
        SELECT slug, COUNT(*) AS views
        FROM AnalyticsEvent
        WHERE slug IS NOT NULL
          AND createdAt >= datetime('now', '-30 days')
          AND event IN ('folio_viewed','pattern_viewed','glossary_term_viewed',
                        'archetype_viewed','aghori_lesson_viewed','aghori_phase_viewed',
                        'breathwork_viewed','sequence_viewed','karma_page_viewed')
        GROUP BY slug ORDER BY views DESC LIMIT 10
      `),
      c.execute(`
        SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN createdAt >= datetime('now', '-30 days') THEN 1 ELSE 0 END) AS recent
        FROM Subscriber
      `),
      c.execute(`
        SELECT email, source, createdAt
        FROM Subscriber ORDER BY createdAt DESC LIMIT 20
      `),
    ]);

    const t = totalsRes.rows[0] ?? {};
    const s = subRes.rows[0] ?? {};
    const funnelOf = (name: EventName) =>
      num(eventRes.rows.find((r) => r.event === name)?.c30);

    const events: AnalyticsSnapshot['events'] = EVENT_NAMES.map((name) => {
      const row = eventRes.rows.find((r) => r.event === name);
      return {
        event: name,
        label: EVENT_META[name].label,
        group: EVENT_META[name].group,
        count7d: num(row?.c7),
        count30d: num(row?.c30),
        countAll: num(row?.ctotal),
      };
    }).sort((a, b) => b.count30d - a.count30d || b.countAll - a.countAll);

    return {
      available: true,
      totals: {
        events: num(t.events),
        events7d: num(t.events7d),
        events30d: num(t.events30d),
        sessions30d: num(t.sessions30d),
        subscribers: num(s.total),
        subscribers30d: num(s.recent),
      },
      daily: dailyRes.rows.map((r) => ({ day: String(r.day), count: num(r.count) })),
      events,
      topContent: topRes.rows.map((r) => ({ slug: String(r.slug), views: num(r.views) })),
      funnel: {
        dossierStarted: funnelOf('dossier_started'),
        dossierCompleted: funnelOf('dossier_completed'),
        pricingViewed: funnelOf('pricing_viewed'),
        consultationStarted: funnelOf('consultation_started'),
      },
      recentSubscribers: subListRes.rows.map((r) => ({
        email: String(r.email),
        source: r.source == null ? null : String(r.source),
        createdAt: String(r.createdAt),
      })),
    };
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

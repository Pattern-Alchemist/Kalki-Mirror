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

/**
 * ANALYTICS SHARED — pure dictionary data + helpers (client-safe).
 *
 * Everything here is free of server-only imports (no libsql) so the admin
 * dashboard client bundle can use the labels, colors and URL mappings
 * without dragging the database client into the browser. analytics-db.ts
 * re-exports this module — import from either side.
 */

import { termAnchor } from './utils/term-anchor';

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

export const GROUP_NAMES = ['Discovery', 'Education', 'Practice', 'Conversion', 'Retention'] as const;
export type EventGroup = (typeof GROUP_NAMES)[number];

/** Chart + badge color per lattice group (hex for recharts, classes for chips). */
export const GROUP_COLORS: Record<EventGroup, string> = {
  Discovery: '#3b82f6',
  Education: '#f59e0b',
  Practice: '#10b981',
  Conversion: '#f43f5e',
  Retention: '#8b5cf6',
};

export const GROUP_BADGE_CLASSES: Record<EventGroup, string> = {
  Discovery: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
  Education: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
  Practice: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
  Conversion: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
  Retention: 'text-violet-400 border-violet-500/20 bg-violet-500/5',
};

// ─── Windows ────────────────────────────────────────────────────────────────

/** Dashboard windows (days). Closed set — safe to interpolate into SQL. */
export const ANALYTICS_RANGES = [7, 30, 90] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

/** Clamp any input to a supported dashboard window (default 30). */
export function normalizeRange(value: unknown): AnalyticsRange {
  const n = typeof value === 'number' ? value : Number(value);
  return (ANALYTICS_RANGES as readonly number[]).includes(n) ? (n as AnalyticsRange) : 30;
}

// ─── Pure helpers ───────────────────────────────────────────────────────────

/** Domain rollup for a raw referrer string — '' → '(direct)'. */
export function referrerDomain(referrer: string | null | undefined): string {
  const raw = (referrer ?? '').trim();
  if (!raw) return '(direct)';
  try {
    const url = new URL(raw.includes('://') ? raw : `https://${raw}`);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    return host || '(direct)';
  } catch {
    return raw.slice(0, 40);
  }
}

/** Map a tracked content event (+ its slug) to the public URL it happened on. */
export function contentHref(event: string, slug: string | null | undefined): string | null {
  const s = slug?.trim() || null;
  switch (event) {
    case 'folio_viewed': return s ? `/archive/${s}` : '/archive';
    case 'pattern_viewed': return s ? `/patterns/${s}` : '/patterns';
    case 'archetype_viewed': return '/archetypes';
    case 'karma_page_viewed': return '/karma';
    case 'aghori_phase_viewed': return s ? `/aghori-tantra/${s}` : '/aghori-tantra';
    case 'aghori_lesson_viewed': return s ? `/aghori-tantra/${s}` : '/aghori-tantra'; // slug is "phase/lesson"
    case 'breathwork_viewed': return s ? `/breathwork/${s}` : '/breathwork';
    case 'sequence_viewed': return s ? `/sequences/${s}` : '/sequences';
    case 'pricing_viewed': return '/pricing';
    case 'glossary_term_viewed': return s ? `/glossary#${termAnchor(s)}` : '/glossary';
    default: return null;
  }
}

/** RFC-4180 minimal escaping — quotes/commas/newlines get quoted. */
export function csvEscape(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Parse SQLite UTC datetimes ("YYYY-MM-DD HH:MM:SS") and ISO strings alike. */
export function parseDbDate(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return new Date(`${value.replace(' ', 'T')}Z`);
  }
  return new Date(value);
}

/** Compact relative time for the activity feed. */
export function timeAgo(value: string, now: Date = new Date()): string {
  const then = parseDbDate(value);
  const secs = Math.max(0, Math.round((now.getTime() - then.getTime()) / 1000));
  if (!Number.isFinite(secs)) return '—';
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

// ─── Snapshot contract ──────────────────────────────────────────────────────

export interface EventPayload {
  event: string;
  path?: string;
  slug?: string;
  properties?: Record<string, unknown>;
  referrer?: string;
  sessionId?: string;
}

export interface AnalyticsSnapshot {
  /** false when the event store is unreachable (e.g. local dev without Turso) */
  available: boolean;
  /** the window every windowed metric below is computed over */
  range: AnalyticsRange;
  /** ISO timestamp of this snapshot (UTC) */
  generatedAt: string;
  totals: {
    events: number;
    eventsWindow: number;
    /** previous equal-length window — powers the trend deltas */
    eventsPrevWindow: number;
    events7d: number;
    events30d: number;
    sessionsWindow: number;
    sessionsPrevWindow: number;
    subscribers: number;
    subscribersWindow: number;
  };
  /** window, oldest first, zero-filled (no gap days), split by lattice group */
  daily: Array<{ day: string; count: number } & Record<EventGroup, number>>;
  /** all 15 dictionary events with windowed counts, sorted by window desc */
  events: Array<{
    event: EventName;
    label: string;
    group: string;
    count7d: number;
    count30d: number;
    countAll: number;
    countWindow: number;
  }>;
  /** top content (event + slug pairs) by views within the window */
  topContent: Array<{ slug: string; event: EventName; views: number }>;
  /** where seekers arrived from, within the window */
  topReferrers: Array<{ domain: string; visits: number; sessions: number }>;
  funnel: {
    dossierStarted: number;
    dossierCompleted: number;
    pricingViewed: number;
    consultationStarted: number;
  };
  /** the 15 most recent raw events (live activity feed) */
  recentEvents: Array<{
    event: EventName;
    label: string;
    group: string;
    path: string | null;
    slug: string | null;
    referrer: string | null;
    sessionId: string | null;
    createdAt: string;
  }>;
  recentSubscribers: Array<{ email: string; source: string | null; createdAt: string }>;
}

/**
 * FUNNEL — "The one funnel that matters" (Admin OS v2, Ch 7.2)
 *
 * Blueprint Table 7: five stages, each mapped to a data source the site
 * already owns. Stage semantics adapted to the LIVE pipeline vocabulary
 * (NEW → ACKNOWLEDGED → SCHEDULED → COMPLETED, CANCELLED as the side exit):
 * the blueprint's "screened" stage ships as "triaged" — a lead whose status
 * has moved off NEW, including CANCELLED rejections, because a rejection is
 * still triage work. CANCELLED leads therefore never count as booked.
 *
 * Data sources per stage:
 *   1. Visitors       — distinct tracked sessions (AnalyticsEvent, raw libSQL)
 *   2. Wizard started — `consultation_started` events (AnalyticsEvent)
 *   3. Submitted      — Consultation rows created in the window (Prisma, ground truth)
 *   4. Triaged        — window submissions whose current status ≠ NEW
 *   5. Booked         — window submissions with status SCHEDULED or COMPLETED
 *
 * This module is PURE — no DB imports — so the API route, the Overview
 * widget and the unit tests share one definition of the funnel math.
 */

export interface FunnelCounts {
  /** distinct tracked sessions in window; null = event store unavailable */
  visitors: number | null;
  /** consultation_started events in window; null = event store unavailable */
  wizardStarted: number | null;
  /** Consultation rows created in window */
  submitted: number;
  /** …whose current status moved off NEW (incl. CANCELLED) */
  triaged: number;
  /** …with status SCHEDULED or COMPLETED */
  booked: number;
}

export interface FunnelStage {
  key: string;
  label: string;
  definition: string;
  /** the Table 7 question this stage answers */
  question: string;
  value: number | null;
  /** conversion from the previous stage, percent; null when unknown or ÷0 */
  stepPct: number | null;
}

/** Safe percent — null on unknown inputs or divide-by-zero, never throws. */
export function pctOf(part: number | null, whole: number | null): number | null {
  if (part === null || whole === null || whole <= 0) return null;
  return Math.round((part / whole) * 1000) / 10; // one decimal, e.g. 12.5
}

const STAGE_META = [
  {
    key: 'visitors',
    label: 'Visitors',
    definition: 'Distinct tracked sessions on astrokalki.com',
    question: 'Reach quality',
  },
  {
    key: 'wizardStarted',
    label: 'Wizard started',
    definition: 'Landed on /consultations and opened step 1',
    question: 'Hook strength',
  },
  {
    key: 'submitted',
    label: 'Request submitted',
    definition: 'Server action persisted a Consultation row',
    question: 'Page conversion',
  },
  {
    key: 'triaged',
    label: 'Triaged',
    definition: 'Archivist touched the lead (status moved off NEW)',
    question: 'Triage speed',
  },
  {
    key: 'booked',
    label: 'Booked',
    definition: 'scheduledFor agreed — SCHEDULED or COMPLETED',
    question: 'Revenue committed',
  },
] as const;

/* ════════════════════════════════════════════════════════════════════
   Attribution rollups (Vol. 2 #4 — "prove email→wizard attribution")

   The five stages above say HOW the funnel bends; the rollups say WHERE
   leads came from. The email course tags every CTA with
   utm_campaign=doors-email-course&utm_content=day-N (course-content.ts);
   the wizard action freezes the snapshot into the Consultation row; these
   two pure functions turn window rows into the two views the founder
   needs — top campaigns, and the per-door day board.
   ════════════════════════════════════════════════════════════════════ */

/** Minimal lead shape the rollups consume (straight from Prisma select). */
export interface LeadAttributionRow {
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  status: string;
}

export interface RollupRow {
  key: string;
  label: string;
  submitted: number;
  triaged: number;
  booked: number;
}

const DOORS_CAMPAIGN = 'doors-email-course';

/** Human order for door days: welcome → day-1..10 → day-10-review. */
const DOOR_ORDER: string[] = [
  'welcome',
  ...Array.from({ length: 10 }, (_, i) => `day-${i + 1}`),
  'day-10-review',
];

function daySortKey(content: string): number {
  const idx = DOOR_ORDER.indexOf(content);
  return idx === -1 ? DOOR_ORDER.length : idx;
}

function prettifyKey(key: string): string {
  return key
    .replace(/^doors-/, '')
    .replace(/-course$/, '')
    .replace(/-/g, ' ');
}

function emptyRow(key: string, label?: string): RollupRow {
  return { key, label: label ?? prettifyKey(key), submitted: 0, triaged: 0, booked: 0 };
}

/**
 * Top campaigns over window leads. Untagged leads (no utm_campaign) roll
 * up under "(untagged)" — the honest "direct / organic / pre-attribution"
 * bucket that keeps the totals reconcilable with the stage counts.
 * Sorted by submitted desc; ties keep insertion order.
 */
export function buildCampaignRollup(leads: LeadAttributionRow[]): RollupRow[] {
  const byKey = new Map<string, RollupRow>();
  for (const l of leads) {
    const key = l.utmCampaign?.trim() || '(untagged)';
    const row = byKey.get(key) ?? emptyRow(key, key === '(untagged)' ? '(untagged)' : undefined);
    row.submitted += 1;
    if (l.status !== 'NEW') row.triaged += 1;
    if (l.status === 'SCHEDULED' || l.status === 'COMPLETED') row.booked += 1;
    byKey.set(key, row);
  }
  return [...byKey.values()].sort((a, b) => b.submitted - a.submitted);
}

/**
 * The Doors day board — leads whose utm_campaign is exactly
 * `doors-email-course`, grouped by utm_content (welcome, day-1…day-10,
 * day-10-review). Days with zero submissions still appear when at least
 * one door day exists, so the board reads like the email calendar instead
 * of a partial slice. Rows carry the day number for chip rendering.
 */
export function buildDoorsRollup(leads: LeadAttributionRow[]): (RollupRow & { day: string })[] {
  const doors = leads.filter((l) => l.utmCampaign?.trim() === DOORS_CAMPAIGN);
  if (doors.length === 0) return [];

  const byContent = new Map<string, RollupRow>();
  for (const l of doors) {
    const key = l.utmContent?.trim() || 'unattributed';
    const row = byContent.get(key) ?? emptyRow(key, key === 'unattributed' ? '(no day tag)' : prettifyKey(key));
    row.submitted += 1;
    if (l.status !== 'NEW') row.triaged += 1;
    if (l.status === 'SCHEDULED' || l.status === 'COMPLETED') row.booked += 1;
    byContent.set(key, row);
  }

  return [...byContent.entries()]
    .map(([key, row]) => ({ ...row, key, day: key }))
    .sort((a, b) => daySortKey(a.day) - daySortKey(b.day) || b.submitted - a.submitted);
}

/**
 * Assemble the five-stage funnel from raw counts.
 *
 * The blueprint's single number — "the drop-off between wizard start and
 * submission tells you whether the four-service page converts" — is simply
 * stages[2].stepPct in the returned array.
 */
export function buildFunnelStages(counts: FunnelCounts): FunnelStage[] {
  const values: Array<number | null> = [
    counts.visitors,
    counts.wizardStarted,
    counts.submitted,
    counts.triaged,
    counts.booked,
  ];

  return STAGE_META.map((meta, i) => ({
    ...meta,
    value: values[i],
    stepPct: i === 0 ? null : pctOf(values[i], values[i - 1]),
  }));
}

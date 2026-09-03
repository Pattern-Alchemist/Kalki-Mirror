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

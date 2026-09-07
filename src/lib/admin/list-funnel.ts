/**
 * LIST FUNNEL — "what does the list actually convert?" (Vol. 4 #3)
 *
 * The consultation funnel (funnel.ts) answers the CRM question. This one
 * answers the LIST question: for each weekly cohort of new subscribers,
 * how far did they travel — from joining the list to submitting the intake?
 *
 * Weekly cohort stages, every one joined on the subscriber's EMAIL address
 * (no new tracking, no identity guessing):
 *   1. joined       — EmailSubscriber row created that week
 *   2. opened D3    — EmailEvent `email.opened` on a doorDay-3 EmailSend
 *                     to their address (the lesson that teaches the habit)
 *   3. clicked      — EmailEvent `email.clicked` for their address (any send)
 *   4. consultations — a clicked event whose URL is /consultations
 *                     (the email drove them to the work)
 *   5. intake       — a Consultation row with their email, created after
 *                     they joined (wizard submit = lead captured)
 *
 * Stages 2–4 are email-metadata truth (opens/clicks as reported by the
 * provider webhook); stage 5 is ledger truth. Stages are NOT forced to be
 * strictly nested — pixel-blocked-but-link-clicking readers exist — so
 * each stage is counted independently and honestly.
 *
 * This module is PURE — no DB imports — so the war-room API, the daily
 * digest and the unit tests share one definition of the math.
 */

/** Cohort window: the current (in-flight) week + the five before it. */
export const LIST_FUNNEL_WEEKS = 6;

export interface FunnelSubscriber {
  email: string;
  createdAt: string; // ISO
}

export interface Door3Send {
  email: string;
  emailId: string;
}

export interface EmailEventRow {
  email: string;
  emailId: string;
  type: string; // email.opened | email.clicked | …
  url: string | null;
}

export interface ConsultationRow {
  email: string;
  createdAt: string; // ISO
}

export interface ListFunnelCohort {
  /** Monday 00:00 UTC that anchors the cohort week (ISO date) */
  weekStart: string;
  /** human label, e.g. "31 Aug" */
  weekLabel: string;
  subscribed: number;
  d3Opened: number;
  clicked: number;
  consulted: number;
  lead: number;
}

export interface ListFunnelResult {
  available: boolean;
  cohorts: ListFunnelCohort[]; // oldest → newest
}

/** Monday 00:00 UTC of the week containing d. */
export function weekStartUtc(d: Date): Date {
  const day = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = (day.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  return new Date(day.getTime() - dow * 86_400_000);
}

function weekLabel(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
}

/**
 * Build the weekly cohort funnel from raw rows. Never throws; cohorts with
 * no subscribers are zero-filled (honest silence, not an empty chart).
 */
export function buildListFunnel(input: {
  subscribers: FunnelSubscriber[];
  door3Sends: Door3Send[];
  events: EmailEventRow[];
  consultations: ConsultationRow[];
  now: Date;
  weeks?: number;
}): ListFunnelCohort[] {
  const weeks = Math.max(1, Math.min(26, input.weeks ?? LIST_FUNNEL_WEEKS));
  const currentWeek = weekStartUtc(input.now);

  // Anchor the buckets oldest → newest.
  const anchors: Date[] = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    anchors.push(new Date(currentWeek.getTime() - i * 7 * 86_400_000));
  }
  const windowStart = anchors[0].getTime();

  const cohorts: ListFunnelCohort[] = anchors.map((a) => ({
    weekStart: a.toISOString().slice(0, 10),
    weekLabel: weekLabel(a),
    subscribed: 0,
    d3Opened: 0,
    clicked: 0,
    consulted: 0,
    lead: 0,
  }));
  const bucketEnd = currentWeek.getTime() + 7 * 86_400_000;

  // Bucket subscribers by join week; remember each subscriber's join instant
  // (stage 5 requires the intake to come AFTER the join).
  const emailToCohort = new Map<string, number>(); // email → cohort index
  const emailToJoinedAt = new Map<string, number>();
  for (const s of input.subscribers) {
    const email = s.email.trim().toLowerCase();
    if (!email) continue;
    const t = new Date(s.createdAt).getTime();
    if (Number.isNaN(t) || t < windowStart || t >= bucketEnd) continue;
    const idx = anchors.findIndex((a) => {
      const start = a.getTime();
      return t >= start && t < start + 7 * 86_400_000;
    });
    if (idx === -1) continue;
    cohorts[idx].subscribed += 1;
    // First join wins — resubscribes don't double-count a cohort.
    if (!emailToCohort.has(email)) {
      emailToCohort.set(email, idx);
      emailToJoinedAt.set(email, t);
    }
  }

  // doorDay-3 sends: email → the Resend ids a "D3 open" can attach to.
  const d3IdsByEmail = new Map<string, Set<string>>();
  for (const s of input.door3Sends) {
    const email = s.email.trim().toLowerCase();
    if (!email || !s.emailId) continue;
    const set = d3IdsByEmail.get(email) ?? new Set<string>();
    set.add(s.emailId);
    d3IdsByEmail.set(email, set);
  }

  // Fold the event stream into per-subscriber stage flags.
  const openedD3 = new Set<string>();
  const clicked = new Set<string>();
  const consulted = new Set<string>();
  for (const e of input.events) {
    const email = e.email.trim().toLowerCase();
    if (!emailToCohort.has(email)) continue;
    if (e.type === "email.opened" && d3IdsByEmail.get(email)?.has(e.emailId)) {
      openedD3.add(email);
    }
    if (e.type === "email.clicked") {
      clicked.add(email);
      if (e.url && e.url.includes("/consultations")) consulted.add(email);
    }
  }

  // Stage 5 — ledger truth: an intake (Consultation row) created after the
  // seeker joined the list.
  for (const c of input.consultations) {
    const email = c.email.trim().toLowerCase();
    const idx = emailToCohort.get(email);
    if (idx === undefined) continue;
    const joinedAt = emailToJoinedAt.get(email) ?? 0;
    const t = new Date(c.createdAt).getTime();
    if (!Number.isNaN(t) && t >= joinedAt) cohorts[idx].lead += 1;
  }

  // Fold the per-email flags back into their cohort buckets.
  for (const email of emailToCohort.keys()) {
    const idx = emailToCohort.get(email)!;
    if (openedD3.has(email)) cohorts[idx].d3Opened += 1;
    if (clicked.has(email)) cohorts[idx].clicked += 1;
    if (consulted.has(email)) cohorts[idx].consulted += 1;
  }

  return cohorts;
}

/**
 * The digest line — the last COMPLETE week (the week before the current
 * in-flight one), or the newest week that has any subscribers. Null when
 * the window is all silence: the digest never fabricates a funnel.
 */
export function listFunnelDigestLine(cohorts: ListFunnelCohort[]): string | null {
  if (cohorts.length === 0) return null;
  const complete = cohorts.length >= 2 ? cohorts[cohorts.length - 2] : null;
  const pick = complete && complete.subscribed > 0 ? complete : [...cohorts].reverse().find((c) => c.subscribed > 0);
  if (!pick) return null;
  const scope = pick === complete ? "week of" : "week so far —";
  return (
    `List funnel (${scope} ${pick.weekLabel}): ` +
    `${pick.subscribed} joined → ${pick.d3Opened} opened Door 3 → ` +
    `${pick.clicked} clicked → ${pick.consulted} to /consultations → ` +
    `${pick.lead} intake${pick.lead === 1 ? "" : "s"}`
  );
}

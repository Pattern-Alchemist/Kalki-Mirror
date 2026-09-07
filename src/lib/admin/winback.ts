/**
 * WIN-BACK SEGMENT — "the silently cold" (Vol. 4 #4)
 *
 * EmailEvent captures opens per subscriber; unsubscribed re-activation
 * already exists (Vol. 3 #7). The segment this module defines is the one
 * that just decays: ACTIVE subscribers, on the list long enough to know
 * us, who haven't opened anything in weeks. They never said stop — but
 * they also never said anything.
 *
 * Two dials govern the whole feature, both enforced in the send path:
 *   · COLD    — active, joined ≥ 21 days ago, zero opens in the last
 *               21 days (never-opened veterans included: they are the
 *               coldest rows we have; day-old signups are excluded —
 *               the course hasn't had a chance to reach them yet).
 *   · SUPPRESS— ≤ 1 win-back per subscriber per 30 days. A win-back
 *               EmailSend (kind "winback") inside the window suppresses
 *               the address, whatever the open ledger says. Pestering
 *               is not re-engagement.
 *
 * This module is PURE — no DB imports — so the broadcast actions and the
 * unit tests share one definition of "cold".
 */

/** Zero opens in this many days = cold (and the subscriber must be at least this old). */
export const WINBACK_OPEN_WINDOW_DAYS = 21;

/** At most one win-back per subscriber per this many days. */
export const WINBACK_SUPPRESSION_DAYS = 30;

export const WINBACK_KIND = "winback";

const DAY_MS = 86_400_000;

export interface WinbackCandidate {
  email: string;
  createdAt: string; // ISO — when they joined the list
}

export interface WinbackSegmentResult {
  /** cold + not suppressed, oldest join first (broadcast batch order) */
  cold: string[];
  /** cold by opens, but a win-back already went out inside the suppression window */
  suppressed: number;
}

/**
 * Fold raw rows into the sendable segment. The caller's queries define the
 * windows; this function owns the RULES (age gate, warmth exclusion,
 * suppression, dedupe, stable oldest-first order).
 */
export function reduceWinbackSegment(input: {
  now: Date;
  candidates: WinbackCandidate[]; // active subscribers (age gate applied HERE)
  opensInWindow: { email: string }[]; // opened within WINBACK_OPEN_WINDOW_DAYS
  winbacksInWindow: { email: string }[]; // win-back sent within WINBACK_SUPPRESSION_DAYS
}): WinbackSegmentResult {
  const nowMs = input.now.getTime();
  const minAgeMs = WINBACK_OPEN_WINDOW_DAYS * DAY_MS;

  const warmedBy = new Set(input.opensInWindow.map((r) => r.email.trim().toLowerCase()));
  const alreadySent = new Set(input.winbacksInWindow.map((r) => r.email.trim().toLowerCase()));

  const cold: Array<{ email: string; joinedAt: number }> = [];
  const seen = new Set<string>();
  let suppressed = 0;

  for (const c of input.candidates) {
    const email = c.email.trim().toLowerCase();
    if (!email || seen.has(email)) continue;
    seen.add(email);

    const joinedAt = new Date(c.createdAt).getTime();
    if (Number.isNaN(joinedAt)) continue;
    // Age gate — the course deserves 21 days before we call a reader cold.
    if (nowMs - joinedAt < minAgeMs) continue;
    // Warmth — any open inside the window means the thread is alive.
    if (warmedBy.has(email)) continue;
    // Suppression — at most one win-back per 30 days, whatever the opens say.
    if (alreadySent.has(email)) {
      suppressed += 1;
      continue;
    }
    cold.push({ email, joinedAt });
  }

  // Oldest join first — the segment OWNS this rule, it never depends on
  // the caller's query ordering.
  cold.sort((a, b) => a.joinedAt - b.joinedAt);

  return { cold: cold.map((c) => c.email), suppressed };
}

// =============================================================
// KALKI — SCHEDULED PUBLISHING (Vol. 4 #8)
// -------------------------------------------------------------
// ContentEntry.publishedAt was decorative: publishing was a manual
// status flip and the renderer gated on status PUBLISHED only. This
// module gives publishedAt real semantics:
//
//   · PUBLISHED + publishedAt in the FUTURE  → SCHEDULED state
//     (hidden from every public surface until due)
//   · PUBLISHED + publishedAt past/null      → live (null = legacy
//     rows published before the stamp existed — they must never
//     regress out of the public corpus)
//   · the studio stamps a future publishedAt as a publish decision
//     (admin-gated, audited "content.schedule")
//   · the daily cleanup cron runs a FLIP PASS: entries whose due
//     time has arrived get their publish side effects (webhook,
//     notification, sitemap refresh) exactly once — idempotence is
//     enforced by an audit pair (content.schedule written at
//     scheduling, content.publish_flip written at the flip)
//
// Pure functions only (no DB, no React) so the studio, the renderers,
// the cron and the tests share one truth.
// =============================================================

/** Minimal shape every caller can provide (ContentEntry rows included). */
export interface SchedulableEntry {
  status: string;
  publishedAt: Date | null;
}

/** Minimal audit shape the flip planner reads (AdminAuditLog rows). */
export interface ScheduleAuditRow {
  action: string;
  entityId: string | null;
  after: string | null; // JSON, e.g. {"publishAt":"2026-09-10T18:30:00.000Z"}
}

/**
 * Is this entry DUE — i.e. live to the public if (and only if) it is
 * PUBLISHED? The single source of truth for the SCHEDULED semantics:
 *   · PUBLISHED + null publishedAt        → due (legacy-safe)
 *   · PUBLISHED + publishedAt <= now      → due
 *   · PUBLISHED + publishedAt in future   → NOT due (scheduled)
 *   · anything else                       → not due (status gate
 *     remains the caller's existing check; this helper only answers
 *     the time question — combine with status === 'PUBLISHED').
 */
export function isEntryDue(publishedAt: Date | null, now: Date = new Date()): boolean {
  if (!publishedAt) return true; // legacy rows: stamp predates this feature
  return publishedAt.getTime() <= now.getTime();
}

/**
 * The full public gate WITH the schedule dimension. Drop-in for the
 * previous two-field signature (extra fields ignored), so every
 * existing call site becomes schedule-aware without edits.
 */
export function isPubliclyRenderableWithSchedule(
  entry: { status: string; caution: string; publishedAt?: Date | null },
  now: Date = new Date()
): boolean {
  if (entry.status !== 'PUBLISHED') return false;
  return isEntryDue(entry.publishedAt ?? null, now);
}

/**
 * DB-level WHERE fragment for list queries (Prisma shape): due-or-
 * unstamped PUBLISHED rows only. The null branch keeps legacy rows
 * and immediate publishes visible — SQL `publishedAt <= now` alone
 * would silently hide them (NULL comparisons are never true).
 */
export function duePublishedWhere(now: Date = new Date()): {
  OR: Array<Record<string, unknown>>;
} {
  return {
    OR: [{ publishedAt: null }, { publishedAt: { lte: now } }],
  };
}

/** ISO string used consistently in schedule audit rows. */
function publishAtIso(publishedAt: Date): string {
  return publishedAt.toISOString();
}

/**
 * The flip-pass planner. Given PUBLISHED rows whose publishedAt has
 * come due and the studio's schedule/flip audit history, decide which
 * entries need their publish side effects fired exactly once.
 *
 * Pairing rule: an entry flips when a `content.schedule` audit exists
 * for (entityId, publishAt == entry.publishedAt) WITHOUT a matching
 * `content.publish_flip` audit for the same pair. Entries that were
 * published immediately (no schedule audit at all) never flip — their
 * side effects fired synchronously in the studio action.
 *
 * Returns the planned flips with the schedule audit payload so the
 * cron route can act without re-parsing.
 */
export function planPublishFlips(
  dueEntries: Array<{ id: string; title: string; type: string; slug?: string; publishedAt: Date | null }>,
  audits: ScheduleAuditRow[],
  now: Date = new Date()
): Array<{ id: string; title: string; type: string; slug?: string; publishedAt: Date }> {
  if (dueEntries.length === 0) return [];

  const schedules = new Map<string, Set<string>>(); // entityId -> publishAt ISOs scheduled
  const flips = new Map<string, Set<string>>(); // entityId -> publishAt ISOs already flipped

  for (const a of audits) {
    if (a.action === 'content.schedule' && a.entityId && a.after) {
      try {
        const parsed = JSON.parse(a.after) as { publishAt?: string };
        if (parsed.publishAt) {
          const set = schedules.get(a.entityId) ?? new Set<string>();
          set.add(parsed.publishAt);
          schedules.set(a.entityId, set);
        }
      } catch {
        // corrupt audit row — never crash the cron over forensics
      }
    }
    if (a.action === 'content.publish_flip' && a.entityId && a.after) {
      try {
        const parsed = JSON.parse(a.after) as { publishAt?: string };
        if (parsed.publishAt) {
          const set = flips.get(a.entityId) ?? new Set<string>();
          set.add(parsed.publishAt);
          flips.set(a.entityId, set);
        }
      } catch {
        // corrupt audit row — treat as never flipped
      }
    }
  }

  const plan: Array<{ id: string; title: string; type: string; slug?: string; publishedAt: Date }> = [];
  for (const e of dueEntries) {
    // null publishedAt = legacy immediate publish — no schedule audit can
    // exist for it, so it can never be planned (defensive over the SQL
    // filter, which already excludes nulls via the lte comparison).
    if (!e.publishedAt) continue;
    const iso = publishAtIso(e.publishedAt);
    if (e.publishedAt.getTime() > now.getTime()) continue; // not due yet
    const wasScheduled = schedules.get(e.id)?.has(iso) ?? false;
    if (!wasScheduled) continue; // immediate publish — side effects already fired
    const alreadyFlipped = flips.get(e.id)?.has(iso) ?? false;
    if (!alreadyFlipped) plan.push(e as { id: string; title: string; type: string; slug?: string; publishedAt: Date });
  }
  return plan;
}

/**
 * The audit payload written by the studio when a schedule is set, and
 * by the cron when a flip fires. One builder = one shape = the pair
 * match in planPublishFlips can never drift.
 */
export function scheduleAuditPayload(publishedAt: Date): { publishAt: string } {
  return { publishAt: publishAtIso(publishedAt) };
}

/**
 * Studio-side classification for the table chip: what is this row's
 * public state right now? ("SCHEDULED" is a state of PUBLISHED rows,
 * not a status value — the STATUSES enum stays untouched.)
 */
export function rowPublishState(
  entry: { status: string; publishedAt: Date | null },
  now: Date = new Date()
): 'SCHEDULED' | 'LIVE' | 'UNPUBLISHED' {
  if (entry.status !== 'PUBLISHED') return 'UNPUBLISHED';
  if (!entry.publishedAt) return 'LIVE';
  return entry.publishedAt.getTime() > now.getTime() ? 'SCHEDULED' : 'LIVE';
}

// =============================================================
// KALKI — SCHEDULED PUBLISHING tests (Vol. 4 #8)
// -------------------------------------------------------------
// The SCHEDULED semantics: PUBLISHED + future publishedAt is hidden
// until due; null publishedAt (legacy rows) must never regress out
// of the public corpus; the cron flip pass fires publish side
// effects exactly once per (entry, due-date) pair.
// =============================================================
import { describe, expect, it } from "vitest";
import {
  isEntryDue,
  isPubliclyRenderableWithSchedule,
  duePublishedWhere,
  planPublishFlips,
  scheduleAuditPayload,
  rowPublishState,
  type ScheduleAuditRow,
} from "@/lib/admin/scheduled-publish";
import { isPubliclyRenderable } from "@/lib/seo/content-seo";

const T0 = new Date("2026-09-08T10:00:00.000Z");
const PAST = new Date("2026-09-01T10:00:00.000Z");
const FUTURE = new Date("2026-09-20T10:00:00.000Z");

describe("isEntryDue (the time dimension of the public gate)", () => {
  it("null publishedAt is due — legacy rows can never regress out", () => {
    expect(isEntryDue(null, T0)).toBe(true);
  });

  it("past publishedAt is due", () => {
    expect(isEntryDue(PAST, T0)).toBe(true);
  });

  it("future publishedAt is NOT due (SCHEDULED)", () => {
    expect(isEntryDue(FUTURE, T0)).toBe(false);
  });

  it("the exact due instant itself is due (<=, not <)", () => {
    expect(isEntryDue(T0, T0)).toBe(true);
  });
});

describe("isPubliclyRenderable — the combined status + caution + schedule gate", () => {
  const base = { status: "PUBLISHED", caution: "OPEN" as const };

  it("PUBLISHED + due + OPEN renders", () => {
    expect(isPubliclyRenderable({ ...base, caution: "OPEN", publishedAt: PAST })).toBe(true);
  });

  it("PUBLISHED + null publishedAt renders (legacy-safe)", () => {
    expect(isPubliclyRenderable({ ...base, publishedAt: null })).toBe(true);
  });

  it("PUBLISHED + future publishedAt is SCHEDULED and hidden", () => {
    expect(isPubliclyRenderable({ ...base, publishedAt: FUTURE })).toBe(false);
  });

  it("DRAFT never renders even with a due stamp", () => {
    expect(isPubliclyRenderable({ status: "DRAFT", caution: "OPEN", publishedAt: PAST })).toBe(false);
  });

  it("SEALED never renders even when due", () => {
    expect(isPubliclyRenderable({ status: "PUBLISHED", caution: "SEALED", publishedAt: PAST })).toBe(false);
  });

  it("the schedule-aware twin agrees with the public gate", () => {
    expect(isPubliclyRenderableWithSchedule({ status: "PUBLISHED", caution: "OPEN", publishedAt: FUTURE }, T0)).toBe(false);
    expect(isPubliclyRenderableWithSchedule({ status: "PUBLISHED", caution: "OPEN", publishedAt: PAST }, T0)).toBe(true);
  });
});

describe("duePublishedWhere (the DB-level filter)", () => {
  it("carries exactly two OR branches: legacy-null and due", () => {
    const where = duePublishedWhere(T0);
    expect(where.OR).toHaveLength(2);
    expect(where.OR).toContainEqual({ publishedAt: null });
    expect(where.OR).toContainEqual({ publishedAt: { lte: T0 } });
  });
});

function audit(action: string, entityId: string, publishAt: string): ScheduleAuditRow {
  return { action, entityId, after: JSON.stringify({ publishAt }) };
}

describe("planPublishFlips (the cron's exactly-once planner)", () => {
  const entry = {
    id: "e1",
    title: "Scheduled Entry",
    type: "practice",
    publishedAt: PAST, // due
  };

  it("plans a due scheduled entry that has no flip yet", () => {
    const audits = [audit("content.schedule", "e1", PAST.toISOString())];
    const plan = planPublishFlips([entry], audits, T0);
    expect(plan).toHaveLength(1);
    expect(plan[0].id).toBe("e1");
  });

  it("never re-plans an entry whose flip audit already exists (exactly once)", () => {
    const audits = [
      audit("content.schedule", "e1", PAST.toISOString()),
      audit("content.publish_flip", "e1", PAST.toISOString()),
    ];
    expect(planPublishFlips([entry], audits, T0)).toHaveLength(0);
  });

  it("ignores immediate publishes (no schedule audit — side effects fired in the studio)", () => {
    expect(planPublishFlips([entry], [], T0)).toHaveLength(0);
  });

  it("pair-matches on the publishAt value — a schedule for a DIFFERENT date never flips", () => {
    const audits = [audit("content.schedule", "e1", FUTURE.toISOString())];
    expect(planPublishFlips([entry], audits, T0)).toHaveLength(0);
  });

  it("a future publishedAt is not due — never planned", () => {
    const futureEntry = { ...entry, publishedAt: FUTURE };
    const audits = [audit("content.schedule", "e1", FUTURE.toISOString())];
    expect(planPublishFlips([futureEntry], audits, T0)).toHaveLength(0);
  });

  it("corrupt audit JSON is ignored, not fatal", () => {
    const audits: ScheduleAuditRow[] = [
      { action: "content.schedule", entityId: "e1", after: "{not json" },
      audit("content.schedule", "e1", PAST.toISOString()),
    ];
    expect(planPublishFlips([entry], audits, T0)).toHaveLength(1);
  });

  it("audits for other entries never leak into the plan", () => {
    const audits = [audit("content.schedule", "other", PAST.toISOString())];
    expect(planPublishFlips([entry], audits, T0)).toHaveLength(0);
  });

  it("empty inputs → empty plan", () => {
    expect(planPublishFlips([], [], T0)).toHaveLength(0);
  });
});

describe("scheduleAuditPayload + rowPublishState (studio truth)", () => {
  it("the audit payload is exactly the pair shape the planner matches", () => {
    expect(scheduleAuditPayload(PAST)).toEqual({ publishAt: PAST.toISOString() });
  });

  it("SCHEDULED is a state of PUBLISHED rows, not a status value", () => {
    expect(rowPublishState({ status: "PUBLISHED", publishedAt: FUTURE }, T0)).toBe("SCHEDULED");
    expect(rowPublishState({ status: "PUBLISHED", publishedAt: PAST }, T0)).toBe("LIVE");
    expect(rowPublishState({ status: "PUBLISHED", publishedAt: null }, T0)).toBe("LIVE");
    expect(rowPublishState({ status: "DRAFT", publishedAt: FUTURE }, T0)).toBe("UNPUBLISHED");
    expect(rowPublishState({ status: "ARCHIVED", publishedAt: PAST }, T0)).toBe("UNPUBLISHED");
  });
});

// =============================================================
// KALKI — 10 Doors course sender (daily Vercel cron)
// -------------------------------------------------------------
// GET /api/cron/course-send              → send due doors (incl. catch-up)
// GET /api/cron/course-send?dryRun=1     → report, send nothing
//
// AUTH (mirrors /api/indexnow):
//   · Authorization: Bearer <CRON_SECRET> — attached by Vercel
//   · ?key=<CRON_SECRET>                  — manual runs
//
// DESIGN (doors-email-course.md §7, upgraded by Vol. 3 #9):
//   · course day = whole IST calendar days since createdAt
//   · day 0 skips by design — the welcome email already went out
//     immediately at subscribe time (subscribe route, after())
//   · day 1–10 → UNLOGGED doors inside the lookback window
//     (computeDueDoors): a missed run no longer permanently skips
//     a Door — the EmailSend ledger IS the progression state
//   · day 11+ → completion email, once ever, within the window
//     (shouldSendCompletion)
//   · batch cap 150 sends/run + per-subscriber catch-up cap 2 —
//     stays well inside provider and cron time limits; overflow
//     waits for tomorrow's run
//
// SCHEDULE: vercel.json cron "30 14 * * *" = 20:00 IST daily —
// the publishing hour (doc §1: "consistency beats optimality").
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  computeCourseDay,
  computeDueDoors,
  shouldSendCompletion,
  sendDoorDay,
  sendCompletion,
} from "@/lib/emails/course-send";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH_CAP = 150;

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // no secret configured → endpoint stays closed
  const header = request.headers.get("authorization") ?? "";
  if (header === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("key") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json(
      { error: "unauthorized", hint: "Vercel cron bearer token or ?key=<CRON_SECRET>" },
      { status: 401 },
    );
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";

  let subscribers: { email: string; createdAt: Date }[];
  try {
    subscribers = await db.emailSubscriber.findMany({
      where: { status: "active" },
      select: { email: true, createdAt: true },
      orderBy: { createdAt: "asc" },
      take: 500,
    });
  } catch (err) {
    console.error("[course-send] subscriber query failed", err);
    return NextResponse.json({ ok: false, error: "subscriber query failed" }, { status: 500 });
  }

  // ── Vol. 3 #9: read the ledger once for the whole batch ──
  // sentDoors[email] = set of doorDays with an accepted send on record;
  // completionSent[email] = whether the completion email ever logged.
  const emails = subscribers.map((s) => s.email);
  const sentDoors = new Map<string, Set<number>>();
  const completionSent = new Set<string>();
  if (emails.length > 0) {
    try {
      const ledger = await db.emailSend.findMany({
        where: { email: { in: emails }, kind: { in: ["door", "completion"] } },
        select: { email: true, kind: true, doorDay: true },
      });
      for (const row of ledger) {
        if (row.kind === "door" && row.doorDay != null) {
          let set = sentDoors.get(row.email);
          if (!set) {
            set = new Set<number>();
            sentDoors.set(row.email, set);
          }
          set.add(row.doorDay);
        } else if (row.kind === "completion") {
          completionSent.add(row.email);
        }
      }
    } catch (err) {
      // Ledger read failed → behave like the pre-backfill era: send only
      // today's door (sent-sets stay empty, window still bounds damage).
      console.error("[course-send] ledger read failed — falling back to day-only plan", err);
    }
  }

  const now = new Date();
  type PlanItem = { email: string; day: number; action: "door" | "completion"; door: number | null };
  const plan: PlanItem[] = [];
  for (const s of subscribers) {
    const day = computeCourseDay(s.createdAt, now);
    const doors = computeDueDoors(day, sentDoors.get(s.email) ?? []);
    for (const d of doors) {
      plan.push({ email: s.email, day, action: "door", door: d });
    }
    if (shouldSendCompletion(day, completionSent.has(s.email))) {
      plan.push({ email: s.email, day, action: "completion", door: null });
    }
  }

  const dueAll = plan;
  const due = dueAll.slice(0, BATCH_CAP);
  const overflow = Math.max(0, dueAll.length - BATCH_CAP);
  const backfillCount = dueAll.filter((p) => {
    // a catch-up send = a door that isn't "today's", or any late completion
    if (p.action === "completion") return p.day !== 11;
    return p.door !== p.day;
  }).length;

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      activeSubscribers: subscribers.length,
      dueToday: dueAll.length,
      backfill: backfillCount,
      overflow,
      plan: dueAll.slice(0, 25).map((p) => ({
        email: p.email,
        day: p.day,
        action: p.action === "completion" ? "completion" : `door-${p.door}`,
      })),
    });
  }

  const results: { email: string; action: string; ok: boolean; id?: string; error?: string }[] = [];
  for (const item of due) {
    try {
      const res =
        item.action === "completion"
          ? await sendCompletion(item.email)
          : await sendDoorDay(item.email, item.door as number);
      results.push({
        email: item.email,
        action: item.action === "completion" ? "completion" : `door-${item.door}`,
        ok: res.ok,
        id: res.id,
        error: res.error,
      });
    } catch (err) {
      console.error("[course-send] send threw", item.email, item.action, err);
      results.push({
        email: item.email,
        action: item.action === "completion" ? "completion" : `door-${item.door}`,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  console.info(
    `[course-send] active=${subscribers.length} due=${due.length} sent=${sent} failed=${failed} backfill=${backfillCount} overflow=${overflow}`,
  );

  return NextResponse.json({
    ok: true,
    activeSubscribers: subscribers.length,
    due: due.length,
    sent,
    failed,
    backfill: backfillCount,
    overflow,
    ...(process.env.VERCEL !== "1" ? { results } : {}),
  });
}

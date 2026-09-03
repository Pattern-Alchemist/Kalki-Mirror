// =============================================================
// KALKI — 10 Doors course sender (daily Vercel cron)
// -------------------------------------------------------------
// GET /api/cron/course-send              → send today's doors
// GET /api/cron/course-send?dryRun=1     → report, send nothing
//
// AUTH (mirrors /api/indexnow):
//   · Authorization: Bearer <CRON_SECRET> — attached by Vercel
//   · ?key=<CRON_SECRET>                  — manual runs
//
// DESIGN (doors-email-course.md §7, stateless):
//   · course day = whole IST calendar days since createdAt
//   · day 1–10 → that day's Door; day 11 → completion; else skip
//   · day 0 skips by design — the welcome email already went out
//     immediately at subscribe time (subscribe route, after())
//   · batch cap 150 sends/run — stays well inside provider and
//     cron time limits at the volumes this list will carry for
//     a long time; overflow waits for tomorrow's run
//
// SCHEDULE: vercel.json cron "30 14 * * *" = 20:00 IST daily —
// the publishing hour (doc §1: "consistency beats optimality").
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  computeCourseDay,
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

  const now = new Date();
  const plan = subscribers.map((s) => {
    const day = computeCourseDay(s.createdAt, now);
    return {
      email: s.email,
      day,
      action: day >= 1 && day <= 10 ? `door-${day}` : day === 11 ? "completion" : "skip",
    };
  });

  const dueAll = plan.filter((p) => p.action !== "skip");
  const due = dueAll.slice(0, BATCH_CAP);
  const overflow = Math.max(0, dueAll.length - BATCH_CAP);

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      activeSubscribers: subscribers.length,
      dueToday: dueAll.length,
      overflow,
      plan: dueAll.slice(0, 25),
    });
  }

  const results: { email: string; action: string; ok: boolean; id?: string; error?: string }[] = [];
  for (const item of due) {
    try {
      const res =
        item.action === "completion"
          ? await sendCompletion(item.email)
          : await sendDoorDay(item.email, Number(item.action.replace("door-", "")));
      results.push({ email: item.email, action: item.action, ok: res.ok, id: res.id, error: res.error });
    } catch (err) {
      console.error("[course-send] send threw", item.email, item.action, err);
      results.push({
        email: item.email,
        action: item.action,
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  console.info(
    `[course-send] active=${subscribers.length} due=${due.length} sent=${sent} failed=${failed} overflow=${overflow}`,
  );

  return NextResponse.json({
    ok: true,
    activeSubscribers: subscribers.length,
    due: due.length,
    sent,
    failed,
    overflow,
    ...(process.env.VERCEL !== "1" ? { results } : {}),
  });
}

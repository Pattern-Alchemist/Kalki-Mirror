// =============================================================
// KALKI — Testimonial follow-up cron (Vol. 5 #14, Vercel cron)
// -------------------------------------------------------------
// GET /api/cron/testimonial-followup          → send the t+14d ask
// GET /api/cron/testimonial-followup?dryRun=1 → list due, send nothing
//
// AUTH (mirrors the other crons):
//   · Authorization: Bearer <CRON_SECRET> — attached by Vercel
//   · ?key=<CRON_SECRET>                  — manual runs
//
// THE LOOP: a consultation closes (outcome writer stamps completedAt)
// → +14 days of silence → this cron sends the seeker one honest ask
// ("three sentences, first name only, explicit consent required")
// with a deep-link to their /profile intake form → the archivist's
// approval queue in /admin/testimonials receives the row → the wall
// on /consultations gets its texture. One email per consultation,
// ever (ledger row upserted by the manual nudge).
//
// SCHEDULE: vercel.json "25 2 * * *" — after chain-health (15 2),
// before the digest (30 2), which carries the alarm line.
// SOFT-FAIL: a failed send is a logged miss, not a thrown cron.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import {
  findFollowUpCandidates,
  sendTestimonialFollowUp,
} from "@/lib/ops/testimonial-followup";
import { withCronLedger } from "@/lib/cron-ledger";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  if (header === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("key") === secret;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";

  if (dryRun) {
    const due = await findFollowUpCandidates(50);
    return NextResponse.json({
      ok: true,
      dryRun: true,
      dueCount: due.length,
      due: due.map((c) => ({
        id: c.id,
        name: c.name,
        completedAt: c.completedAt,
        emailDomain: c.email.split("@")[1] ?? "?",
      })),
    });
  }

  const { result: payload } = await withCronLedger("testimonial-followup", async () => {
    const due = await findFollowUpCandidates(20);
    let sent = 0;
    const misses: Array<{ id: string; error: string }> = [];
    for (const c of due) {
      const res = await sendTestimonialFollowUp(c.id, { channel: "cron" });
      if (res.ok) sent += 1;
      else misses.push({ id: c.id, error: res.error ?? res.skipped ?? "unknown" });
    }
    return {
      items: sent,
      payload: NextResponse.json({
        ok: true,
        dueCount: due.length,
        sent,
        misses,
        sentAt: new Date().toISOString(),
      }),
    };
  });
  return payload.payload;
}

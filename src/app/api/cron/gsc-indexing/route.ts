// =============================================================
// KALKI — GSC indexing queue runner (Vol. 5 #12, Vercel cron)
// -------------------------------------------------------------
// GET /api/cron/gsc-indexing          → sync the queue, then submit
//                                       (live when GSC_ACCESS_TOKEN is set,
//                                       honest no-op while OAuth pends)
// GET /api/cron/gsc-indexing?dryRun=1 → report the gate state + queue counts,
//                                       write nothing, submit nothing
//
// AUTH (mirrors the other crons):
//   · Authorization: Bearer <CRON_SECRET> — attached by Vercel
//   · ?key=<CRON_SECRET>                  — manual runs
//
// WHY: GSC OAuth is a founder-gated carry-over. The moment the token
// lands, "which URLs need indexing attention" must already be a panel
// with a queue behind it — this cron keeps the queue warm every night
// (new/changed/removed vs the live sitemap) so OAuth flips the runner
// from honest no-op to live submissions with ZERO new plumbing.
//
// SCHEDULE: vercel.json "40 2 * * *" — after the digest (30 2), alongside
// the other vigilance crons. SOFT-FAIL: every row records its own state;
// the ledger records the run.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import {
  runIndexingSubmission,
  credentialGate,
  readIndexingPanel,
} from "@/lib/seo/indexing-queue";
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
  const gate = credentialGate(process.env);

  if (dryRun) {
    // Read-only posture: the gate verdict plus what the queue already holds.
    // (The full diff plan needs a write pass; dryRun reports gate + counts.)
    const panel = await readIndexingPanel();
    return NextResponse.json({
      ok: true,
      dryRun: true,
      mode: gate.mode,
      gateReason: gate.reason,
      counts: panel.counts,
      pendingSample: panel.pendingSample,
    });
  }

  const { result: payload } = await withCronLedger("gsc-indexing", async () => {
    const result = await runIndexingSubmission();
    return {
      items: result.submitted,
      payload: NextResponse.json({ ok: true, ...result, sentAt: new Date().toISOString() }),
    };
  });
  return payload.payload;
}

// =============================================================
// KALKI — AI chain health probe (Vol. 5 #1, Vercel cron)
// -------------------------------------------------------------
// GET /api/cron/chain-health          → probe every chain model,
//                                       store verdict in OpsState
// GET /api/cron/chain-health?dryRun=1 → report, store nothing
//
// AUTH (mirrors /api/cron/daily-digest):
//   · Authorization: Bearer <CRON_SECRET> — attached by Vercel
//   · ?key=<CRON_SECRET>                  — manual runs
//
// WHY: free-tier chains rot silently (2/3 models 404-delisted
// within 72h in the 2026-09-08 incident). This probe walks EVERY
// model in resolveModelChain() — in parallel, with a real-size
// contract prompt — and stores per-model verdicts + latency in
// OpsState for the war-room panel and the digest alert line.
//
// SCHEDULE: vercel.json "15 2 * * *" — runs before the 30 2
// daily digest so the founder wakes to a fresh verdict.
// SOFT-FAIL: an unconfigured key or a fully dead chain still
// STORES the verdict (that is the point) and returns 200.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  probeChain,
  CHAIN_HEALTH_OPS_KEY,
  type ChainHealthReport,
} from "@/lib/ai/chain-health";
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
  const t0 = Date.now();
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";

  if (dryRun) {
    const report = await probeChain();
    return NextResponse.json({ ok: true, stored: false, dryRun: true, summary: report.summary, models: report.models, checkedAt: report.checkedAt });
  }

  // Vol. 5 #4 — the probe+store IS the cron's work; the ledger observes it.
  const { result: payload } = await withCronLedger("chain-health", async () => {
    let report: ChainHealthReport;
    try {
      report = await probeChain();
    } catch (error) {
      throw new Error(`probe failed: ${String(error).slice(0, 200)}`);
    }
    let stored = true;
    let warning: string | undefined;
    try {
      await db.opsState.upsert({
        where: { key: CHAIN_HEALTH_OPS_KEY },
        update: { value: JSON.stringify(report) },
        create: { key: CHAIN_HEALTH_OPS_KEY, value: JSON.stringify(report) },
      });
    } catch (error) {
      stored = false;
      warning = `OpsState write failed: ${String(error).slice(0, 200)}`;
    }
    return {
      items: report.models.length,
      payload: NextResponse.json({
        ok: true,
        stored,
        probeMs: Date.now() - t0,
        summary: report.summary,
        models: report.models.map((m) => ({
          model: m.model,
          ok: m.ok,
          reason: m.reason,
          latencyMs: m.latencyMs,
          status: m.status,
          detail: m.detail,
        })),
        checkedAt: report.checkedAt,
        ...(warning ? { warning } : {}),
      }),
    };
  });
  return payload.payload;
}

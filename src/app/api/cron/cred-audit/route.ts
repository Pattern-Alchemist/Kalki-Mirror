// =============================================================
// KALKI — Credential rotation audit (Vol. 5 #2, Vercel cron)
// -------------------------------------------------------------
// GET /api/cron/cred-audit          → ping every provider cred,
//                                     store verdicts in OpsState
// GET /api/cron/cred-audit?dryRun=1 → report, store nothing
//
// AUTH (mirrors /api/cron/chain-health):
//   · Authorization: Bearer <CRON_SECRET> — attached by Vercel
//   · ?key=<CRON_SECRET>                  — manual runs
//
// WHY: the founder-vault Turso token was rotated server-side
// while production ran on Vercel's copy — nobody noticed until
// a manual probe. This audit pings the SERVER's own credentials
// (Turso, OpenRouter, Resend, Cloudinary) against each
// provider's cheapest verify endpoint, daily, and stores
// last-verified-at + verdict per credential.
//
// SCHEDULE: vercel.json "10 2 * * *" — before chain-health
// (15 2) and the digest (30 2), which carries the alert line.
// SOFT-FAIL: unconfigured or rejected credentials are VERDICTS
// to store, not errors to throw.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  auditCredentials,
  CRED_AUDIT_OPS_KEY,
  type CredAuditReport,
} from "@/lib/ops/cred-audit";

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

  let report: CredAuditReport;
  try {
    report = await auditCredentials();
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: `audit failed: ${String(error).slice(0, 200)}` },
      { status: 500 }
    );
  }

  if (!dryRun) {
    try {
      await db.opsState.upsert({
        where: { key: CRED_AUDIT_OPS_KEY },
        update: { value: JSON.stringify(report) },
        create: { key: CRED_AUDIT_OPS_KEY, value: JSON.stringify(report) },
      });
    } catch (error) {
      return NextResponse.json(
        { ok: true, report, stored: false, warning: `OpsState write failed: ${String(error).slice(0, 200)}` },
        { status: 200 }
      );
    }
  }

  return NextResponse.json({
    ok: true,
    stored: !dryRun,
    auditMs: Date.now() - t0,
    summary: report.summary,
    credentials: report.credentials,
    checkedAt: report.checkedAt,
  });
}

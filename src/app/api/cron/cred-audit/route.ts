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
    const report = await auditCredentials();
    return NextResponse.json({ ok: true, stored: false, dryRun: true, summary: report.summary, credentials: report.credentials, checkedAt: report.checkedAt });
  }

  // Vol. 5 #4 — the audit+store IS the cron's work; the ledger observes it.
  const { result: payload } = await withCronLedger("cred-audit", async () => {
    let report: CredAuditReport;
    try {
      report = await auditCredentials();
    } catch (error) {
      throw new Error(`audit failed: ${String(error).slice(0, 200)}`);
    }
    let stored = true;
    let warning: string | undefined;
    try {
      await db.opsState.upsert({
        where: { key: CRED_AUDIT_OPS_KEY },
        update: { value: JSON.stringify(report) },
        create: { key: CRED_AUDIT_OPS_KEY, value: JSON.stringify(report) },
      });
    } catch (error) {
      stored = false;
      warning = `OpsState write failed: ${String(error).slice(0, 200)}`;
    }
    return {
      items: report.credentials.length,
      payload: NextResponse.json({
        ok: true,
        stored,
        auditMs: Date.now() - t0,
        summary: report.summary,
        credentials: report.credentials,
        checkedAt: report.checkedAt,
        ...(warning ? { warning } : {}),
      }),
    };
  });
  return payload.payload;
}

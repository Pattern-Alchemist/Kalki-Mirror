// =============================================================
// KALKI — drill verdict ingestion (Vol. 6 #3)
// -------------------------------------------------------------
// POST /api/cron/drill-status
//   Authorization: Bearer <CRON_SECRET>  (or ?key=<CRON_SECRET>)
//   {"name":"page-weight","verdict":"pass","source":"gh","details":"28/28"}
//
// The weekly drills workflow (and any local operator) reports drill
// outcomes here; verdicts land in OpsState as drill:<name> rows for
// the war-room panel and the digest's staleness alarm. Ingestion is
// write-only by design — the digest reads OpsState directly.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import {
  DRILLS,
  isDrillName,
  isDrillVerdict,
  storeDrillVerdict,
} from "@/lib/ops/drills";

export const dynamic = "force-dynamic";

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  if (header === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("key") === secret;
}

export async function POST(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const obj = (body ?? {}) as Record<string, unknown>;
  const name = obj.name;
  const verdict = obj.verdict;
  const source = typeof obj.source === "string" && obj.source.trim() ? obj.source.trim().slice(0, 16) : "unknown";
  const details = typeof obj.details === "string" ? obj.details.slice(0, 300) : undefined;

  if (!isDrillName(name)) {
    return NextResponse.json(
      { error: "unknown drill name", allowed: DRILLS },
      { status: 400 },
    );
  }
  if (!isDrillVerdict(verdict)) {
    return NextResponse.json(
      { error: "verdict must be 'pass' or 'fail'" },
      { status: 400 },
    );
  }

  const stored = await storeDrillVerdict({ name, verdict, source, details });
  return NextResponse.json({ ok: true, name: stored.name, verdict: stored.verdict, at: stored.at });
}

export async function GET() {
  return NextResponse.json(
    { error: "POST only — verdicts are write-only here; the war-room and digest read OpsState" },
    { status: 405 },
  );
}

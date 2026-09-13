// =============================================================
// KALKI — drill verdict ingestion (Vol. 6 #3, parseBody'd Vol. 6 #8)
// -------------------------------------------------------------
// POST /api/cron/drill-status
//   Authorization: Bearer <CRON_SECRET>  (or ?key=<CRON_SECRET>)
//   {"name":"page-weight","verdict":"pass","source":"gh","details":"28/28"}
//
// The weekly drills workflow (and any local operator) reports drill
// outcomes here; verdicts land in OpsState as drill:<name> rows for
// the war-room panel and the digest's staleness alarm. Ingestion is
// write-only by design — the digest reads OpsState directly.
//
// Vol. 6 #8 — body parsing now goes through parseBody + a zod schema.
// Every shape failure becomes a typed 400 with the issue list, never
// an unhandled throw. The schema is mirrored in openapi.yaml under
// components.schemas.DrillVerdictIngest.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  DRILLS,
  isDrillName,
  isDrillVerdict,
  storeDrillVerdict,
} from "@/lib/ops/drills";
import { parseBody } from "@/lib/api/parse-body";

export const dynamic = "force-dynamic";

// The body schema — mirrored in openapi.yaml components.schemas.DrillVerdictIngest
const drillVerdictBodySchema = z.object({
  name: z.string().min(1).max(40),
  verdict: z.enum(["pass", "fail"]),
  source: z.string().trim().min(1).max(16).default("unknown"),
  details: z.string().max(300).optional(),
});

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

  const r = await parseBody(request, drillVerdictBodySchema);
  if (!r.ok) return r.res;
  const { name, verdict, source, details } = r.data;

  if (!isDrillName(name)) {
    return NextResponse.json(
      { error: "unknown drill name", allowed: DRILLS },
      { status: 400 },
    );
  }
  if (!isDrillVerdict(verdict)) {
    // zod enum already enforced, but the type guard stays defensive
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

// =============================================================
// KALKI — Abandoned-intake recovery (Tier-5 #2)
// -------------------------------------------------------------
// POST /api/initiate/draft
//
// The wizard's last step — name + WhatsApp typed but SEND never
// pressed — used to evaporate. The client now fires a debounced,
// fire-and-forget snapshot here on every step transition once a
// contact channel exists. This endpoint upserts one OPEN row per
// WhatsApp number into the DraftLead ledger; the daily digest and
// the archivist's follow-up are the only readers. A real submit
// (server action submitConsultation) flips matching rows CONVERTED.
//
// AUTH: none (anonymous seeker) — behind the shared IP rate limiter,
// payload capped hard, no PII beyond what the seeker typed themselves.
// SOFT-FAIL: any storage error returns 200 ok:false — a failed draft
// save must never disturb the seeker's flow.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getClientIp } from "@/lib/api-auth";
import { draftRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const draftSchema = z.object({
  name: z.string().max(120).optional().default(""),
  phone: z.string().min(7, "phone too short").max(30, "phone too long"),
  step: z.number().int().min(1).max(10).optional().default(0),
  payload: z.string().max(4000).optional().default("{}"),
});

/** Digits-only normalization — the dedup key mirrors the lead pipeline. */
function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { limited } = await draftRateLimit(ip);
  if (limited) {
    return NextResponse.json(
      { ok: false, error: "Too many requests." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const parsed = draftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "invalid payload" },
      { status: 400 },
    );
  }

  const phone = normalizePhone(parsed.data.phone);
  if (phone.length < 7) {
    // No usable recovery channel — nothing to persist, not an error.
    return NextResponse.json({ ok: true, saved: false, reason: "no-contact-channel" });
  }

  const name = parsed.data.name.trim().slice(0, 120);
  const step = parsed.data.step;
  const payload = parsed.data.payload;

  try {
    const existing = await db.draftLead.findFirst({
      where: { phone, status: "OPEN" },
      select: { id: true },
      orderBy: { updatedAt: "desc" },
    });

    if (existing) {
      await db.draftLead.update({
        where: { id: existing.id },
        data: { name, step, payload, resumedAt: new Date() },
      });
      return NextResponse.json({ ok: true, saved: true, resumed: true });
    }

    await db.draftLead.create({ data: { name, phone, step, payload } });
    return NextResponse.json({ ok: true, saved: true, resumed: false });
  } catch (err) {
    console.error("[initiate/draft] storage failed", err);
    // Soft-fail: the seeker's flow is never disturbed by a draft problem.
    return NextResponse.json({ ok: true, saved: false });
  }
}

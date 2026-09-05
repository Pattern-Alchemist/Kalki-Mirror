// =============================================================
// KALKI — Daily ops digest (Tier-1 ⑤, Vercel cron)
// -------------------------------------------------------------
// GET /api/cron/daily-digest          → email the founder the last 24h
// GET /api/cron/daily-digest?dryRun=1 → report, send nothing
//
// AUTH (mirrors /api/cron/course-send):
//   · Authorization: Bearer <CRON_SECRET> — attached by Vercel
//   · ?key=<CRON_SECRET>                  — manual runs
//
// CONTENT (the founder reads email before the console):
//   · Consultation leads (24h): count + newest with source attribution
//   · Payment ledger: CLAIMED awaiting reconciliation, PAID (24h)
//   · Subscribers: new (24h) + total active + doors due today
//   · Console: unread bell notifications
//
// SCHEDULE: vercel.json "30 2 * * *" = 08:00 IST daily.
// SOFT-FAIL: missing RESEND_API_KEY / DIGEST recipient → skipped, not thrown.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/resend";
import { computeCourseDay } from "@/lib/emails/course-send";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  if (header === `Bearer ${secret}`) return true;
  return request.nextUrl.searchParams.get("key") === secret;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json(
      { error: "unauthorized", hint: "Vercel cron bearer token or ?key=<CRON_SECRET>" },
      { status: 401 },
    );
  }

  const dryRun = request.nextUrl.searchParams.get("dryRun") === "1";
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // ── Gather (each block fails soft — a digest is never all-or-nothing) ──
  let leads24h: Array<{ name: string; country: string | null; utmSource: string | null; utmCampaign: string | null; createdAt: Date; paymentState: string; paymentSession: string | null }> = [];
  let claimed = 0;
  let paid24h = 0;
  let newSubs = 0;
  let activeSubs = 0;
  let unreadBell = 0;
  let doorsDue = 0;
  let totalLeads = 0;
  let openDrafts = 0;
  let touchedDrafts24h = 0;
  let recentDrafts: Array<{ name: string; phone: string; step: number; updatedAt: Date }> = [];

  try {
    const [leads, claimAgg, paidAgg, totalAgg] = await Promise.all([
      db.consultation.findMany({
        where: { createdAt: { gte: since } },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { name: true, country: true, utmSource: true, utmCampaign: true, createdAt: true, paymentState: true, paymentSession: true },
      }),
      db.consultation.count({ where: { paymentState: "CLAIMED" } }),
      db.consultation.count({ where: { paymentState: "PAID", paidAt: { gte: since } } }),
      db.consultation.count(),
    ]);
    leads24h = leads;
    claimed = claimAgg;
    paid24h = paidAgg;
    totalLeads = totalAgg;
  } catch (err) {
    console.error("[daily-digest] consultation block failed", err);
  }

  try {
    const [newAgg, activeAgg, subs] = await Promise.all([
      db.emailSubscriber.count({ where: { createdAt: { gte: since } } }),
      db.emailSubscriber.count({ where: { status: "active" } }),
      db.emailSubscriber.findMany({
        where: { status: "active" },
        select: { email: true, createdAt: true },
        orderBy: { createdAt: "asc" },
        take: 500,
      }),
    ]);
    newSubs = newAgg;
    activeSubs = activeAgg;
    doorsDue = subs.filter((s) => {
      const day = computeCourseDay(s.createdAt, new Date());
      return day >= 1 && day <= 11;
    }).length;
  } catch (err) {
    console.error("[daily-digest] subscriber block failed", err);
  }

  try {
    unreadBell = await db.adminNotification.count({ where: { read: false } });
  } catch (err) {
    console.error("[daily-digest] bell block failed", err);
  }

  // Tier-5 #2 — abandoned-intake recovery ledger. OPEN drafts are seekers
  // who typed their WhatsApp number but never pressed send; the archivist
  // can re-open the conversation with a single first-touch message.
  try {
    const [openAgg, touchedAgg, drafts] = await Promise.all([
      db.draftLead.count({ where: { status: "OPEN" } }),
      db.draftLead.count({ where: { status: "OPEN", updatedAt: { gte: since } } }),
      db.draftLead.findMany({
        where: { status: "OPEN" },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { name: true, phone: true, step: true, updatedAt: true },
      }),
    ]);
    openDrafts = openAgg;
    touchedDrafts24h = touchedAgg;
    recentDrafts = drafts;
  } catch (err) {
    console.error("[daily-digest] draft block failed", err);
  }

  const nowIst = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const subject = `KALKI daily digest — ${leads24h.length > 0 ? `${leads24h.length}+ new lead${leads24h.length === 1 ? "" : "s"}` : "quiet night"} · ${claimed} claim${claimed === 1 ? "" : "s"} pending`;

  const lines: string[] = [
    `Window: last 24h · generated ${nowIst} IST`,
    "",
    `— LEADS —`,
    `${leads24h.length} new in window (total ${totalLeads})`,
    ...leads24h.map((l) => {
      const src = [l.utmSource, l.utmCampaign].filter(Boolean).join(" · ") || "direct";
      const pay = l.paymentState !== "UNPAID" ? ` · payment: ${l.paymentState.toLowerCase()}${l.paymentSession ? ` (${l.paymentSession})` : ""}` : "";
      return `  · ${l.name}${l.country ? ` (${l.country})` : ""} — ${src} — ${new Date(l.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}${pay}`;
    }),
    "",
    `— PAYMENT LEDGER —`,
    `${claimed} CLAIMED awaiting UTR reconciliation · ${paid24h} marked PAID in window`,
    "",
    `— 10 DOORS —`,
    `${newSubs} new subscribers (24h) · ${activeSubs} active · ${doorsDue} due a door today`,
    "",
    `— ABANDONED INTAKES —`,
    `${openDrafts} open draft${openDrafts === 1 ? "" : "s"} · ${touchedDrafts24h} touched in window${openDrafts > 0 ? " — recovery: WhatsApp first-touch on the newest" : ""}`,
    ...recentDrafts.map((d) => {
      const who = d.name || "(name not typed yet)";
      return `  · ${who} — step ${d.step} — last touched ${new Date(d.updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} — ${d.phone}`;
    }),
    "",
    `— CONSOLE —`,
    `${unreadBell} unread bell notification${unreadBell === 1 ? "" : "s"}`,
    "",
    "— the Admin OS",
  ];

  if (dryRun) {
    return NextResponse.json({
      ok: true,
      dryRun: true,
      leads24h: leads24h.length,
      claimed,
      paid24h,
      newSubs,
      activeSubs,
      doorsDue,
      unreadBell,
      openDrafts,
      touchedDrafts24h,
      preview: lines.join("\n"),
    });
  }

  const to = process.env.DIGEST_TO ?? "doors@astrokalki.com";
  const html = `<div style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:13px;line-height:1.6;color:#e4e4e7;background:#09090b;padding:24px;white-space:pre-wrap">${esc(lines.join("\n"))}</div>`;

  const res = await sendEmail({ to, subject, html, text: lines.join("\n") });
  if (!res.ok) {
    return NextResponse.json({ ok: false, error: res.error ?? "send failed", skipped: res.skipped ?? false }, { status: res.skipped ? 200 : 502 });
  }
  return NextResponse.json({ ok: true, to, subject });
}

// =============================================================
// KALKI — 10 Doors: unsubscribe endpoint
// -------------------------------------------------------------
// GET  /api/email-course/unsubscribe?e=<email>&t=<hmac-token>
//        Signed-link unsubscribe (footer links). Renders a tiny
//        branded "door closed" page — no app shell, instant.
//
// POST /api/email-course/unsubscribe  (List-Unsubscribe=One-Click)
//        RFC 8058 one-click — Gmail/Outlook unsubscribe button
//        posts form-encoded `e` + `t` (same params). Returns 200
//        per spec; the mail provider handles the UI.
//
// AUTH MODEL: the HMAC token IS the auth (derived from the
// platform auth secret; timing-safe compare). No session needed —
// unsubscribes must work from any inbox, on any device, forever.
//
// Semantics: status → 'unsubscribed'. Attribution is never
// touched; re-subscribe via the normal capture surfaces
// re-activates (subscribe route) without resending the welcome.
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyUnsubToken } from "@/lib/emails/course-unsubscribe";

export const dynamic = "force-dynamic";

const CLOSED_PAGE = (email: string) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Door closed — AstroKalki</title></head>
<body style="margin:0;padding:0;background:#0d0b09;font-family:Georgia,serif;">
<div style="max-width:560px;margin:0 auto;padding:64px 24px;color:#e8e0d4;text-align:center;">
<p style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#a89880;margin:0 0 24px;">AstroKalki · The 10 Doors</p>
<h1 style="font-size:26px;color:#f2ead9;margin:0 0 16px;">The door is closed.</h1>
<p style="font-size:16px;line-height:1.7;color:#a89880;margin:0 0 8px;">No further Doors will arrive for<br><strong style="color:#e8e0d4;">${email}</strong></p>
<p style="font-size:14px;line-height:1.7;color:#6b6154;margin:24px 0 0;">The archive stays open at astrokalki.com — walk in any time.</p>
</div></body></html>`;

async function unsubscribe(params: URLSearchParams): Promise<NextResponse> {
  const email = (params.get("e") ?? "").trim().toLowerCase();
  const token = params.get("t") ?? "";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });
  }
  if (!verifyUnsubToken(email, token)) {
    return NextResponse.json({ ok: false, error: "invalid token" }, { status: 403 });
  }

  try {
    const res = await db.emailSubscriber.updateMany({
      where: { email },
      data: { status: "unsubscribed" },
    });
    if (res.count === 0) {
      // Unknown email — respond OK anyway (no enumeration).
      return NextResponse.redirect(new URL("/?unsub=0", process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.astrokalki.com"), 302);
    }
  } catch (err) {
    console.error("[email-course] unsubscribe db failed", err);
    return NextResponse.json({ ok: false, error: "try again shortly" }, { status: 500 });
  }

  console.info("[email-course] unsubscribed:", email.replace(/(.{2}).*(@.*)/, "$1***$2"));
  return new NextResponse(CLOSED_PAGE(email), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  return unsubscribe(request.nextUrl.searchParams);
}

export async function POST(request: NextRequest) {
  // RFC 8058 one-click: form-encoded body, e.g. "e=...&t=..."
  let params: URLSearchParams;
  try {
    params = new URLSearchParams(await request.text());
  } catch {
    return NextResponse.json({ ok: false, error: "invalid body" }, { status: 400 });
  }
  return unsubscribe(params);
}

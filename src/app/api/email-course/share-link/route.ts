import { NextRequest, NextResponse } from "next/server";
import { shareUrl } from "@/lib/emails/course-share";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (arr.length >= RATE_LIMIT) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return false;
}

/**
 * Vol. 2 #18 — personal share-link minting for the success screen.
 * The token is a namespaced HMAC over the subscriber's email; only the
 * server holds the secret, so the client asks for the URL after signup.
 * Does NOT verify the email is subscribed — the link is inert unless a
 * real subscriber's token matches at credit time; leaking your own share
 * URL is exactly its purpose.
 */
export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests." }, { status: 429 });
  }

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: "Valid email required." }, { status: 400 });
  }

  return NextResponse.json({ ok: true, url: shareUrl(email) });
}

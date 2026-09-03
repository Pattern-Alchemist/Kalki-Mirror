// =============================================================
// KALKI — 10 Doors: unsubscribe signing + RFC 8058 one-click headers
// -------------------------------------------------------------
// Signed-link unsubscribe with ZERO schema changes: the link
// carries the subscriber email + HMAC token. The token derives
// from the platform auth secret (auth-secret.ts — already the
// single source of trust for session signing).
//
// One-click (Gmail/Outlook unsubscribe button) uses the same URL
// via List-Unsubscribe + List-Unsubscribe-Post headers (doc §6:
// "one-click unsubscribe in every footer — mandatory once sending
// is automated" — this is that automation).
// =============================================================

import { createHmac, timingSafeEqual } from "node:crypto";
import { tryGetAuthSecret } from "@/lib/auth-secret";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.astrokalki.com";

/** Deterministic per-email token — stable across sends, invalid without the secret. */
export function signUnsubToken(email: string): string {
  const secret = tryGetAuthSecret() ?? "kalki-unsub-unsigned-dev";
  return createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("base64url").slice(0, 32);
}

export function verifyUnsubToken(email: string, token: string): boolean {
  if (!token || !email) return false;
  const expected = signUnsubToken(email);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Signed unsubscribe URL for a subscriber (footer links + List-Unsubscribe). */
export function unsubscribeUrl(email: string): string {
  const e = encodeURIComponent(email.trim().toLowerCase());
  return `${SITE}/api/email-course/unsubscribe?e=${e}&t=${signUnsubToken(email)}`;
}

/** RFC 8058 — Gmail/Outlook render their own one-click control from these. */
export function unsubHeaders(email: string): Record<string, string> {
  return {
    "List-Unsubscribe": `<${unsubscribeUrl(email)}>, <mailto:doors@astrokalki.com?subject=stop>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}

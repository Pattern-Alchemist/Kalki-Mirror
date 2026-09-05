// =============================================================
// KALKI — 10 Doors: personal share links (Vol. 2 #18)
// -------------------------------------------------------------
// Every subscriber gets a share link that credits them when a
// newcomer subscribes through it:  /email-course?ref=<token>
// The token is a NAMESPACED HMAC over the referrer's email —
// same secret family as the unsubscribe token but a different
// derivation, so a published share link never leaks the
// unsubscribe capability (defense in depth: distinct capabilities
// must never share a token).
//
// Crediting is computed at read time: the digest re-derives every
// active subscriber's token and counts newcomers whose
// referredByToken matches. No join table, and the token alone
// proves nothing to anyone without the platform secret.
// =============================================================

import { createHmac, timingSafeEqual } from "node:crypto";
import { tryGetAuthSecret } from "@/lib/auth-secret";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.astrokalki.com";

/** Deterministic per-email share token — stable across sends, distinct from the unsubscribe token. */
export function signShareToken(email: string): string {
  const secret = tryGetAuthSecret() ?? "kalki-unsub-unsigned-dev";
  return createHmac("sha256", secret).update("share:" + email.trim().toLowerCase()).digest("base64url").slice(0, 32);
}

/** Personal share URL for a subscriber. */
export function shareUrl(email: string): string {
  return `${SITE}/email-course?ref=${signShareToken(email)}`;
}

/** Referral tokens are opaque base64url, ≤64 chars — validated before storage. */
export function isValidRefToken(token: string | null | undefined): boolean {
  return !!token && /^[A-Za-z0-9_-]{8,64}$/.test(token);
}

export interface ReferrerRow {
  email: string;
  referredByToken: string | null;
  /** Optional subscriber status — when present, non-active rows never enter the referrer pool. */
  status?: string;
}

/**
 * Top referrers from subscriber rows: re-derive each ACTIVE subscriber's
 * token (the referrer pool), count newcomers carrying it. O(n) with n =
 * subscribers; the returned emails are the CREDITED referrers (active
 * subscribers themselves, so the list never contains strangers).
 * Ties broken alphabetically for stable digests.
 */
export function computeTopReferrers(
  rows: ReferrerRow[],
  limit = 3,
): Array<{ email: string; referrals: number }> {
  const pool = new Map<string, string>(); // token → referrer email (active)
  for (const r of rows) {
    if (r.status !== undefined && r.status !== "active") continue;
    pool.set(signShareToken(r.email), r.email);
  }

  const counts = new Map<string, number>();
  for (const r of rows) {
    if (!r.referredByToken) continue;
    const referrer = pool.get(r.referredByToken);
    if (!referrer) continue; // stale/unknown token — never counted
    counts.set(referrer, (counts.get(referrer) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, n]) => n > 0)
    .map(([email, referrals]) => ({ email, referrals }))
    .sort((a, b) => b.referrals - a.referrals || a.email.localeCompare(b.email))
    .slice(0, limit);
}

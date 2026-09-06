/* =============================================================
   KALKI — PRIVACY ACTION TOKENS (Vol. 3 #12, DPDP posture)
   Signed, expiring, single-purpose tokens for the member
   self-service endpoints (data export confirmation, account
   deletion confirmation). The token proves "the server minted
   this for THIS user and THIS action within the TTL" — it is
   what turns a destructive endpoint into a confirmed one.

   Secret derivation: HMAC(NEXTAUTH_SECRET-or-DATA_TOKEN_SECRET,
   "kalki-data-tokens"). Deriving a context-specific key from the
   app secret means the unsubscribe-token domain and this domain
   can never cross-verify even if a token leaks between them.

   Fail-closed: any parse/verify error → invalid. Expired,
   wrong action, wrong user, tampered payload — all rejected.
   ============================================================= */

import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_CONTEXT = "kalki-data-tokens";
export const DELETE_ACTION = "account-delete";
export const EXPORT_ACTION = "data-export";
export const DEFAULT_TTL_MS = 15 * 60 * 1000; // 15 minutes

function dataSecret(): string {
  const base = process.env.DATA_TOKEN_SECRET || process.env.NEXTAUTH_SECRET;
  if (!base) throw new Error("[privacy] no token secret configured");
  return createHmac("sha256", base).update(TOKEN_CONTEXT).digest("hex");
}

/**
 * Mint a signed action token: payload(action|userId|expiry) + HMAC.
 * Base64url throughout — safe in URLs, forms and JSON bodies.
 */
export function signActionToken(
  userId: string,
  action: string,
  ttlMs: number = DEFAULT_TTL_MS,
  now: number = Date.now()
): string {
  const exp = now + ttlMs;
  const body = `${action}|${userId}|${exp}`;
  const sig = createHmac("sha256", dataSecret()).update(body).digest("base64url");
  return `${Buffer.from(body).toString("base64url")}.${sig}`;
}

/**
 * Verify a signed action token for an exact (action, userId) pair.
 * Returns the remaining validity in ms on success, null on any failure.
 */
export function verifyActionToken(
  token: unknown,
  action: string,
  userId: string,
  now: number = Date.now()
): number | null {
  try {
    if (typeof token !== "string" || token.length === 0 || token.length > 512) return null;
    const dot = token.indexOf(".");
    if (dot === -1) return null;
    const bodyB64 = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const body = Buffer.from(bodyB64, "base64url").toString("utf8");
    const parts = body.split("|");
    if (parts.length !== 3) return null;
    const [tokAction, tokUser, expRaw] = parts;
    const expectedSig = createHmac("sha256", dataSecret())
      .update(body)
      .digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expectedSig);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    if (tokAction !== action || tokUser !== userId) return null;
    const exp = Number(expRaw);
    if (!Number.isFinite(exp) || exp <= now) return null;
    return exp - now;
  } catch {
    return null;
  }
}

/**
 * Strip credential material from a User row before it lands in
 * an export payload. passwordHash / TOTP secret / backup codes
   are authentication state, not seeker data — they never leave
   the server under any circumstances.
 */
export function redactUser<T extends Record<string, unknown>>(user: T): Omit<
  T,
  "passwordHash" | "twoFactorSecret" | "twoFactorBackupCodes"
> {
  const {
    passwordHash: _p,
    twoFactorSecret: _s,
    twoFactorBackupCodes: _b,
    ...rest
  } = user;
  return rest;
}

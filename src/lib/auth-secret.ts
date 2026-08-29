/**
 * AUTH SECRET + SESSION COOKIE NAME — single source of truth.
 *
 * NextAuth's getToken()/decode() resolve BOTH the secret and the session
 * cookie name themselves (on HTTPS/Vercel the cookie is prefixed with
 * `__Secure-`). Routes that create or validate sessions outside the
 * [...nextauth] handler MUST derive the same values — this module is that
 * shared derivation, edge-safe (zero imports) so the middleware can use it.
 *
 * G-10 security debt (credential-rotation runbook): the VERCEL-only secret
 * fallback exists so production keeps working until NEXTAUTH_SECRET is set
 * as a real env var. Rotate, then remove the fallback.
 */

export const NEXTAUTH_SECRET_FALLBACK = 'qhMa86hvsUKGlY8JM3Kej0FAaq9uTZRCGqsL7LUxRJ8=';

/** Resolve the NextAuth JWT secret. Throws when it cannot be resolved. */
export function getAuthSecret(): string {
  const s =
    process.env.NEXTAUTH_SECRET ||
    (process.env.VERCEL === '1' ? NEXTAUTH_SECRET_FALLBACK : '');
  if (!s) {
    throw new Error('NEXTAUTH_SECRET is not set.');
  }
  return s;
}

/** Never-throws variant for call sites that treat "no secret" as unauthenticated. */
export function tryGetAuthSecret(): string | undefined {
  try {
    return getAuthSecret();
  } catch {
    return undefined;
  }
}

/**
 * The session cookie name NextAuth's getToken() will look for, given the
 * request URL. Mirrors next-auth v4: secure context (HTTPS or Vercel) uses
 * the `__Secure-` prefixed name.
 */
export function sessionCookieName(requestUrl: string): string {
  const secure = process.env.VERCEL === '1' || requestUrl.startsWith('https:');
  return secure ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
}

/** Whether the session cookie should carry the Secure attribute. */
export function sessionCookieSecure(requestUrl: string): boolean {
  return process.env.VERCEL === '1' || requestUrl.startsWith('https:');
}

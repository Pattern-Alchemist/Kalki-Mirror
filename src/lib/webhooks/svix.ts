// =============================================================
// KALKI — Svix webhook signature verification (zero deps)
// -------------------------------------------------------------
// Resend signs every webhook with a Svix signing secret
// (whsec_…). Verification per the Svix standard:
//
//   signedContent  = `${svix-id}.${svix-timestamp}.${rawBody}`
//   expectedSig    = base64(HMAC-SHA256(base64decode(secret)), signedContent)
//   svix-signature = "v1,<sig> v1,<sig2> …"   (rotate tolerance)
//
// Replay protection: reject timestamps older than ±5 minutes.
// Timing-safe comparison against every v1 signature offered.
// Pure module — unit-tested in tests/lib/svix.test.ts.
// =============================================================

import crypto from 'crypto';

/** Replay window — Svix's own SDKs use 5 minutes. */
const TOLERANCE_SECONDS = 5 * 60;

export interface SvixHeaders {
  id: string | null;
  timestamp: string | null;
  signature: string | null;
}

/**
 * Verify a Svix-signed webhook request.
 * @param secret raw signing secret incl. the `whsec_` prefix
 * @returns true when at least one v1 signature matches and the
 *          timestamp is inside the tolerance window.
 */
export function verifySvixSignature(
  headers: SvixHeaders,
  rawBody: string,
  secret: string | undefined,
): boolean {
  if (!secret) return false;
  const { id, timestamp, signature } = headers;
  if (!id || !timestamp || !signature) return false;

  // Timestamp tolerance — replay protection.
  const ts = Number(timestamp);
  if (!Number.isFinite(ts)) return false;
  if (Math.abs(Date.now() / 1000 - ts) > TOLERANCE_SECONDS) return false;

  let secretBytes: Buffer;
  try {
    secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  } catch {
    return false;
  }

  const signedContent = `${id}.${timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secretBytes)
    .update(signedContent)
    .digest('base64');

  const expectedBuf = Buffer.from(expected, 'utf8');
  return signature
    .split(' ')
    .map((s) => s.replace(/^v1,/, ''))
    .filter(Boolean)
    .some((sig) => {
      const sigBuf = Buffer.from(sig, 'utf8');
      return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
    });
}

/** Test/ops helper — produce a valid Svix signature header for a payload. */
export function signSvixPayload(
  id: string,
  timestampSeconds: number,
  rawBody: string,
  secret: string,
): string {
  const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = crypto
    .createHmac('sha256', secretBytes)
    .update(`${id}.${timestampSeconds}.${rawBody}`)
    .digest('base64');
  return `v1,${expected}`;
}

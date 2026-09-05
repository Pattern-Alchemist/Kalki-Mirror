import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  verifySvixSignature,
  signSvixPayload,
} from '@/lib/webhooks/svix';

/** Fresh 32-byte secret, base64, whsec_-prefixed — same shape Resend issues. */
function makeSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('base64')}`;
}

describe('svix signature verification', () => {
  const rawBody = JSON.stringify({
    type: 'email.opened',
    created_at: new Date().toISOString(),
    data: { email_id: 'test-id-1', from: 'doors@astrokalki.com', to: ['seeker@example.com'] },
  });
  const secret = makeSecret();
  const id = 'msg_test_0001';
  const ts = Math.floor(Date.now() / 1000);

  it('accepts a correctly signed payload', () => {
    const signature = signSvixPayload(id, ts, rawBody, secret);
    expect(verifySvixSignature({ id, timestamp: String(ts), signature }, rawBody, secret)).toBe(
      true,
    );
  });

  it('accepts multiple signatures in the header (rotation tolerance)', () => {
    const good = signSvixPayload(id, ts, rawBody, secret);
    const stale = `v1,${crypto.randomBytes(24).toString('base64')}`;
    expect(
      verifySvixSignature({ id, timestamp: String(ts), signature: `${stale} ${good}` }, rawBody, secret),
    ).toBe(true);
  });

  it('rejects a tampered body', () => {
    const signature = signSvixPayload(id, ts, rawBody, secret);
    const tampered = rawBody.replace('email.opened', 'email.clicked');
    expect(
      verifySvixSignature({ id, timestamp: String(ts), signature }, tampered, secret),
    ).toBe(false);
  });

  it('rejects a wrong secret', () => {
    const signature = signSvixPayload(id, ts, rawBody, secret);
    expect(
      verifySvixSignature({ id, timestamp: String(ts), signature }, rawBody, makeSecret()),
    ).toBe(false);
  });

  it('rejects replayed timestamps outside the tolerance window', () => {
    const oldTs = ts - 6 * 60;
    const signature = signSvixPayload(id, oldTs, rawBody, secret);
    expect(
      verifySvixSignature({ id, timestamp: String(oldTs), signature }, rawBody, secret),
    ).toBe(false);
  });

  it('rejects missing headers or missing secret', () => {
    const signature = signSvixPayload(id, ts, rawBody, secret);
    expect(verifySvixSignature({ id: null, timestamp: String(ts), signature }, rawBody, secret)).toBe(false);
    expect(verifySvixSignature({ id, timestamp: null, signature }, rawBody, secret)).toBe(false);
    expect(verifySvixSignature({ id, timestamp: String(ts), signature: null }, rawBody, secret)).toBe(false);
    expect(verifySvixSignature({ id, timestamp: String(ts), signature }, rawBody, undefined)).toBe(false);
  });

  it('rejects non-numeric timestamps', () => {
    expect(
      verifySvixSignature(
        { id, timestamp: 'not-a-number', signature: signSvixPayload(id, ts, rawBody, secret) },
        rawBody,
        secret,
      ),
    ).toBe(false);
  });
});

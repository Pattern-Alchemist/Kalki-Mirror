import { describe, it, expect } from 'vitest';
import {
  signShareToken,
  isValidRefToken,
  computeTopReferrers,
} from '@/lib/emails/course-share';
import { signUnsubToken } from '@/lib/emails/course-unsubscribe';

/* ══════════════════════════════════════════════════════════════
   Vol. 2 #18 — referral share links (namespaced HMAC)
   ══════════════════════════════════════════════════════════════ */

describe('signShareToken', () => {
  it('is deterministic and case-insensitive on email', () => {
    expect(signShareToken('Seeker@Example.com')).toBe(signShareToken('seeker@example.com'));
  });

  it('NEVER equals the unsubscribe token — distinct capabilities must not share a token', () => {
    // Publishing a share link must not leak the unsubscribe capability.
    expect(signShareToken('seeker@example.com')).not.toBe(signUnsubToken('seeker@example.com'));
  });
});

describe('isValidRefToken', () => {
  it('accepts base64url-shaped tokens of 8–64 chars', () => {
    expect(isValidRefToken('AbC-123_-xyz')).toBe(true);
    expect(isValidRefToken('a'.repeat(8))).toBe(true);
    expect(isValidRefToken('a'.repeat(64))).toBe(true);
  });

  it('rejects junk that could smuggle URLs/SQL/oversized payloads', () => {
    expect(isValidRefToken('')).toBe(false);
    expect(isValidRefToken(null)).toBe(false);
    expect(isValidRefToken('short')).toBe(false);            // < 8 chars
    expect(isValidRefToken('a'.repeat(65))).toBe(false);     // > 64
    expect(isValidRefToken('has space')).toBe(false);
    expect(isValidRefToken("'; DROP TABLE x;--")).toBe(false);
  });
});

describe('computeTopReferrers', () => {
  const a = signShareToken('a@example.com');
  const b = signShareToken('b@example.com');

  it('credits referrers whose tokens newcomers carry, ranked', () => {
    const rows = [
      { email: 'a@example.com', referredByToken: null, status: 'active' },
      { email: 'b@example.com', referredByToken: null, status: 'active' },
      { email: 'n1@example.com', referredByToken: a, status: 'active' },
      { email: 'n2@example.com', referredByToken: a, status: 'active' },
      { email: 'n3@example.com', referredByToken: b, status: 'active' },
    ];
    expect(computeTopReferrers(rows)).toEqual([
      { email: 'a@example.com', referrals: 2 },
      { email: 'b@example.com', referrals: 1 },
    ]);
  });

  it('never lets a non-active subscriber enter the referrer pool', () => {
    const rows = [
      { email: 'gone@example.com', referredByToken: null, status: 'unsubscribed' },
      { email: 'n1@example.com', referredByToken: signShareToken('gone@example.com'), status: 'active' },
    ];
    expect(computeTopReferrers(rows)).toEqual([]);
  });

  it('ignores stale/unknown tokens (e.g. from rotated secrets)', () => {
    const rows = [
      { email: 'a@example.com', referredByToken: null, status: 'active' },
      { email: 'n1@example.com', referredByToken: 'stale-token-xyz', status: 'active' },
    ];
    expect(computeTopReferrers(rows)).toEqual([]);
  });

  it('breaks ties alphabetically for stable digests', () => {
    const bb = 'b@example.com';
    const aa = 'a@example.com';
    const rows = [
      { email: bb, referredByToken: null, status: 'active' },
      { email: aa, referredByToken: null, status: 'active' },
      { email: 'n1@example.com', referredByToken: signShareToken(bb), status: 'active' },
      { email: 'n2@example.com', referredByToken: signShareToken(aa), status: 'active' },
    ];
    expect(computeTopReferrers(rows).map((r) => r.email)).toEqual([aa, bb]);
  });

  it('is safe on empty input', () => {
    expect(computeTopReferrers([])).toEqual([]);
  });
});

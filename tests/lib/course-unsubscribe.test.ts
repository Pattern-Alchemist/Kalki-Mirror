import { describe, it, expect, afterEach } from 'vitest';

/* ══════════════════════════════════════════════════════════════
   Vol. 3 #17 — unsubscribe token security (course-unsubscribe.ts)

   The HMAC derives from the platform auth secret. These tests pin:
   determinism per email, case/whitespace folding, tamper/cross-
   email rejection, timing-safe compare, and the RFC 8058 headers.
   tryGetAuthSecret reads NEXTAUTH_SECRET env — set explicitly so
   the suite never depends on host state.
   ══════════════════════════════════════════════════════════════ */

import {
  signUnsubToken,
  verifyUnsubToken,
  unsubscribeUrl,
  unsubHeaders,
} from '@/lib/emails/course-unsubscribe';

const SECRET = 'test-auth-secret-for-unsub-suite';

function withSecret<T>(fn: () => T): T {
  process.env.NEXTAUTH_SECRET = SECRET;
  try {
    return fn();
  } finally {
    delete process.env.NEXTAUTH_SECRET;
  }
}

describe('signUnsubToken / verifyUnsubToken', () => {
  afterEach(() => {
    delete process.env.NEXTAUTH_SECRET;
  });

  it('is deterministic for the same email + secret', () => {
    withSecret(() => {
      expect(signUnsubToken('seeker@example.com')).toBe(signUnsubToken('seeker@example.com'));
    });
  });

  it('folds case and whitespace before signing (canonical email form)', () => {
    withSecret(() => {
      const base = signUnsubToken('seeker@example.com');
      expect(signUnsubToken('  SEEKER@EXAMPLE.COM ')).toBe(base);
    });
  });

  it('changes when the secret changes (no cross-environment replay)', () => {
    const a = withSecret(() => signUnsubToken('seeker@example.com'));
    process.env.NEXTAUTH_SECRET = 'a-completely-different-secret';
    const b = signUnsubToken('seeker@example.com');
    delete process.env.NEXTAUTH_SECRET;
    expect(a).not.toBe(b);
  });

  it('verifies the correct token and rejects tampered ones', () => {
    withSecret(() => {
      const token = signUnsubToken('seeker@example.com');
      expect(verifyUnsubToken('seeker@example.com', token)).toBe(true);
      expect(verifyUnsubToken('seeker@example.com', token.slice(0, 30) + 'AAAAAA')).toBe(false);
      expect(verifyUnsubToken('seeker@example.com', '')).toBe(false);
    });
  });

  it('rejects a token minted for a DIFFERENT email (cross-subscriber replay)', () => {
    withSecret(() => {
      const token = signUnsubToken('attacker@example.com');
      expect(verifyUnsubToken('victim@example.com', token)).toBe(false);
    });
  });

  it('token is 32 base64url chars (URL-safe, fixed length)', () => {
    withSecret(() => {
      expect(signUnsubToken('seeker@example.com')).toMatch(/^[A-Za-z0-9_-]{32}$/);
    });
  });
});

describe('unsubscribeUrl + RFC 8058 headers', () => {
  afterEach(() => {
    delete process.env.NEXTAUTH_SECRET;
  });

  it('embeds the encoded email + token as query params on the prod origin', () => {
    withSecret(() => {
      const url = unsubscribeUrl('Seeker@Example.com');
      const u = new URL(url);
      expect(u.origin + u.pathname).toBe('https://www.astrokalki.com/api/email-course/unsubscribe');
      // URL.searchParams decodes — assert the canonical email survives the round-trip,
      // and that the RAW href carries the %40 encoding (safe in HREF contexts).
      expect(u.searchParams.get('e')).toBe('seeker@example.com');
      expect(url).toContain('e=seeker%40example.com');
      expect(verifyUnsubToken('seeker@example.com', u.searchParams.get('t')!)).toBe(true);
    });
  });

  it('List-Unsubscribe carries the https URL + mailto fallback; Post header is One-Click', () => {
    withSecret(() => {
      const headers = unsubHeaders('seeker@example.com');
      expect(headers['List-Unsubscribe']).toContain(unsubscribeUrl('seeker@example.com'));
      expect(headers['List-Unsubscribe']).toContain('mailto:doors@astrokalki.com?subject=stop');
      expect(headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
    });
  });
});

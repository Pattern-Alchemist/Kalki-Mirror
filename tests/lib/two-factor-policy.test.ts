import { describe, expect, it } from 'vitest';
import {
  twoFactorPolicy,
  TwoFactorRequiredError,
  TWO_FA_GRACE_DAYS,
} from '@/lib/admin/two-factor-policy';

/* ══════════════════════════════════════════════════════════════
   Vol. 2 #12 — 2FA mandatory at elevation, grace-window math.
   Pure policy: requireRole enforces pastDue; the banner nags inGrace.
   ══════════════════════════════════════════════════════════════ */

const NOW = new Date('2026-09-06T10:00:00Z');
const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

describe('twoFactorPolicy', () => {
  it('non-elevated roles are outside the regime regardless of 2FA state', () => {
    for (const role of ['USER', 'REVIEWER', 'EDITOR']) {
      const p = twoFactorPolicy({ role, twoFactorEnabled: false, elevatedAt: daysAgo(30), now: NOW });
      expect(p).toMatchObject({ elevated: false, enrollmentNeeded: false, pastDue: false, deadline: null });
    }
  });

  it('elevated + enrolled → nothing needed', () => {
    const p = twoFactorPolicy({ role: 'SUPERADMIN', twoFactorEnabled: true, elevatedAt: daysAgo(400), now: NOW });
    expect(p).toMatchObject({ elevated: true, enrollmentNeeded: false, inGrace: false, pastDue: false });
  });

  it('elevated + unenrolled + fresh elevation → in grace', () => {
    const p = twoFactorPolicy({ role: 'ADMIN', twoFactorEnabled: false, elevatedAt: daysAgo(2), now: NOW });
    expect(p.enrollmentNeeded).toBe(true);
    expect(p.inGrace).toBe(true);
    expect(p.pastDue).toBe(false);
    expect(p.deadline?.getTime()).toBe(daysAgo(2).getTime() + TWO_FA_GRACE_DAYS * 86_400_000);
  });

  it('grace boundary: day 6.99 in grace, day 7.01 past due', () => {
    const almost = twoFactorPolicy({ role: 'ADMIN', twoFactorEnabled: false, elevatedAt: daysAgo(6.99), now: NOW });
    expect(almost.inGrace).toBe(true);

    const justPast = twoFactorPolicy({ role: 'ADMIN', twoFactorEnabled: false, elevatedAt: daysAgo(7.01), now: NOW });
    expect(justPast.pastDue).toBe(true);
  });

  it('null elevatedAt on an unenrolled elevated user is past due (strictest reading)', () => {
    const p = twoFactorPolicy({ role: 'ADMIN', twoFactorEnabled: false, elevatedAt: null, now: NOW });
    expect(p.pastDue).toBe(true);
    expect(p.inGrace).toBe(false);
    expect(p.deadline).toBeNull();
  });

  it('both elevated roles behave identically', () => {
    for (const role of ['ADMIN', 'SUPERADMIN']) {
      const p = twoFactorPolicy({ role, twoFactorEnabled: false, elevatedAt: daysAgo(10), now: NOW });
      expect(p.pastDue).toBe(true);
    }
  });
});

describe('TwoFactorRequiredError', () => {
  it('carries the deadline and actionable instruction', () => {
    const dl = daysAgo(1);
    const err = new TwoFactorRequiredError(dl);
    expect(err.code).toBe('2FA_REQUIRED');
    expect(err.message).toContain('2FA enrollment required');
    expect(err.message).toContain('/admin/settings');
    expect(err.deadline).toBe(dl);
  });

  it('survives without a deadline (null elevatedAt path)', () => {
    const err = new TwoFactorRequiredError(null);
    expect(err.message).toContain('/admin/settings');
    expect(err.deadline).toBeNull();
  });
});

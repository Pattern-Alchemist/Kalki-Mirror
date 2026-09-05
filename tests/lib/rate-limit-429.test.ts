import { describe, it, expect } from 'vitest';
import { rateLimit, rateLimit429Snapshot } from '@/lib/rate-limit';

/* ══════════════════════════════════════════════════════════════
   Vol. 2 #14 — 429 observability snapshot
   ══════════════════════════════════════════════════════════════ */

describe('rateLimit429Snapshot', () => {
  it('starts at zero', () => {
    const s = rateLimit429Snapshot();
    expect(s.lastMinute).toBe(0);
    expect(s.byPrefix).toEqual({});
    expect(s.scope).toBe('instance');
  });

  it('counts only limited results, per surface prefix', async () => {
    // Exhaust a tiny in-memory limiter window (unique key → deterministic).
    const key = `snap-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const before = rateLimit429Snapshot().lastMinute;

    let limited429s = 0;
    for (let i = 0; i < 4; i++) {
      const r = await rateLimit({ key, max: 2, window: 60, prefix: 'testsnap' });
      if (r.limited) limited429s++;
    }
    const after = rateLimit429Snapshot();
    expect(after.lastMinute - before).toBe(limited429s);
    expect(after.byPrefix.testsnap).toBeGreaterThanOrEqual(limited429s);
  });

  it('returns an honest per-instance scope label', () => {
    expect(rateLimit429Snapshot().scope).toBe('instance');
  });
});

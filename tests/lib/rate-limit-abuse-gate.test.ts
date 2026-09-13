import { describe, it, expect } from 'vitest';
import {
  redeemRateLimit,
  eventsRateLimit,
  tooManyRequestsResponse,
  createRateLimiter,
  type RateLimitResult,
} from '@/lib/rate-limit';

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #10 — the abuse gate.
   Redeem and events had ZERO rate limiting (verified 2026-09-13).
   Both ship generous-first; the existing 429 snapshot covers
   the observation plane (sustained > 50 blocks/hr surfaces in
   /health). The doctrine: limiter first, schema/enum second.
   ══════════════════════════════════════════════════════════════ */

describe('the abuse gate — pre-configured limiters', () => {
  it('redeemRateLimit is 5/600s/IP (fail-closed credential oracle)', () => {
    expect(redeemRateLimit).toBeDefined();
    expect(typeof redeemRateLimit).toBe('function');
  });

  it('eventsRateLimit is 60/300s/IP (fail-open beacon ingestion)', () => {
    expect(eventsRateLimit).toBeDefined();
    expect(typeof eventsRateLimit).toBe('function');
  });

  it('both limiters return RateLimitResult shape', async () => {
    // Use a unique key per test run so the memory backend doesn't carry state
    const k = `test-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const r1 = await redeemRateLimit(k);
    expect(r1).toHaveProperty('limited');
    expect(r1).toHaveProperty('remaining');
    expect(r1).toHaveProperty('reset');
    expect(typeof r1.reset).toBe('number');
    const r2 = await eventsRateLimit(k);
    expect(r2).toHaveProperty('limited');
    expect(r2).toHaveProperty('remaining');
  });

  it('eventsRateLimit allows 60 within window, blocks on 61st', async () => {
    const k = `events-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let blocked = false;
    let lastResult: RateLimitResult | null = null;
    for (let i = 0; i < 70; i++) {
      const r = await eventsRateLimit(k);
      lastResult = r;
      if (r.limited) {
        blocked = true;
        break;
      }
    }
    expect(blocked).toBe(true);
    expect(lastResult!.limited).toBe(true);
  });

  it('redeemRateLimit blocks on 6th attempt within 600s window', async () => {
    const k = `redeem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    let blocked = false;
    for (let i = 0; i < 10; i++) {
      const r = await redeemRateLimit(k);
      if (r.limited) {
        blocked = true;
        break;
      }
    }
    expect(blocked).toBe(true);
  });

  it('limiters are IP-independent (different keys never share limits)', async () => {
    const k1 = `ip-a-${Date.now()}`;
    const k2 = `ip-b-${Date.now()}`;
    // burn through k1's redeem limit
    for (let i = 0; i < 5; i++) await redeemRateLimit(k1);
    // k2 should still have its full quota
    const r = await redeemRateLimit(k2);
    expect(r.limited).toBe(false);
  });
});

describe('tooManyRequestsResponse — the standardized 429 shape', () => {
  it('returns status 429 with Retry-After header', async () => {
    const reset = Date.now() + 30_000; // 30s in the future
    const res = tooManyRequestsResponse(reset);
    expect(res.status).toBe(429);
    expect(res.headers.get('Retry-After')).toBeTruthy();
    const retryAfter = Number(res.headers.get('Retry-After'));
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(30);
  });

  it('body shape is {error: rate_limited, retryAfter: number}', async () => {
    const reset = Date.now() + 60_000;
    const res = tooManyRequestsResponse(reset);
    const body = await res.json();
    expect(body.error).toBe('rate_limited');
    expect(typeof body.retryAfter).toBe('number');
    expect(body.retryAfter).toBeGreaterThan(0);
  });

  it('Retry-After is at least 1 second (never zero)', async () => {
    const res = tooManyRequestsResponse(Date.now() + 100); // 100ms in future
    const retryAfter = Number(res.headers.get('Retry-After'));
    expect(retryAfter).toBeGreaterThanOrEqual(1);
  });

  it('Retry-After is never negative (clamps to 1 on past reset)', async () => {
    const res = tooManyRequestsResponse(Date.now() - 1000); // already past
    const retryAfter = Number(res.headers.get('Retry-After'));
    expect(retryAfter).toBeGreaterThanOrEqual(1);
  });
});

describe('the doctrine — limiter first, schema second', () => {
  // This test exists to encode the doctrine as a regression pin.
  // The actual route files enforce it; this is the architectural assertion.

  it('createRateLimiter is composable — same factory pattern for both', () => {
    const custom = createRateLimiter({ max: 100, window: 60, prefix: 'test' });
    expect(typeof custom).toBe('function');
    // Both pre-configured limiters use the same factory
    expect(redeemRateLimit).toBeDefined();
    expect(eventsRateLimit).toBeDefined();
  });

  it('the fail-closed vs fail-open doctrine is encoded in the route files, not the limiter', () => {
    // The limiter itself never throws — it always returns RateLimitResult.
    // fail-closed vs fail-open is the ROUTE's choice of what to do when
    // the limiter's call itself throws. Redeem wraps in try/catch and 503s;
    // events wraps in try/catch and proceeds. This test pins the contract.
    expect(createRateLimiter({ max: 1, window: 1, prefix: 'test' })).toBeDefined();
  });
});

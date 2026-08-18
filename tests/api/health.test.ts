import { describe, it, expect } from 'vitest';

describe('Rate Limiter', () => {
  it('memory backend allows requests under limit', async () => {
    // Dynamic import to get fresh module state
    const { rateLimit } = await import('@/lib/rate-limit');
    const result = await rateLimit({ key: 'test-under', max: 5, window: 60 });
    expect(result.limited).toBe(false);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });

  it('memory backend blocks requests over limit', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    // Exhaust the limit
    for (let i = 0; i < 3; i++) {
      await rateLimit({ key: 'test-over', max: 3, window: 60 });
    }
    const result = await rateLimit({ key: 'test-over', max: 3, window: 60 });
    expect(result.limited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it('separate keys have independent limits', async () => {
    const { rateLimit } = await import('@/lib/rate-limit');
    for (let i = 0; i < 5; i++) {
      await rateLimit({ key: 'test-a', max: 2, window: 60 });
    }
    const result = await rateLimit({ key: 'test-b', max: 2, window: 60 });
    expect(result.limited).toBe(false);
  });

  it('createRateLimiter returns a function with correct defaults', async () => {
    const { createRateLimiter } = await import('@/lib/rate-limit');
    const limiter = createRateLimiter({ max: 1, window: 60, prefix: 'custom' });
    const r1 = await limiter('ip-1');
    expect(r1.limited).toBe(false);
    const r2 = await limiter('ip-1');
    expect(r2.limited).toBe(true);
  });

  it('pre-configured aiRateLimit works', async () => {
    const { aiRateLimit } = await import('@/lib/rate-limit');
    const result = await aiRateLimit('test-ai-ip');
    expect(result.limited).toBe(false);
  });
});

describe('API Auth Helpers', () => {
  it('getClientIp extracts x-forwarded-for', async () => {
    const { getClientIp } = await import('@/lib/api-auth');
    const req = {
      headers: new Map([['x-forwarded-for', '1.2.3.4, 5.6.7.8']]),
      get: (name: string) => {
        const map: Record<string, string> = { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' };
        return map[name] || null;
      },
    } as any;
    expect(getClientIp(req as any)).toBe('1.2.3.4');
  });

  it('getClientIp falls back to x-real-ip', async () => {
    const { getClientIp } = await import('@/lib/api-auth');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = { headers: { get: (n: string) => n === 'x-real-ip' ? '10.0.0.1' : null } } as any;
    expect(getClientIp(req)).toBe('10.0.0.1');
  });

  it('getClientIp returns unknown when no headers', async () => {
    const { getClientIp } = await import('@/lib/api-auth');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const req = { headers: { get: () => null } } as any;
    expect(getClientIp(req)).toBe('unknown');
  });
});

describe('Transit Geometry', () => {
  it('returns positions and frictions', async () => {
    const { getTransitGeometry } = await import('@/lib/ephemeris/transits');
    const geo = getTransitGeometry();
    expect(geo).toHaveProperty('positions');
    expect(geo).toHaveProperty('frictions');
    expect(geo).toHaveProperty('timestamp');
    expect(Array.isArray(geo.positions)).toBe(true);
  });

  it('accepts optional natal moon', async () => {
    const { getTransitGeometry } = await import('@/lib/ephemeris/transits');
    const geo = getTransitGeometry(270);
    expect(geo.positions.length).toBeGreaterThan(0);
  });
});

describe('Tier Gate', () => {
  it('TIER_ORDER is correctly ordered', async () => {
    const { TIER_ORDER } = await import('@/lib/utils/tier-gate');
    expect(TIER_ORDER).toEqual(['prithvi', 'jal', 'agni', 'akash']);
  });

  it('TIER_LABELS has all 4 tiers', async () => {
    const { TIER_LABELS } = await import('@/lib/utils/tier-gate');
    expect(Object.keys(TIER_LABELS)).toHaveLength(4);
    expect(TIER_LABELS.prithvi).toBeDefined();
    expect(TIER_LABELS.akash).toBeDefined();
  });

  it('tierIndex returns correct index', async () => {
    const { tierIndex } = await import('@/lib/utils/tier-gate');
    expect(tierIndex('prithvi')).toBe(0);
    expect(tierIndex('akash')).toBe(3);
  });
});

describe('Data Integrity', () => {
  it('allPatterns has expected shape', async () => {
    const { allPatterns } = await import('@/lib/data/patterns');
    expect(allPatterns.length).toBeGreaterThan(0);
    for (const p of allPatterns) {
      expect(p).toHaveProperty('slug');
      expect(p).toHaveProperty('name');
      expect(p).toHaveProperty('signs');
      expect(Array.isArray(p.signs)).toBe(true);
    }
  });

  it('allSiddhis has expected shape', async () => {
    const { allSiddhis } = await import('@/lib/data/siddhis');
    expect(allSiddhis.length).toBeGreaterThan(0);
    for (const s of allSiddhis) {
      expect(s).toHaveProperty('slug');
      expect(s).toHaveProperty('name');
      expect(s).toHaveProperty('level');
      expect(['Foundation', 'Intermediate', 'Advanced', 'Restricted']).toContain(s.level);
    }
  });

  it('archetypes has 10 Mahavidyas', async () => {
    const { TEN_MAHAVIDYAS } = await import('@/lib/data/archetypes');
    expect(TEN_MAHAVIDYAS).toHaveLength(10);
  });
});

describe('Validators', () => {
  it('initiateSchema accepts valid input', async () => {
    const { initiateSchema } = await import('@/lib/validators/schemas');
    const valid = initiateSchema.safeParse({
      birthDate: '1990-01-15',
      birthTime: '14:30',
      birthPlace: 'Varanasi',
    });
    expect(valid.success).toBe(true);

    // birthPlace too long
    const invalid = initiateSchema.safeParse({ birthPlace: 'x'.repeat(201) });
    expect(invalid.success).toBe(false);
  });

  it('transitsSchema validates natalMoon range', async () => {
    const { transitsSchema } = await import('@/lib/validators/schemas');
    const valid = transitsSchema.safeParse({ natalMoon: '270' });
    expect(valid.success).toBe(true);

    const outOfRange = transitsSchema.safeParse({ natalMoon: '400' });
    expect(outOfRange.success).toBe(false);
  });

  it('redeemKeySchema validates code format', async () => {
    const { redeemKeySchema } = await import('@/lib/validators/schemas');
    const valid = redeemKeySchema.safeParse({ code: 'KALKI-ABCD-EFGH' });
    expect(valid.success).toBe(true);

    // Empty code should fail
    const invalid = redeemKeySchema.safeParse({ code: '' });
    expect(invalid.success).toBe(false);
  });
});

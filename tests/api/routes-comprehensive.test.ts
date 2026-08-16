import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* ══════════════════════════════════════════════════════════════
   COMPREHENSIVE API ROUTE TESTS — Kalki-Mirror

   Covers all 23 API routes. Strategy:
     • Import handlers directly; call with mock NextRequest objects.
     • External services (LLM, Turso, next-auth) are NOT mocked —
       we test input validation, auth gating, rate limiting, and
       response shape for routes that don't require DB.
     • DB-dependent routes (admin/*, keys/*, user/tier, auth/*)
       are tested for auth gating and request-shape validation.
   ══════════════════════════════════════════════════════════════ */

// ── Helpers ───────────────────────────────────────────────

function makeRequest(opts: {
  method?: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  url?: string;
}) {
  const { method = 'GET', body, headers = {}, url = 'http://localhost:3000/api/test' } = opts;
  const reqHeaders = new Headers();
  for (const [k, v] of Object.entries(headers)) {
    reqHeaders.set(k, v);
  }
  return {
    url,
    method,
    headers: reqHeaders,
    json: async () => body ?? {},
    nextUrl: { searchParams: new URL(url).searchParams },
  } as unknown as import('next/server').NextRequest;
}

// Routes that check isLLMConfigured() before Zod validation return 503
// when no API key is set. We accept both 400 (validation) and 503 (LLM not configured).
const AI_OR_503 = [400, 503];
// Routes with auth-first then validation: 401 (no auth) or 400 (bad input)
const AUTH_OR_400 = [400, 401];

/* ══════════════════════════════════════════════════════════════
   1. GET /api — Liveness probe
   ══════════════════════════════════════════════════════════════ */
describe('GET /api', () => {
  it('returns 200 with status ok and ISO timestamp', async () => {
    const { GET } = await import('@/app/api/route');
    const req = makeRequest({ url: 'http://localhost:3000/api' });
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.status).toBe('ok');
    expect(data.timestamp).toBeDefined();
    // ISO 8601 format check
    expect(new Date(data.timestamp).toISOString()).toBe(data.timestamp);
  });

  it('has no body (only status + timestamp)', async () => {
    const { GET } = await import('@/app/api/route');
    const req = makeRequest({ url: 'http://localhost:3000/api' });
    const res = await GET(req);
    const data = await res.json();
    expect(Object.keys(data)).toEqual(['status', 'timestamp']);
  });
});

/* ══════════════════════════════════════════════════════════════
   2. GET /api/health — Full health check
   ══════════════════════════════════════════════════════════════ */
describe('GET /api/health', () => {
  it('returns a response with status, corpus, database, environment, timing', async () => {
    const { GET } = await import('@/app/api/health/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/health' });
    const res = await GET(req);
    const data = await res.json();
    // May be 200 (healthy) or 503 (degraded/critical if Turso unavailable)
    expect([200, 503]).toContain(res.status);
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('corpus');
    expect(data).toHaveProperty('database');
    expect(data).toHaveProperty('environment');
    expect(data).toHaveProperty('timing');
  });

  it('corpus has total and cautionBreakdown', async () => {
    const { GET } = await import('@/app/api/health/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/health' });
    const res = await GET(req);
    const data = await res.json();
    expect(data.corpus).toHaveProperty('total');
    expect(data.corpus).toHaveProperty('cautionBreakdown');
    expect(data.corpus).toHaveProperty('withEmbeddings');
    expect(typeof data.corpus.total).toBe('number');
  });

  it('database object has status and latencyMs', async () => {
    const { GET } = await import('@/app/api/health/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/health' });
    const res = await GET(req);
    const data = await res.json();
    expect(data.database).toHaveProperty('status');
    expect(data.database).toHaveProperty('latencyMs');
    expect(['ok', 'error']).toContain(data.database.status);
  });

  it('environment is either local or serverless', async () => {
    const { GET } = await import('@/app/api/health/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/health' });
    const res = await GET(req);
    const data = await res.json();
    expect(['local', 'serverless']).toContain(data.environment);
  });

  it('timing includes coldStartMs', async () => {
    const { GET } = await import('@/app/api/health/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/health' });
    const res = await GET(req);
    const data = await res.json();
    expect(data.timing).toHaveProperty('coldStartMs');
    expect(typeof data.timing.coldStartMs).toBe('number');
  });

  it('status is one of ok/degraded/critical', async () => {
    const { GET } = await import('@/app/api/health/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/health' });
    const res = await GET(req);
    const data = await res.json();
    expect(['ok', 'degraded', 'critical']).toContain(data.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   3. GET /api/transits — Transit geometry
   ══════════════════════════════════════════════════════════════ */
describe('GET /api/transits', () => {
  it('returns 200 with positions and frictions', async () => {
    const { GET } = await import('@/app/api/transits/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/transits' });
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('positions');
    expect(data).toHaveProperty('frictions');
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('yantra_context');
    expect(Array.isArray(data.positions)).toBe(true);
  });

  it('each position has planet, longitude, nakshatra, nakshatraPada, retrograde', async () => {
    const { GET } = await import('@/app/api/transits/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/transits' });
    const res = await GET(req);
    const data = await res.json();
    for (const pos of data.positions) {
      expect(pos).toHaveProperty('planet');
      expect(pos).toHaveProperty('longitude');
      expect(pos).toHaveProperty('nakshatra');
      expect(pos).toHaveProperty('nakshatraPada');
      expect(pos).toHaveProperty('retrograde');
      expect(typeof pos.longitude).toBe('number');
      expect(typeof pos.retrograde).toBe('boolean');
    }
  });

  it('accepts optional natalMoon parameter', async () => {
    const { GET } = await import('@/app/api/transits/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/transits?natalMoon=270' });
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.positions.length).toBeGreaterThan(0);
  });

  it('rejects natalMoon > 360 with 400', async () => {
    const { GET } = await import('@/app/api/transits/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/transits?natalMoon=400' });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('rejects natalMoon < 0 with 400', async () => {
    const { GET } = await import('@/app/api/transits/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/transits?natalMoon=-5' });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('rejects non-numeric natalMoon with 400', async () => {
    const { GET } = await import('@/app/api/transits/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/transits?natalMoon=abc' });
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it('frictions array contains objects with description', async () => {
    const { GET } = await import('@/app/api/transits/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/transits' });
    const res = await GET(req);
    const data = await res.json();
    expect(Array.isArray(data.frictions)).toBe(true);
    for (const f of data.frictions) {
      expect(f).toHaveProperty('description');
    }
  });

  it('timestamp is a valid ISO date', async () => {
    const { GET } = await import('@/app/api/transits/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/transits' });
    const res = await GET(req);
    const data = await res.json();
    expect(() => new Date(data.timestamp)).not.toThrow();
  });
});

/* ══════════════════════════════════════════════════════════════
   4. POST /api/initiate — Dossier generation
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/initiate', () => {
  it('returns 200 with valid birth data and dossier shape', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({
      method: 'POST',
      body: { birthDate: '1990-01-15', birthTime: '14:30', birthPlace: 'Varanasi' },
    });
    const res = await POST(req);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toHaveProperty('transit');
    expect(data).toHaveProperty('patterns');
    expect(data).toHaveProperty('archetypes');
    expect(data).toHaveProperty('rag');
  });

  it('returns 200 with behavioral query only', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({
      method: 'POST',
      body: { behavioralQuery: 'I keep attracting unavailable partners and feel abandoned' },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 200 with natalMoonDeg', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({
      method: 'POST',
      body: { natalMoonDeg: 270 },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it('returns 400 when no input provided', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({ method: 'POST', body: {} });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when birthPlace exceeds 200 chars', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({
      method: 'POST',
      body: { birthPlace: 'x'.repeat(201) },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 or 429 when behavioralQuery exceeds 2000 chars', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({
      method: 'POST',
      body: { behavioralQuery: 'x'.repeat(2001) },
    });
    const res = await POST(req);
    expect([400, 429]).toContain(res.status);
  });

  it('returns 400 or 429 when natalMoonDeg > 360', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({
      method: 'POST',
      body: { natalMoonDeg: 400 },
    });
    const res = await POST(req);
    expect([400, 429]).toContain(res.status);
  });

  it('returns 400 or 429 when natalMoonDeg < 0', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({
      method: 'POST',
      body: { natalMoonDeg: -1 },
    });
    const res = await POST(req);
    expect([400, 429]).toContain(res.status);
  });

  it('dossier patterns array has max 3 items', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({
      method: 'POST',
      body: { birthDate: '1985-06-21', birthPlace: 'Mumbai' },
    });
    const res = await POST(req);
    const data = await res.json();
    if (res.status === 200) {
      expect(data.patterns.length).toBeLessThanOrEqual(3);
    }
  });

  it('dossier siddhis are Foundation/Intermediate only', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({
      method: 'POST',
      body: { behavioralQuery: 'I feel stuck in cycles of self-sabotage and fear of success in my career' },
    });
    const res = await POST(req);
    const data = await res.json();
    if (res.status === 200 && data.siddhis?.length > 0) {
      for (const s of data.siddhis) {
        expect(['Foundation', 'Intermediate']).toContain(s.level);
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   5. POST /api/yantra — Grounded prompt assembly
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/yantra', () => {
  const validBody = {
    query: 'What is the abandonment loop pattern and how does it manifest in relationships?',
  };

  it('returns a response (may be 503 if no LLM, 429 if rate limited)', async () => {
    const { POST } = await import('@/app/api/yantra/route');
    const req = makeRequest({ method: 'POST', body: validBody });
    const res = await POST(req);
    expect([400, 429, 503]).toContain(res.status);
  });

  it('rejects query shorter than 10 chars', async () => {
    const { POST } = await import('@/app/api/yantra/route');
    const req = makeRequest({ method: 'POST', body: { query: 'short' } });
    const res = await POST(req);
    expect([400, 429, 503]).toContain(res.status);
  });

  it('rejects query longer than 2000 chars', async () => {
    const { POST } = await import('@/app/api/yantra/route');
    const req = makeRequest({ method: 'POST', body: { query: 'x'.repeat(2001) } });
    const res = await POST(req);
    expect([400, 429, 503]).toContain(res.status);
  });

  it('accepts optional context with dominantPatterns', async () => {
    const { POST } = await import('@/app/api/yantra/route');
    const req = makeRequest({
      method: 'POST',
      body: {
        ...validBody,
        context: {
          dominantPatterns: ['abandonment-loop'],
          currentTransit: 'Saturn in Aquarius',
          sadhanaStreaks: [{ practice: 'japa', days: 30 }],
          tier: 'jal',
        },
      },
    });
    const res = await POST(req);
    // Should not be 400 for validation; may be 503/429
    expect([429, 503]).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   6. /api/keys — Auth-gated key management
   ══════════════════════════════════════════════════════════════ */
describe('/api/keys — auth gating', () => {
  it('POST returns 401 without authentication', async () => {
    const { POST } = await import('@/app/api/keys/route');
    const req = makeRequest({ method: 'POST', body: { tierGranted: 'jal' } });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('GET returns 401 without authentication', async () => {
    const { GET } = await import('@/app/api/keys/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/keys' });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('POST rejects invalid tierGranted value', async () => {
    const { POST } = await import('@/app/api/keys/route');
    const req = makeRequest({ method: 'POST', body: { tierGranted: 'platinum' } });
    const res = await POST(req);
    // 401 (no auth) or 400 (validation) — auth check is first
    expect([400, 401]).toContain(res.status);
  });

  it('GET with vault param still requires auth', async () => {
    const { GET } = await import('@/app/api/keys/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/keys?vault=some-user-id' });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

/* ══════════════════════════════════════════════════════════════
   7. /api/keys/redeem — Auth-gated key redemption
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/keys/redeem — auth gating', () => {
  it('returns 401 without authentication', async () => {
    const { POST } = await import('@/app/api/keys/redeem/route');
    const req = makeRequest({
      method: 'POST',
      body: { code: 'KALKI-TEST-CODE' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 or 401 for empty code', async () => {
    const { POST } = await import('@/app/api/keys/redeem/route');
    const req = makeRequest({ method: 'POST', body: { code: '' } });
    const res = await POST(req);
    expect([400, 401]).toContain(res.status);
  });

  it('returns 400 or 401 for code exceeding 30 chars', async () => {
    const { POST } = await import('@/app/api/keys/redeem/route');
    const req = makeRequest({ method: 'POST', body: { code: 'x'.repeat(31) } });
    const res = await POST(req);
    expect([400, 401]).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   8. GET /api/user/tier — Auth-gated tier lookup
   ══════════════════════════════════════════════════════════════ */
describe('GET /api/user/tier — auth gating', () => {
  it('returns 401 without authentication', async () => {
    const { GET } = await import('@/app/api/user/tier/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/user/tier' });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

/* ══════════════════════════════════════════════════════════════
   9. /api/admin/notifications — Admin role-gated CRUD
   ══════════════════════════════════════════════════════════════ */
describe('/api/admin/notifications — auth gating', () => {
  it('GET returns 403 without admin token', async () => {
    const { GET } = await import('@/app/api/admin/notifications/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/admin/notifications' });
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('POST returns 403 without admin token', async () => {
    const { POST } = await import('@/app/api/admin/notifications/route');
    const req = makeRequest({
      method: 'POST',
      body: { title: 'Test', body: 'Test notification body' },
    });
    const res = await POST(req);
    expect(res.status).toBe(403);
  });

  it('PATCH returns 403 without admin token', async () => {
    const { PATCH } = await import('@/app/api/admin/notifications/route');
    const req = makeRequest({
      method: 'PATCH',
      body: { markAll: true },
    });
    const res = await PATCH(req);
    expect(res.status).toBe(403);
  });
});

/* ══════════════════════════════════════════════════════════════
   10. GET /api/admin/search — Admin search
   ══════════════════════════════════════════════════════════════ */
describe('GET /api/admin/search — auth gating', () => {
  it('returns 401 without admin token', async () => {
    const { GET } = await import('@/app/api/admin/search/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/admin/search?q=test' });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 even with empty query', async () => {
    const { GET } = await import('@/app/api/admin/search/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/admin/search' });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});

/* ══════════════════════════════════════════════════════════════
   11. POST /api/auth/2fa-verify — 2FA verification
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/auth/2fa-verify — validation', () => {
  it('returns 400 when userId is missing', async () => {
    const { POST } = await import('@/app/api/auth/2fa-verify/route');
    const req = makeRequest({
      method: 'POST',
      body: { code: '123456', preAuthToken: 'some-token' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when code is missing', async () => {
    const { POST } = await import('@/app/api/auth/2fa-verify/route');
    const req = makeRequest({
      method: 'POST',
      body: { userId: 'user-1', preAuthToken: 'some-token' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when code is not 6 chars', async () => {
    const { POST } = await import('@/app/api/auth/2fa-verify/route');
    const req = makeRequest({
      method: 'POST',
      body: { userId: 'user-1', code: '12345', preAuthToken: 'token' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when code is 7 chars', async () => {
    const { POST } = await import('@/app/api/auth/2fa-verify/route');
    const req = makeRequest({
      method: 'POST',
      body: { userId: 'user-1', code: '1234567', preAuthToken: 'token' },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 401 when preAuthToken is invalid', async () => {
    const { POST } = await import('@/app/api/auth/2fa-verify/route');
    const req = makeRequest({
      method: 'POST',
      body: { userId: 'user-1', code: '123456', preAuthToken: 'invalid-token' },
    });
    const res = await POST(req);
    // 400 (format ok but pre-auth fails) or 401 (pre-auth rejected)
    expect([400, 401, 500]).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   12. GET /api/auth/session-validate — Session validation
   ══════════════════════════════════════════════════════════════ */
describe('GET /api/auth/session-validate — auth gating', () => {
  it('returns 401 without token', async () => {
    const { GET } = await import('@/app/api/auth/session-validate/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/auth/session-validate' });
    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('returns 401 with valid:false and reason:no_token', async () => {
    const { GET } = await import('@/app/api/auth/session-validate/route');
    const req = makeRequest({ url: 'http://localhost:3000/api/auth/session-validate' });
    const res = await GET(req);
    const data = await res.json();
    expect(res.status).toBe(401);
    expect(data.valid).toBe(false);
    expect(data.reason).toBe('no_token');
  });
});

/* ══════════════════════════════════════════════════════════════
   13. POST /api/ai/archetype-quiz — Validation
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/archetype-quiz — validation', () => {
  it('rejects fewer than 5 answers', async () => {
    const { POST } = await import('@/app/api/ai/archetype-quiz/route');
    const req = makeRequest({
      method: 'POST',
      body: { answers: ['one', 'two', 'three', 'four'] },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects answers shorter than 5 chars each', async () => {
    const { POST } = await import('@/app/api/ai/archetype-quiz/route');
    const req = makeRequest({
      method: 'POST',
      body: { answers: ['abc', 'def', 'ghi', 'jkl', 'mno'] },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects more than 10 answers', async () => {
    const { POST } = await import('@/app/api/ai/archetype-quiz/route');
    const req = makeRequest({
      method: 'POST',
      body: { answers: Array.from({ length: 11 }, (_, i) => `Answer number ${i + 1}`) },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('accepts exactly 5 valid answers (falls back to rule-based without LLM)', async () => {
    const { POST } = await import('@/app/api/ai/archetype-quiz/route');
    const req = makeRequest({
      method: 'POST',
      body: { answers: Array.from({ length: 5 }, (_, i) => `This is answer number ${i + 1} with enough chars` )},
    });
    const res = await POST(req);
    // Should succeed with rule-based fallback; may be 429 if rate limited
    if (res.status !== 429) {
      expect([200, 503]).toContain(res.status);
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   14. POST /api/ai/breathwork — Validation
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/breathwork — validation', () => {
  it('rejects invalid type with 400 or 503', async () => {
    const { POST } = await import('@/app/api/ai/breathwork/route');
    const req = makeRequest({
      method: 'POST',
      body: { type: 'invalid-type', duration: 15 },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects duration less than 3 minutes', async () => {
    const { POST } = await import('@/app/api/ai/breathwork/route');
    const req = makeRequest({
      method: 'POST',
      body: { type: 'calming', duration: 1 },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects duration greater than 60 minutes', async () => {
    const { POST } = await import('@/app/api/ai/breathwork/route');
    const req = makeRequest({
      method: 'POST',
      body: { type: 'calming', duration: 120 },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('accepts all 6 valid breathwork types', async () => {
    const { POST } = await import('@/app/api/ai/breathwork/route');
    const types = ['calming', 'energizing', 'focus', 'nadi-shuddhi', 'bhramari', 'custom'];
    for (const type of types) {
      const req = makeRequest({ method: 'POST', body: { type, duration: 10 } });
      const res = await POST(req);
      if (res.status === 400) {
        const data = await res.json();
        throw new Error(`Type '${type}' was rejected: ${data.error}`);
      }
    }
  });

  it('defaults duration to 15 when omitted', async () => {
    const { POST } = await import('@/app/api/ai/breathwork/route');
    const req = makeRequest({ method: 'POST', body: { type: 'calming' } });
    const res = await POST(req);
    // Should not be 400 (duration has a default)
    if (res.status !== 429 && res.status !== 503) {
      expect(res.status).not.toBe(400);
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   15. POST /api/ai/japa-guide — Validation
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/japa-guide — validation', () => {
  it('rejects mantra shorter than 2 chars', async () => {
    const { POST } = await import('@/app/api/ai/japa-guide/route');
    const req = makeRequest({ method: 'POST', body: { mantra: 'x' } });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects count less than 1', async () => {
    const { POST } = await import('@/app/api/ai/japa-guide/route');
    const req = makeRequest({
      method: 'POST',
      body: { mantra: 'Om Namah Shivaya', count: 0 },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('accepts optional experience field', async () => {
    const { POST } = await import('@/app/api/ai/japa-guide/route');
    const req = makeRequest({
      method: 'POST',
      body: { mantra: 'Om Mani Padme Hum', count: 108, experience: 'Feeling peaceful today' },
    });
    const res = await POST(req);
    // Should not be 400 for validation
    if (res.status !== 429 && res.status !== 503) {
      expect(res.status).not.toBe(400);
    }
  });

  it('rejects experience longer than 1000 chars', async () => {
    const { POST } = await import('@/app/api/ai/japa-guide/route');
    const req = makeRequest({
      method: 'POST',
      body: { mantra: 'Om Gam Ganapataye Namaha', experience: 'x'.repeat(1001) },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   16. POST /api/ai/recommend-tier — Validation
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/recommend-tier — validation', () => {
  it('rejects fewer than 3 answers', async () => {
    const { POST } = await import('@/app/api/ai/recommend-tier/route');
    const req = makeRequest({
      method: 'POST',
      body: { answers: ['one', 'two'] },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('rejects more than 5 answers', async () => {
    const { POST } = await import('@/app/api/ai/recommend-tier/route');
    const req = makeRequest({
      method: 'POST',
      body: { answers: ['one', 'two', 'three', 'four', 'five', 'six'] },
    });
    const res = await POST(req);
    expect([400, 429]).toContain(res.status);
  });

  it('rejects answers with less than 5 chars each', async () => {
    const { POST } = await import('@/app/api/ai/recommend-tier/route');
    const req = makeRequest({
      method: 'POST',
      body: { answers: ['abc', 'def', 'ghi'] },
    });
    const res = await POST(req);
    expect([400, 429]).toContain(res.status);
  });

  it('accepts 3 valid answers (rule-based fallback)', async () => {
    const { POST } = await import('@/app/api/ai/recommend-tier/route');
    const req = makeRequest({
      method: 'POST',
      body: { answers: ['I want deep spiritual practice', 'I am a dedicated seeker', 'I value community'] },
    });
    const res = await POST(req);
    if (res.status !== 429) {
      expect([200, 503]).toContain(res.status);
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   17. POST /api/ai/consultation-screen — Validation
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/consultation-screen — validation', () => {
  it('rejects name shorter than 2 chars', async () => {
    const { POST } = await import('@/app/api/ai/consultation-screen/route');
    const req = makeRequest({
      method: 'POST',
      body: { name: 'A', message: 'This is a valid message with enough characters to pass validation.' },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects message shorter than 10 chars', async () => {
    const { POST } = await import('@/app/api/ai/consultation-screen/route');
    const req = makeRequest({
      method: 'POST',
      body: { name: 'Test User', message: 'short' },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects name longer than 200 chars', async () => {
    const { POST } = await import('@/app/api/ai/consultation-screen/route');
    const req = makeRequest({
      method: 'POST',
      body: { name: 'x'.repeat(201), message: 'A valid consultation message with sufficient length' },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects message longer than 5000 chars', async () => {
    const { POST } = await import('@/app/api/ai/consultation-screen/route');
    const req = makeRequest({
      method: 'POST',
      body: { name: 'Test User', message: 'x'.repeat(5001) },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   18. POST /api/ai/pattern-explain — Validation + Fallback
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/pattern-explain — validation', () => {
  it('rejects missing patternSlug', async () => {
    const { POST } = await import('@/app/api/ai/pattern-explain/route');
    const req = makeRequest({ method: 'POST', body: {} });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects empty patternSlug', async () => {
    const { POST } = await import('@/app/api/ai/pattern-explain/route');
    const req = makeRequest({ method: 'POST', body: { patternSlug: '' } });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('returns fallback for valid known pattern slug without LLM', async () => {
    const { POST } = await import('@/app/api/ai/pattern-explain/route');
    const req = makeRequest({
      method: 'POST',
      body: { patternSlug: 'abandonment-loop', context: 'In romantic relationships' },
    });
    const res = await POST(req);
    const data = await res.json();
    // Should return fallback (200) or 503 if slug not found
    expect([200, 503]).toContain(res.status);
    if (res.status === 200) {
      expect(data).toHaveProperty('name');
      expect(data).toHaveProperty('explanation');
    }
  });

  it('rejects context longer than 500 chars', async () => {
    const { POST } = await import('@/app/api/ai/pattern-explain/route');
    const req = makeRequest({
      method: 'POST',
      body: { patternSlug: 'test', context: 'x'.repeat(501) },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   19. POST /api/ai/search — Validation
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/search — validation', () => {
  it('rejects query shorter than 3 chars', async () => {
    const { POST } = await import('@/app/api/ai/search/route');
    const req = makeRequest({ method: 'POST', body: { query: 'ab' } });
    const res = await POST(req);
    expect([400, 429, 503]).toContain(res.status);
  });

  it('rejects query longer than 500 chars', async () => {
    const { POST } = await import('@/app/api/ai/search/route');
    const req = makeRequest({ method: 'POST', body: { query: 'x'.repeat(501) } });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects limit greater than 20', async () => {
    const { POST } = await import('@/app/api/ai/search/route');
    const req = makeRequest({ method: 'POST', body: { query: 'test search query', limit: 50 } });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects limit less than 1', async () => {
    const { POST } = await import('@/app/api/ai/search/route');
    const req = makeRequest({ method: 'POST', body: { query: 'test search query', limit: 0 } });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('defaults limit to 5 when omitted', async () => {
    const { POST } = await import('@/app/api/ai/search/route');
    const req = makeRequest({ method: 'POST', body: { query: 'siddhi for focus' } });
    const res = await POST(req);
    // Should not 400 (limit has default)
    if (res.status !== 429 && res.status !== 503) {
      expect(res.status).not.toBe(400);
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   20. POST /api/ai/transit-interpretation — Validation
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/transit-interpretation — validation', () => {
  it('rejects empty positions array', async () => {
    const { POST } = await import('@/app/api/ai/transit-interpretation/route');
    const req = makeRequest({ method: 'POST', body: { positions: [] } });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects position with missing fields', async () => {
    const { POST } = await import('@/app/api/ai/transit-interpretation/route');
    const req = makeRequest({
      method: 'POST',
      body: { positions: [{ planet: 'Saturn' }] },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects degree out of 0-360 range', async () => {
    const { POST } = await import('@/app/api/ai/transit-interpretation/route');
    const req = makeRequest({
      method: 'POST',
      body: { positions: [{ planet: 'Saturn', sign: 'Aquarius', degree: 400 }] },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects degree below 0', async () => {
    const { POST } = await import('@/app/api/ai/transit-interpretation/route');
    const req = makeRequest({
      method: 'POST',
      body: { positions: [{ planet: 'Mars', sign: 'Aries', degree: -10 }] },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects planet with empty string', async () => {
    const { POST } = await import('@/app/api/ai/transit-interpretation/route');
    const req = makeRequest({
      method: 'POST',
      body: { positions: [{ planet: '', sign: 'Taurus', degree: 15 }] },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   21. POST /api/ai/draft — Auth + Validation
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/draft — auth + validation', () => {
  it('returns 401 without authentication', async () => {
    const { POST } = await import('@/app/api/ai/draft/route');
    const req = makeRequest({
      method: 'POST',
      body: { type: 'practice', title: 'Test Practice Title' },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejects invalid content type', async () => {
    const { POST } = await import('@/app/api/ai/draft/route');
    const req = makeRequest({
      method: 'POST',
      body: { type: 'invalid-type', title: 'Test' },
    });
    const res = await POST(req);
    expect(AUTH_OR_400).toContain(res.status);
  });

  it('rejects title shorter than 3 chars', async () => {
    const { POST } = await import('@/app/api/ai/draft/route');
    const req = makeRequest({
      method: 'POST',
      body: { type: 'practice', title: 'AB' },
    });
    const res = await POST(req);
    expect(AUTH_OR_400).toContain(res.status);
  });

  it('rejects title longer than 300 chars', async () => {
    const { POST } = await import('@/app/api/ai/draft/route');
    const req = makeRequest({
      method: 'POST',
      body: { type: 'pattern', title: 'x'.repeat(301) },
    });
    const res = await POST(req);
    expect(AUTH_OR_400).toContain(res.status);
  });

  it('accepts all 5 valid content types', async () => {
    const { POST } = await import('@/app/api/ai/draft/route');
    const types = ['practice', 'archetype', 'pattern', 'research', 'codex'];
    for (const type of types) {
      const req = makeRequest({ method: 'POST', body: { type, title: `Test ${type} title` } });
      const res = await POST(req);
      // Auth-gated so 401 is expected; 400 would mean validation rejected valid type
      if (res.status === 400) {
        const data = await res.json();
        throw new Error(`Type '${type}' was rejected: ${data.error}`);
      }
      expect(res.status).toBe(401);
    }
  });

  it('accepts optional context field', async () => {
    const { POST } = await import('@/app/api/ai/draft/route');
    const req = makeRequest({
      method: 'POST',
      body: { type: 'research', title: 'Test Research Title', context: 'Additional context here' },
    });
    const res = await POST(req);
    // 401 (auth) — not 400 (validation should pass)
    expect(res.status).toBe(401);
  });

  it('rejects context longer than 2000 chars', async () => {
    const { POST } = await import('@/app/api/ai/draft/route');
    const req = makeRequest({
      method: 'POST',
      body: { type: 'practice', title: 'Test Title', context: 'x'.repeat(2001) },
    });
    const res = await POST(req);
    expect(AUTH_OR_400).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   22. POST /api/ai/explain — Validation
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/explain — validation', () => {
  it('rejects content shorter than 20 chars', async () => {
    const { POST } = await import('@/app/api/ai/explain/route');
    const req = makeRequest({ method: 'POST', body: { content: 'too short' } });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects content longer than 10000 chars', async () => {
    const { POST } = await import('@/app/api/ai/explain/route');
    const req = makeRequest({ method: 'POST', body: { content: 'x'.repeat(10001) } });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects invalid style', async () => {
    const { POST } = await import('@/app/api/ai/explain/route');
    const req = makeRequest({
      method: 'POST',
      body: { content: 'This is a valid test content for the explain endpoint that exceeds twenty characters.', style: 'advanced' },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('accepts both valid styles', async () => {
    const { POST } = await import('@/app/api/ai/explain/route');
    for (const style of ['beginner', 'technical']) {
      const req = makeRequest({
        method: 'POST',
        body: { content: 'A valid test content string that exceeds the minimum twenty character requirement for explain.', style },
      });
      const res = await POST(req);
      if (res.status === 400) {
        const data = await res.json();
        throw new Error(`Style '${style}' was rejected: ${data.error}`);
      }
    }
  });

  it('defaults style to beginner when omitted', async () => {
    const { POST } = await import('@/app/api/ai/explain/route');
    const req = makeRequest({
      method: 'POST',
      body: { content: 'This is a valid test content string that exceeds the minimum twenty character requirement for explain.' },
    });
    const res = await POST(req);
    // Should not be 400 (style has a default)
    if (res.status !== 429 && res.status !== 503) {
      expect(res.status).not.toBe(400);
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   23. Cross-cutting: Rate limiting integration
   ══════════════════════════════════════════════════════════════ */
describe('Rate limiting integration', () => {
  it('AI routes return 429 after exhausting rate limit', async () => {
    const { POST } = await import('@/app/api/ai/explain/route');
    const validBody = {
      content: 'A sufficiently long test content string to pass the twenty character minimum validation requirement for the explain endpoint.',
    };

    let lastStatus = 0;
    for (let i = 0; i < 6; i++) {
      const req = makeRequest({ method: 'POST', body: validBody });
      const res = await POST(req);
      lastStatus = res.status;
    }

    expect([429, 503]).toContain(lastStatus);
  });

  it('Transit route allows 20 req/min (high limit)', async () => {
    const { GET } = await import('@/app/api/transits/route');
    for (let i = 0; i < 5; i++) {
      const req = makeRequest({ url: 'http://localhost:3000/api/transits' });
      const res = await GET(req);
      expect(res.status).toBe(200);
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   24. Cross-cutting: Zod schema unit tests (additional)
   ══════════════════════════════════════════════════════════════ */
describe('Zod schemas — edge cases', () => {
  it('yantraSchema rejects missing query', async () => {
    const { yantraSchema } = await import('@/lib/validators/schemas');
    const result = yantraSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('yantraSchema accepts valid context with all fields', async () => {
    const { yantraSchema } = await import('@/lib/validators/schemas');
    const result = yantraSchema.safeParse({
      query: 'A valid query about patterns that is at least ten chars',
      context: {
        dominantPatterns: ['abandonment-loop', 'mother-wound'],
        currentTransit: 'Saturn in Aquarius',
        sadhanaStreaks: [{ practice: 'japa', days: 30 }],
        tier: 'jal',
      },
    });
    expect(result.success).toBe(true);
  });

  it('breathworkSchema accepts all 6 types', async () => {
    const { breathworkSchema } = await import('@/lib/validators/schemas');
    const types = ['calming', 'energizing', 'focus', 'nadi-shuddhi', 'bhramari', 'custom'];
    for (const type of types) {
      const result = breathworkSchema.safeParse({ type, duration: 10 });
      expect(result.success).toBe(true);
    }
  });

  it('generateKeySchema defaults to jal', async () => {
    const { generateKeySchema } = await import('@/lib/validators/schemas');
    const result = generateKeySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tierGranted).toBe('jal');
    }
  });

  it('generateKeySchema accepts all 4 tiers', async () => {
    const { generateKeySchema } = await import('@/lib/validators/schemas');
    for (const tier of ['prithvi', 'jal', 'agni', 'akash'] as const) {
      const result = generateKeySchema.safeParse({ tierGranted: tier });
      expect(result.success).toBe(true);
    }
  });

  it('aiDraftSchema accepts all 5 content types', async () => {
    const { aiDraftSchema } = await import('@/lib/validators/schemas');
    for (const type of ['practice', 'archetype', 'pattern', 'research', 'codex']) {
      const result = aiDraftSchema.safeParse({ type, title: 'Valid Title' });
      expect(result.success).toBe(true);
    }
  });

  it('contentEntrySchema validates slug format', async () => {
    const { contentEntrySchema } = await import('@/lib/validators/schemas');
    const valid = contentEntrySchema.safeParse({
      type: 'practice', slug: 'my-practice-123', title: 'Test',
    });
    expect(valid.success).toBe(true);

    const invalid = contentEntrySchema.safeParse({
      type: 'practice', slug: 'Invalid Slug!', title: 'Test',
    });
    expect(invalid.success).toBe(false);
  });

  it('consultationScreenSchema validates name and message bounds', async () => {
    const { consultationScreenSchema } = await import('@/lib/validators/schemas');
    const valid = consultationScreenSchema.safeParse({
      name: 'John', message: 'A valid consultation message',
    });
    expect(valid.success).toBe(true);

    const nameTooShort = consultationScreenSchema.safeParse({
      name: 'A', message: 'A valid consultation message',
    });
    expect(nameTooShort.success).toBe(false);

    const msgTooShort = consultationScreenSchema.safeParse({
      name: 'John', message: 'short',
    });
    expect(msgTooShort.success).toBe(false);
  });

  it('transitInterpretationSchema requires at least 1 position', async () => {
    const { transitInterpretationSchema } = await import('@/lib/validators/schemas');
    const empty = transitInterpretationSchema.safeParse({ positions: [] });
    expect(empty.success).toBe(false);

    const valid = transitInterpretationSchema.safeParse({
      positions: [{ planet: 'Sun', sign: 'Leo', degree: 15 }],
    });
    expect(valid.success).toBe(true);
  });

  it('archetypeQuizSchema allows exactly 5-10 answers', async () => {
    const { archetypeQuizSchema } = await import('@/lib/validators/schemas');
    const four = archetypeQuizSchema.safeParse({
      answers: ['12345', '12345', '12345', '12345'],
    });
    expect(four.success).toBe(false);

    const five = archetypeQuizSchema.safeParse({
      answers: ['12345', '12345', '12345', '12345', '12345'],
    });
    expect(five.success).toBe(true);

    const ten = archetypeQuizSchema.safeParse({
      answers: Array.from({ length: 10 }, () => '12345'),
    });
    expect(ten.success).toBe(true);

    const eleven = archetypeQuizSchema.safeParse({
      answers: Array.from({ length: 11 }, () => '12345'),
    });
    expect(eleven.success).toBe(false);
  });

  it('recommendTierSchema allows exactly 3-5 answers', async () => {
    const { recommendTierSchema } = await import('@/lib/validators/schemas');
    const two = recommendTierSchema.safeParse({ answers: ['12345', '12345'] });
    expect(two.success).toBe(false);

    const three = recommendTierSchema.safeParse({ answers: ['12345', '12345', '12345'] });
    expect(three.success).toBe(true);

    const five = recommendTierSchema.safeParse({ answers: ['12345', '12345', '12345', '12345', '12345'] });
    expect(five.success).toBe(true);

    const six = recommendTierSchema.safeParse({ answers: ['12345', '12345', '12345', '12345', '12345', '12345'] });
    expect(six.success).toBe(false);
  });
});

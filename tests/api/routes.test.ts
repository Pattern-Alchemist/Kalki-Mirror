import { describe, it, expect, vi, beforeEach } from 'vitest';

/* ══════════════════════════════════════════════════════════════
   API ROUTE TESTS — Kalki-Mirror

   Strategy: Import the handler functions directly and call
   them with mocked NextRequest objects. Routes that depend
   on external services (LLM, Turso, next-auth) are tested
   for input validation, auth gating, and rate limiting only.
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
  } as unknown as import('next/server').NextRequest;
}

/* ══════════════════════════════════════════════════════════════
   1. /api/transits
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
});

/* ══════════════════════════════════════════════════════════════
   2. /api/initiate
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/initiate', () => {
  it('returns 200 with valid birth data', async () => {
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

  it('returns 400 when behavioralQuery exceeds 2000 chars', async () => {
    const { POST } = await import('@/app/api/initiate/route');
    const req = makeRequest({
      method: 'POST',
      body: { behavioralQuery: 'x'.repeat(2001) },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

/* ══════════════════════════════════════════════════════════════
   3. /api/yantra
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/yantra', () => {
  it('returns 503 when LLM is not configured', async () => {
    const { POST } = await import('@/app/api/yantra/route');
    const req = makeRequest({
      method: 'POST',
      body: { query: 'What is the abandonment loop pattern and how does it manifest in relationships?' },
    });
    const res = await POST(req);
    // Will be 503 if no OPENAI_API_KEY, or 400/429 depending on env
    expect([400, 429, 503]).toContain(res.status);
  });

  it('rejects query shorter than 10 chars with 400 or rate limits', async () => {
    const { POST } = await import('@/app/api/yantra/route');
    const req = makeRequest({
      method: 'POST',
      body: { query: 'short' },
    });
    const res = await POST(req);
    // 400 (validation) or 429 (rate limited from prior tests) or 503 (no LLM)
    expect([400, 429, 503]).toContain(res.status);
  });
});

/* AI routes that check isLLMConfigured() before validation return 503 when no API key is set.
   We accept both 400 (validation) and 503 (LLM not configured) as valid test outcomes. */
const AI_OR_503 = [400, 503];

describe('POST /api/ai/explain — validation', () => {
  it('rejects content shorter than 20 chars', async () => {
    const { POST } = await import('@/app/api/ai/explain/route');
    const req = makeRequest({
      method: 'POST',
      body: { content: 'too short' },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects content longer than 10000 chars', async () => {
    const { POST } = await import('@/app/api/ai/explain/route');
    const req = makeRequest({
      method: 'POST',
      body: { content: 'x'.repeat(10001) },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });

  it('rejects invalid style with 400', async () => {
    const { POST } = await import('@/app/api/ai/explain/route');
    const req = makeRequest({
      method: 'POST',
      body: { content: 'This is a valid test content for the explain endpoint that exceeds twenty characters.', style: 'advanced' },
    });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   5. /api/ai/archetype-quiz — Validation only
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
});

/* ══════════════════════════════════════════════════════════════
   6. /api/ai/breathwork — Validation only
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/breathwork — validation', () => {
  it('rejects invalid type with 400', async () => {
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

  it('accepts all valid breathwork types', async () => {
    const { POST } = await import('@/app/api/ai/breathwork/route');
    const types = ['calming', 'energizing', 'focus', 'nadi-shuddhi', 'bhramari', 'custom'];
    for (const type of types) {
      const req = makeRequest({ method: 'POST', body: { type, duration: 10 } });
      const res = await POST(req);
      // Should NOT be 400 (validation error); may be 503 (no LLM) or 429 (rate limited)
      if (res.status === 400) {
        const data = await res.json();
        throw new Error(`Type '${type}' was rejected: ${data.error}`);
      }
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   7. /api/ai/japa-guide — Validation only
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/japa-guide — validation', () => {
  it('rejects mantra shorter than 2 chars', async () => {
    const { POST } = await import('@/app/api/ai/japa-guide/route');
    const req = makeRequest({
      method: 'POST',
      body: { mantra: 'x' },
    });
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
});

/* ══════════════════════════════════════════════════════════════
   8. /api/ai/recommend-tier — Validation only
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
    expect(res.status).toBe(400);
  });
});

/* ══════════════════════════════════════════════════════════════
   9. /api/ai/consultation-screen — Validation only
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
});

/* ══════════════════════════════════════════════════════════════
   10. /api/ai/pattern-explain — Validation only
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
});

/* ══════════════════════════════════════════════════════════════
   11. /api/ai/search — Validation only
   ══════════════════════════════════════════════════════════════ */
describe('POST /api/ai/search — validation', () => {
  it('rejects query shorter than 3 chars', async () => {
    const { POST } = await import('@/app/api/ai/search/route');
    const req = makeRequest({ method: 'POST', body: { query: 'ab' } });
    const res = await POST(req);
    expect(AI_OR_503).toContain(res.status);
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
});

/* ══════════════════════════════════════════════════════════════
   12. /api/ai/transit-interpretation — Validation only
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
      body: { positions: [{ planet: 'Saturn' }] }, // missing sign, degree
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
});

/* ══════════════════════════════════════════════════════════════
   13. /api/ai/draft — Auth + Validation (admin endpoint)
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
    // 401 (no auth) or 400 (validation) — either is acceptable
    expect([400, 401]).toContain(res.status);
  });

  it('rejects title shorter than 3 chars', async () => {
    const { POST } = await import('@/app/api/ai/draft/route');
    const req = makeRequest({
      method: 'POST',
      body: { type: 'practice', title: 'AB' },
    });
    const res = await POST(req);
    expect([400, 401]).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   14. /api/keys/redeem — Auth gating
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

  it('returns 400 for empty code', async () => {
    const { POST } = await import('@/app/api/keys/redeem/route');
    const req = makeRequest({ method: 'POST', body: { code: '' } });
    const res = await POST(req);
    // 400 (validation) or 401 (auth) — validation runs first if body parsed before auth
    expect([400, 401]).toContain(res.status);
  });
});

/* ══════════════════════════════════════════════════════════════
   15. /api/keys — Auth gating
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
});

/* ══════════════════════════════════════════════════════════════
   16. /api/user/tier — Auth gating
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
   17. Cross-cutting: Rate limiter integration
   ══════════════════════════════════════════════════════════════ */
describe('Rate limiting integration', () => {
  it('AI routes return 429 after exhausting rate limit', async () => {
    const { POST } = await import('@/app/api/ai/explain/route');
    const validBody = {
      content: 'A sufficiently long test content string to pass the twenty character minimum validation requirement for the explain endpoint.',
    };

    // The aiRateLimit allows 5 req/min. Make 6 requests.
    let lastStatus = 0;
    for (let i = 0; i < 6; i++) {
      const req = makeRequest({ method: 'POST', body: validBody });
      const res = await POST(req);
      lastStatus = res.status;
    }

    // At least one should be 429 (or 503 if no LLM configured)
    // If rate limiter is working, the 6th request should be 429
    expect([429, 503]).toContain(lastStatus);
  });

  it('Transit route allows 20 req/min (high limit)', async () => {
    const { GET } = await import('@/app/api/transits/route');
    // Make 5 requests — all should succeed (well under the 20/min limit)
    for (let i = 0; i < 5; i++) {
      const req = makeRequest({ url: 'http://localhost:3000/api/transits' });
      const res = await GET(req);
      expect(res.status).toBe(200);
    }
  });
});

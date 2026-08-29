import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// ── Helpers ───────────────────────────────────────────────

/** Build the params argument the [token] route handler expects. */
function withParams(token: string) {
  return { params: Promise.resolve({ token }) };
}

/* ══════════════════════════════════════════════════════════════
   GET /api/gsc-verification/[token] — Search Console HTML-file
   ownership verification (fail-closed, env-backed)
   ══════════════════════════════════════════════════════════════ */
describe('GET /api/gsc-verification/[token]', () => {
  const ENV_KEY = 'GSC_VERIFICATION_TOKEN';

  beforeEach(() => {
    process.env[ENV_KEY] = 'testToken123';
  });

  afterEach(() => {
    delete process.env[ENV_KEY];
  });

  it('returns 200 with the exact verification body when token matches', async () => {
    const { GET } = await import('@/app/api/gsc-verification/[token]/route');
    const res = await GET(new Request('http://localhost:3000/'), withParams('testToken123'));
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/plain');
    expect(await res.text()).toBe('google-site-verification: googletestToken123.html\n');
  });

  it('accepts the full filename form google<token>.html as input', async () => {
    const { GET } = await import('@/app/api/gsc-verification/[token]/route');
    const res = await GET(new Request('http://localhost:3000/'), withParams('googletestToken123.html'));
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('google-site-verification: googletestToken123.html\n');
  });

  it('404s on a wrong token (fail-closed, no leakage)', async () => {
    const { GET } = await import('@/app/api/gsc-verification/[token]/route');
    const res = await GET(new Request('http://localhost:3000/'), withParams('wrongToken'));
    expect(res.status).toBe(404);
  });

  it('404s when the path token is empty after normalization', async () => {
    const { GET } = await import('@/app/api/gsc-verification/[token]/route');
    const res = await GET(new Request('http://localhost:3000/'), withParams('google.html'));
    expect(res.status).toBe(404);
  });

  it('404s for every token when GSC_VERIFICATION_TOKEN is unset (unclaimed site)', async () => {
    delete process.env[ENV_KEY];
    const { GET } = await import('@/app/api/gsc-verification/[token]/route');
    const res = await GET(new Request('http://localhost:3000/'), withParams('testToken123'));
    expect(res.status).toBe(404);
  });

  it('tolerates an env value stored with the google…html wrapper', async () => {
    process.env[ENV_KEY] = 'googletestToken123.html';
    const { GET } = await import('@/app/api/gsc-verification/[token]/route');
    const res = await GET(new Request('http://localhost:3000/'), withParams('testToken123'));
    expect(res.status).toBe(200);
  });
});

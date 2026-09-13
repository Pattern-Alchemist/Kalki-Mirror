import { describe, it, expect } from 'vitest';
import { parseBody } from '@/lib/api/parse-body';
import { z } from 'zod';

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #8 — parseBody runtime helper.
   The runtime half of the OpenAPI payload gate. Every shape
   failure becomes a typed 400 — never an unhandled throw.
   ══════════════════════════════════════════════════════════════ */

const testSchema = z.object({
  name: z.string().min(2).max(50),
  count: z.number().int().nonnegative(),
  tags: z.array(z.string()).optional(),
});

function fakeReq(body: unknown): Request {
  return new Request('https://example.com/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('parseBody — success path', () => {
  it('returns typed data on valid body', async () => {
    const r = await parseBody(fakeReq({ name: 'Alice', count: 5 }), testSchema);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.name).toBe('Alice');
      expect(r.data.count).toBe(5);
    }
  });

  it('preserves optional fields', async () => {
    const r = await parseBody(fakeReq({ name: 'Bob', count: 0, tags: ['x', 'y'] }), testSchema);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.data.tags).toEqual(['x', 'y']);
  });
});

describe('parseBody — invalid JSON', () => {
  it('returns 400 invalid_json for malformed body', async () => {
    const req = new Request('https://example.com/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json {{{',
    });
    const r = await parseBody(req, testSchema);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.res.status).toBe(400);
      const body = await r.res.json();
      expect(body.error).toBe('invalid_json');
    }
  });
});

describe('parseBody — schema violation', () => {
  it('returns 400 schema_violation with issue list', async () => {
    const r = await parseBody(fakeReq({ name: 'A', count: -1 }), testSchema);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.res.status).toBe(400);
      const body = await r.res.json();
      expect(body.error).toBe('schema_violation');
      expect(Array.isArray(body.issues)).toBe(true);
      expect(body.issues.length).toBe(2); // name too short, count negative
      for (const i of body.issues) {
        expect(typeof i.path).toBe('string');
        expect(typeof i.message).toBe('string');
      }
    }
  });

  it('path joins nested fields with dot notation', async () => {
    const nested = z.object({ user: z.object({ email: z.string().email() }) });
    const r = await parseBody(fakeReq({ user: { email: 'not-an-email' } }), nested);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const body = await r.res.json();
      expect(body.issues[0].path).toBe('user.email');
    }
  });

  it('missing required field surfaces in issues', async () => {
    const r = await parseBody(fakeReq({ name: 'Alice' }), testSchema); // missing count
    expect(r.ok).toBe(false);
    if (!r.ok) {
      const body = await r.res.json();
      expect(body.issues.some((i: { path: string }) => i.path === 'count')).toBe(true);
    }
  });

  it('extra unknown fields are passed through by default (zod .object is non-strict)', async () => {
    const r = await parseBody(fakeReq({ name: 'Alice', count: 1, extra: 'ignored' }), testSchema);
    expect(r.ok).toBe(true);
  });
});

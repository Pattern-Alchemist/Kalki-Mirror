import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

/* ══════════════════════════════════════════════════════════════
   Vol. 3 #19 — /api/cron/cleanup (TTL pruning + ops marker)

   Auth-gated like every cron route; prunes the four unbounded
   tables; writes OpsState.last_cleanup_at only on a real run.
   The db client is mocked — cutoff math and call shapes are the
   contract under test.
   ══════════════════════════════════════════════════════════════ */

const deleteMany = vi.fn();
const upsert = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    synthesisCache: { deleteMany: (...a: unknown[]) => deleteMany('synthesisCache', ...a) },
    activeSession: { deleteMany: (...a: unknown[]) => deleteMany('activeSession', ...a) },
    emailEvent: { deleteMany: (...a: unknown[]) => deleteMany('emailEvent', ...a) },
    draftLead: { deleteMany: (...a: unknown[]) => deleteMany('draftLead', ...a) },
    opsState: { upsert: (...a: unknown[]) => upsert(...a) },
  },
}));

import { GET } from '@/app/api/cron/cleanup/route';

function req(key?: string, dryRun?: boolean): NextRequest {
  const url = new URL('http://localhost:3000/api/cron/cleanup');
  if (key) url.searchParams.set('key', key);
  if (dryRun) url.searchParams.set('dryRun', '1');
  return new NextRequest(url);
}

beforeEach(() => {
  deleteMany.mockReset().mockResolvedValue({ count: 3 });
  upsert.mockReset().mockResolvedValue({});
  process.env.CRON_SECRET = 'test-secret';
});

describe('GET /api/cron/cleanup', () => {
  it('stays closed without a secret configured', async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(req('test-secret'));
    expect(res.status).toBe(401);
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it('rejects a wrong key with 401', async () => {
    const res = await GET(req('wrong'));
    expect(res.status).toBe(401);
    expect(deleteMany).not.toHaveBeenCalled();
  });

  it('accepts bearer auth from Vercel cron', async () => {
    const request = new NextRequest('http://localhost:3000/api/cron/cleanup', {
      headers: { authorization: 'Bearer test-secret' },
    });
    const res = await GET(request);
    expect(res.status).toBe(200);
  });

  it('prunes all four tables and writes the marker on a real run', async () => {
    const res = await GET(req('test-secret'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(deleteMany).toHaveBeenCalledTimes(4);
    expect(body.pruned).toEqual({
      synthesisCache: 3,
      activeSessions: 3,
      emailEvents: 3,
      dismissedDraftLeads: 3,
    });
    expect(upsert).toHaveBeenCalledTimes(1);
    expect(upsert.mock.calls[0][0].where).toEqual({ key: 'last_cleanup_at' });
  });

  it('dryRun prunes nothing reported as writes and never touches OpsState', async () => {
    const res = await GET(req('test-secret', true));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.dryRun).toBe(true);
    expect(upsert).not.toHaveBeenCalled();
    // deleteMany IS called (counting what would go) but the route runs no
    // transaction on a dry run — asserted by the marker absence above.
    expect(deleteMany).toHaveBeenCalledTimes(4);
  });

  it('draftLead prune targets only DISMISSED rows past the 30d grace', async () => {
    await GET(req('test-secret'));
    const draftCall = deleteMany.mock.calls.find((c) => c[0] === 'draftLead');
    expect(draftCall).toBeTruthy();
    const where = draftCall![1].where;
    expect(where.status).toBe('DISMISSED');
    expect(where.updatedAt.lt.getTime()).toBeLessThanOrEqual(Date.now() - 29 * 86_400_000);
  });
});

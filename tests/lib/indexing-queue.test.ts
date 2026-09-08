import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  planIndexingDiff,
  credentialGate,
  INDEXING_DAILY_CAP,
} from '@/lib/seo/indexing-queue';
import { REGISTERED_CRONS } from '@/lib/cron-ledger';

/* ═══════════════════════════════════════════════════════════════════════════
   Vol. 5 #12 — the GSC indexing queue: OAuth-ready. The diff planner is the
   brain (pure, pinned here); the credential gate keeps the runner honest
   while the founder-gated OAuth token has not landed; the registration pins
   keep the schedule contract mirrored.
   ═══════════════════════════════════════════════════════════════════════════ */

const EPOCH_1 = '2026-09-06';
const EPOCH_2 = '2026-09-13';

describe('planIndexingDiff: the nightly sitemap diff', () => {
  it('never-seen URLs queue as PENDING/new', () => {
    const plan = planIndexingDiff(
      [
        { url: 'https://x/archive/pranava-japa', epoch: EPOCH_1 },
        { url: 'https://x/archive/soham-dhyana', epoch: EPOCH_1 },
      ],
      [{ url: 'https://x/archive/pranava-japa', state: 'PENDING', lastmodEpoch: EPOCH_1 }],
    );
    expect(plan.inserts).toEqual([{ url: 'https://x/archive/soham-dhyana', reason: 'new' }]);
    expect(plan.changes).toEqual([]);
    expect(plan.removals).toEqual([]);
    expect(plan.unchanged).toBe(1);
  });

  it('an epoch bump re-queues known URLs as changed — but leaves fresh ones alone', () => {
    const known = [
      { url: 'https://x/a', state: 'SUBMITTED', lastmodEpoch: EPOCH_1 },
      { url: 'https://x/b', state: 'SUBMITTED', lastmodEpoch: EPOCH_2 },
    ];
    const plan = planIndexingDiff(
      [
        { url: 'https://x/a', epoch: EPOCH_2 },
        { url: 'https://x/b', epoch: EPOCH_2 },
      ],
      known,
    );
    expect(plan.inserts).toEqual([]);
    expect(plan.changes).toEqual([{ url: 'https://x/a', reason: 'changed' }]);
    expect(plan.unchanged).toBe(1);
  });

  it('REMOVED rows that return to the map re-queue as changed', () => {
    const plan = planIndexingDiff(
      [{ url: 'https://x/back', epoch: EPOCH_1 }],
      [{ url: 'https://x/back', state: 'REMOVED', lastmodEpoch: EPOCH_1 }],
    );
    expect(plan.inserts).toEqual([]);
    expect(plan.changes).toEqual([{ url: 'https://x/back', reason: 'changed' }]);
  });

  it('URLs that left the sitemap are marked for removal — never silently dropped', () => {
    const plan = planIndexingDiff(
      [{ url: 'https://x/kept', epoch: EPOCH_1 }],
      [
        { url: 'https://x/kept', state: 'SUBMITTED', lastmodEpoch: EPOCH_1 },
        { url: 'https://x/gone', state: 'SUBMITTED', lastmodEpoch: EPOCH_1 },
        { url: 'https://x/gone-pending', state: 'PENDING', lastmodEpoch: EPOCH_1 },
      ],
    );
    expect(plan.removals.map((r) => r.url).sort()).toEqual(['https://x/gone', 'https://x/gone-pending']);
  });

  it('an empty known table plans an insert for every current URL (the first run)', () => {
    const plan = planIndexingDiff(
      Array.from({ length: 289 }, (_, i) => ({ url: `https://x/u${i}`, epoch: EPOCH_1 })),
      [],
    );
    expect(plan.inserts).toHaveLength(289);
    expect(plan.unchanged).toBe(0);
  });

  it('SUBMITTED rows still re-queue on an epoch bump — submission is idempotent at the engine', () => {
    const plan = planIndexingDiff(
      [{ url: 'https://x/a', epoch: EPOCH_2 }],
      [{ url: 'https://x/a', state: 'SUBMITTED', lastmodEpoch: EPOCH_1 }],
    );
    expect(plan.changes).toEqual([{ url: 'https://x/a', reason: 'changed' }]);
  });
});

describe('credentialGate: the runner is honest about its mode', () => {
  it('no token → noop with the founder-facing reason', () => {
    const gate = credentialGate({});
    expect(gate.mode).toBe('noop');
    expect(gate.reason).toContain('oauth_pending');
    expect(gate.reason).toContain('GSC_ACCESS_TOKEN');
  });

  it('blank token is not a credential', () => {
    expect(credentialGate({ GSC_ACCESS_TOKEN: '   ' }).mode).toBe('noop');
  });

  it('a token lights the live path', () => {
    const gate = credentialGate({ GSC_ACCESS_TOKEN: 'ya29.test' });
    expect(gate.mode).toBe('live');
  });

  it('the daily cap stays an order of magnitude under the 2k/day quota', () => {
    expect(INDEXING_DAILY_CAP).toBeLessThanOrEqual(200);
    expect(INDEXING_DAILY_CAP).toBeGreaterThan(0);
  });
});

describe('gsc-indexing registration: the schedule contract', () => {
  it('mirrors vercel.json — registered at 40 2, after the digest', () => {
    expect(REGISTERED_CRONS['gsc-indexing']).toBeDefined();
    expect(REGISTERED_CRONS['gsc-indexing'].schedule).toBe('40 2 * * *');
    expect(REGISTERED_CRONS['gsc-indexing'].description).toContain('Vol. 5 #12');

    const vercel = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8')
    ) as { crons: Array<{ path: string; schedule: string }> };
    const mine = vercel.crons.find((c) => c.path === '/api/cron/gsc-indexing');
    expect(mine).toBeDefined();
    expect(mine!.schedule).toBe(REGISTERED_CRONS['gsc-indexing'].schedule);
  });
});

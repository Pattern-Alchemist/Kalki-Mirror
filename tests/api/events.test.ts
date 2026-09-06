import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

/* ══════════════════════════════════════════════════════════════
   Vol. 3 #18 — /api/events event-name enum gate

   Only the 22 names in EVENT_NAMES reach the analytics store;
   anything else is rejected 422 (a client bug or pollution attempt
   would otherwise land verbatim in the dashboards). The client
   tracker is fire-and-forget (void fetch), so the 422 never
   surfaces to a seeker.
   ══════════════════════════════════════════════════════════════ */

const recordEvent = vi.fn();

vi.mock('@/lib/analytics-db', () => ({
  recordEvent: (...args: unknown[]) => recordEvent(...args),
}));

import { POST } from '@/app/api/events/route';
import { EVENT_NAMES } from '@/lib/analytics-shared';

function req(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/events', {
    method: 'POST',
    body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  });
}

describe('POST /api/events — event-name enum gate', () => {
  beforeEach(() => {
    recordEvent.mockReset();
    recordEvent.mockResolvedValue(true);
  });

  it('accepts every name in the dictionary with 204 and stores it', async () => {
    for (const name of EVENT_NAMES) {
      const res = await POST(req({ event: name, path: '/x' }));
      expect(res.status).toBe(204);
    }
    expect(recordEvent).toHaveBeenCalledTimes(EVENT_NAMES.length);
  });

  it('rejects an unknown event name with 422 and stores nothing', async () => {
    const res = await POST(req({ event: 'totally_bogus_event' }));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe('Unknown event name');
    expect(body.known).toBe(EVENT_NAMES.length);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it('rejects a case-mangled known name (strict match, no normalization)', async () => {
    const res = await POST(req({ event: 'Folio_Viewed' }));
    expect(res.status).toBe(422);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it('non-string event stays a silent 204 (legacy shape tolerance)', async () => {
    const res = await POST(req({ event: 42 }));
    expect(res.status).toBe(204);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it('malformed JSON fails open with 204 (telemetry never errors to seekers)', async () => {
    const res = await POST('not-json{');
    expect(res.status).toBe(204);
    expect(recordEvent).not.toHaveBeenCalled();
  });

  it('storage failure still returns 204 (fail-open)', async () => {
    recordEvent.mockRejectedValueOnce(new Error('db down'));
    const res = await POST(req({ event: 'folio_viewed' }));
    expect(res.status).toBe(204);
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { outcomeForStatus, withAiRoute, observeAiRoute } from '@/lib/ai/observe';
import type { NextRequest } from 'next/server';

/* ═══════════════════════════════════════════════════════════════════════════
   Vol. 4 #17 — AI route observability: outcome mapping + wrapper contract.
   recordEvent is mocked so the tests assert exactly ONE well-formed event
   per call without touching storage.
   ═══════════════════════════════════════════════════════════════════════════ */

vi.mock('@/lib/analytics-db', () => ({
  recordEvent: vi.fn(async () => true),
}));

import { recordEvent } from '@/lib/analytics-db';
const recordEventMock = vi.mocked(recordEvent);

function fakeRequest(): NextRequest {
  return new Request('https://www.astrokalki.com/api/ai/explain', { method: 'POST' }) as unknown as NextRequest;
}

beforeEach(() => {
  recordEventMock.mockClear();
});

describe('outcomeForStatus', () => {
  it('maps 2xx to ok', () => {
    expect(outcomeForStatus(200)).toBe('ok');
    expect(outcomeForStatus(204)).toBe('ok');
  });

  it('maps the four AI-specific outcomes', () => {
    expect(outcomeForStatus(400)).toBe('invalid');
    expect(outcomeForStatus(429)).toBe('limited');
    expect(outcomeForStatus(503)).toBe('unconfigured');
    expect(outcomeForStatus(500)).toBe('error');
  });

  it('maps anything else to error', () => {
    expect(outcomeForStatus(401)).toBe('error');
    expect(outcomeForStatus(404)).toBe('error');
    expect(outcomeForStatus(418)).toBe('error');
  });
});

describe('observeAiRoute', () => {
  it('fires one event with latency_ms + outcome props and the route path', () => {
    observeAiRoute('ai_explain', '/api/ai/explain', 123.4, 'ok');
    expect(recordEventMock).toHaveBeenCalledTimes(1);
    const payload = recordEventMock.mock.calls[0][0];
    expect(payload.event).toBe('ai_explain');
    expect(payload.path).toBe('/api/ai/explain');
    expect(payload.properties).toEqual({ latency_ms: 123, outcome: 'ok' });
  });

  it('never records negative latency', () => {
    observeAiRoute('ai_ask', '/api/ai/ask', -50, 'ok');
    expect(recordEventMock.mock.calls[0][0].properties).toEqual({ latency_ms: 0, outcome: 'ok' });
  });
});

describe('withAiRoute', () => {
  it('returns the handler response untouched and records ok', async () => {
    const handler = vi.fn(async () => new Response('{"fine":true}', { status: 200 }));
    const res = await withAiRoute('ai_explain', '/api/ai/explain', fakeRequest(), handler);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('{"fine":true}');
    expect(recordEventMock).toHaveBeenCalledTimes(1);
    expect(recordEventMock.mock.calls[0][0].properties).toMatchObject({ outcome: 'ok' });
  });

  it('records limited for 429 and unconfigured for 503 without touching the body', async () => {
    const limited = vi.fn(async () => new Response('no', { status: 429 }));
    await withAiRoute('ai_search', '/api/ai/search', fakeRequest(), limited);
    expect(recordEventMock.mock.calls[0][0].properties).toMatchObject({ outcome: 'limited' });

    recordEventMock.mockClear();
    const unconf = vi.fn(async () => new Response('no key', { status: 503 }));
    await withAiRoute('ai_draft', '/api/ai/draft', fakeRequest(), unconf);
    expect(recordEventMock.mock.calls[0][0].properties).toMatchObject({ outcome: 'unconfigured' });
  });

  it('records error and rethrows when the handler throws', async () => {
    const boom = vi.fn(async () => {
      throw new Error('provider chain exhausted');
    });
    await expect(
      withAiRoute('ai_transit_interpretation', '/api/ai/transit-interpretation', fakeRequest(), boom),
    ).rejects.toThrow('provider chain exhausted');
    expect(recordEventMock).toHaveBeenCalledTimes(1);
    expect(recordEventMock.mock.calls[0][0].properties).toMatchObject({ outcome: 'error' });
  });
});

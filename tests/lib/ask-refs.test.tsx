// =============================================================
// KALKI — Ask referral sources tests (Vol. 5 #11)
// -------------------------------------------------------------
// The ask-surface entry points: pure helpers (normalizeAskRef,
// refFromBody, askParamsFromSearch), the observability seam (ref
// rides the ai_ask event properties), the aggregation (refs split
// lands in the war-room rollup), and the CTA bands render honest
// deep links (?ref=&q=) per surface.
// =============================================================
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToString } from 'react-dom/server';
import {
  ASK_REF_SOURCES,
  normalizeAskRef,
  refFromBody,
  askParamsFromSearch,
} from '@/lib/ai/ask-refs';
import { aggregateAiRouteStats, type AiEventRow } from '@/lib/ai/route-stats';
import { observeAiRoute } from '@/lib/ai/observe';
import { AskTheArchiveCTA } from '@/components/ask/AskTheArchiveCTA';

vi.mock('@/lib/analytics-db', () => ({
  recordEvent: vi.fn(async () => true),
}));

import { recordEvent } from '@/lib/analytics-db';
const recordEventMock = vi.mocked(recordEvent);

beforeEach(() => {
  recordEventMock.mockClear();
});

describe('normalizeAskRef / refFromBody', () => {
  it('keeps the vocabulary closed', () => {
    expect(ASK_REF_SOURCES).toEqual(['library', 'patterns', 'codex', 'ask_page']);
    for (const r of ASK_REF_SOURCES) {
      expect(normalizeAskRef(r)).toBe(r);
    }
  });

  it('degrades anything unknown to undefined (a direct ask, never a 400)', () => {
    expect(normalizeAskRef(undefined)).toBeUndefined();
    expect(normalizeAskRef(null)).toBeUndefined();
    expect(normalizeAskRef('')).toBeUndefined();
    expect(normalizeAskRef('nope')).toBeUndefined();
    expect(normalizeAskRef(42)).toBeUndefined();
    expect(normalizeAskRef({ ref: 'library' })).toBeUndefined();
  });

  it('refFromBody tolerates any shape', () => {
    expect(refFromBody({ ref: 'patterns' })).toBe('patterns');
    expect(refFromBody({ ref: 'garbage' })).toBeUndefined();
    expect(refFromBody({})).toBeUndefined();
    expect(refFromBody(null)).toBeUndefined();
    expect(refFromBody('not an object')).toBeUndefined();
    expect(refFromBody(undefined)).toBeUndefined();
    expect(refFromBody({ nested: { ref: 'codex' } })).toBeUndefined();
  });
});

describe('askParamsFromSearch (AskForm prefill)', () => {
  it('parses q + ref from the CTA deep link', () => {
    const search = `?ref=patterns&q=${encodeURIComponent('How do I interrupt the rescuer loop?')}`;
    expect(askParamsFromSearch(search)).toEqual({
      ref: 'patterns',
      q: 'How do I interrupt the rescuer loop?',
    });
  });

  it('trims q, caps it at the contract length, drops empty parts', () => {
    expect(askParamsFromSearch('?q=   ')).toEqual({});
    expect(askParamsFromSearch('?ref=library')).toEqual({ ref: 'library' });
    expect(askParamsFromSearch(`?q=${'x'.repeat(600)}`).q?.length).toBe(500);
  });

  it('survives garbage search strings and unknown refs', () => {
    expect(askParamsFromSearch('?ref=garbage&q=valid question')).toEqual({
      q: 'valid question',
    });
    expect(askParamsFromSearch('not-a-search%%')).toEqual({});
    expect(askParamsFromSearch('')).toEqual({});
  });
});

describe('observability seam', () => {
  it('observeAiRoute carries the ref in the event properties', () => {
    observeAiRoute('ai_ask', '/api/ai/ask', 1500, 'ok', 'library');
    expect(recordEventMock).toHaveBeenCalledTimes(1);
    const payload = recordEventMock.mock.calls[0][0];
    expect(payload.properties).toEqual({ latency_ms: 1500, outcome: 'ok', ref: 'library' });
  });

  it('omits the ref property for direct asks (backward-compatible shape)', () => {
    observeAiRoute('ai_ask', '/api/ai/ask', 900, 'ok');
    const props = recordEventMock.mock.calls[0][0].properties as Record<string, unknown>;
    expect(props).toEqual({ latency_ms: 900, outcome: 'ok' });
    expect('ref' in props).toBe(false);
  });
});

describe('aggregateAiRouteStats — refs split', () => {
  const rows: AiEventRow[] = [
    { event: 'ai_ask', properties: JSON.stringify({ latency_ms: 100, outcome: 'ok', ref: 'library' }), createdAt: '2026-09-08 01:00:00' },
    { event: 'ai_ask', properties: JSON.stringify({ latency_ms: 200, outcome: 'ok', ref: 'library' }), createdAt: '2026-09-08 02:00:00' },
    { event: 'ai_ask', properties: JSON.stringify({ latency_ms: 300, outcome: 'ok', ref: 'patterns' }), createdAt: '2026-09-08 03:00:00' },
    { event: 'ai_ask', properties: JSON.stringify({ latency_ms: 400, outcome: 'ok' }), createdAt: '2026-09-08 04:00:00' },
  ];

  it('splits ai_ask calls by referral source', () => {
    const [stat] = aggregateAiRouteStats(rows, ['ai_ask']);
    expect(stat.refs).toEqual({ library: 2, patterns: 1 });
    expect(stat.calls).toBe(4);
  });

  it('omits refs entirely when no call carried one', () => {
    const rowsNoRef: AiEventRow[] = rows.map((r) => ({
      ...r,
      properties: JSON.stringify({ latency_ms: 100, outcome: 'ok' }),
    }));
    const [stat] = aggregateAiRouteStats(rowsNoRef, ['ai_ask']);
    expect(stat.refs).toBeUndefined();
  });

  it('counts calls with malformed JSON but skips their props', () => {
    const mixed: AiEventRow[] = [
      ...rows,
      { event: 'ai_ask', properties: '{broken', createdAt: '2026-09-08 05:00:00' },
    ];
    const [stat] = aggregateAiRouteStats(mixed, ['ai_ask']);
    expect(stat.calls).toBe(5);
    expect(stat.refs).toEqual({ library: 2, patterns: 1 });
  });
});

describe('AskTheArchiveCTA — the invitation bands', () => {
  it('deep-links examples with the surface ref and prefilled question', () => {
    const html = renderToString(<AskTheArchiveCTA surface="patterns" />);
    expect(html).toContain('href="/ask?ref=patterns&amp;q=');
    expect(html).toContain('How do I interrupt the rescuer loop?');
    expect(html).toContain('href="/ask?ref=patterns"');
  });

  it('each surface carries distinct, surface-aware copy', () => {
    const lib = renderToString(<AskTheArchiveCTA surface="library" />);
    const pat = renderToString(<AskTheArchiveCTA surface="patterns" />);
    const codex = renderToString(<AskTheArchiveCTA surface="codex" />);
    expect(lib).toContain('ajapa japa');
    expect(pat).toContain('rescuer');
    expect(codex).toContain('dhāraṇā');
    expect(lib).not.toContain('rescuer');
    expect(codex).not.toContain('ajapa');
  });

  it('encodes special characters in the question param', () => {
    const html = renderToString(<AskTheArchiveCTA surface="codex" />);
    expect(html).toContain(encodeURIComponent('What is the difference between dhāraṇā and dhyāna?'));
  });
});

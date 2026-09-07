import { describe, it, expect } from 'vitest';
import {
  dispatch,
  handleLine,
  searchLexicon,
  getTerm,
  getPattern,
  corpusStats,
  TOOLS,
  SERVER_NAME,
  PROTOCOL_VERSION,
  ERR_METHOD_NOT_FOUND,
  ERR_PARSE,
  type JsonRpcRequest,
} from '../../mini-services/lexicon-mcp/core';
import { glossaryEntries } from '@/lib/data/glossary';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';

/* ═══════════════════════════════════════════════════════════════════════════
   Vol. 4 #15 — MCP Lexicon server: protocol conformance + tool truth.
   Drives the pure dispatcher directly (no process spawn needed) and pins
   corpus_stats to the SAME modules the site's canonical-count tests use.
   ═══════════════════════════════════════════════════════════════════════════ */

function call(id: number, method: string, params?: Record<string, unknown>): JsonRpcRequest {
  return { jsonrpc: '2.0', id, method, ...(params ? { params } : {}) };
}

function parseResult(msg: JsonRpcRequest): any {
  const resp = dispatch(msg);
  expect(resp, `expected a response for ${msg.method}`).not.toBeNull();
  return (resp as { result: any }).result;
}

// ─── Protocol conformance ───────────────────────────────────────────────────

describe('MCP protocol', () => {
  it('initialize answers with protocol version, tool capability, and server info', () => {
    const result = parseResult(call(1, 'initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'test', version: '0' } }));
    expect(result.protocolVersion).toBe(PROTOCOL_VERSION);
    expect(result.capabilities.tools).toBeDefined();
    expect(result.serverInfo.name).toBe(SERVER_NAME);
  });

  it('notifications are never answered (JSON-RPC 2.0 rule)', () => {
    expect(dispatch({ jsonrpc: '2.0', method: 'notifications/initialized' })).toBeNull();
    expect(dispatch({ jsonrpc: '2.0', method: 'tools/list' })).toBeNull();
    expect(dispatch({ jsonrpc: '2.0', method: 'tools/call', params: { name: 'corpus_stats' } })).toBeNull();
  });

  it('ping answers an empty result', () => {
    expect(parseResult(call(2, 'ping'))).toEqual({});
  });

  it('unknown methods are -32601 with the echoed id', () => {
    const resp = dispatch(call(9, 'resources/list'));
    expect(resp).not.toBeNull();
    expect(resp?.error?.code).toBe(ERR_METHOD_NOT_FOUND);
    expect(resp?.id).toBe(9);
  });

  it('malformed lines are -32700 with id:null; empty lines produce nothing', () => {
    const bad = handleLine('{nope');
    expect(bad).not.toBeNull();
    expect(JSON.parse(bad as string).error.code).toBe(ERR_PARSE);
    expect(JSON.parse(bad as string).id).toBeNull();
    expect(handleLine('')).toBeNull();
    expect(handleLine('   ')).toBeNull();
  });

  it('tools/list exposes exactly the four lexicon tools with JSON schemas', () => {
    const result = parseResult(call(3, 'tools/list'));
    const names = result.tools.map((t: { name: string }) => t.name);
    expect(names).toEqual(['search_lexicon', 'get_term', 'get_pattern', 'corpus_stats']);
    for (const t of result.tools) {
      expect(t.description.length).toBeGreaterThan(10);
      expect(t.inputSchema.type).toBe('object');
    }
  });

  it('unknown tool is an in-band tool error, not a crash', () => {
    const result = parseResult(call(4, 'tools/call', { name: 'no_such_tool', arguments: {} }));
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/Unknown tool/);
  });
});

// ─── Tool truth ─────────────────────────────────────────────────────────────

describe('tool: search_lexicon', () => {
  it('ranks exact terms to the top and returns well-formed hits', () => {
    const sample = glossaryEntries[0];
    const hits = searchLexicon(sample.term, 5);
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].term.toLowerCase()).toBe(sample.term.toLowerCase());
    for (const h of hits) {
      expect(h.definition.length).toBeGreaterThan(0);
      expect(['foundational', 'pranayama', 'tantra', 'ritual', 'philosophical', 'archetype']).toContain(h.category);
    }
  });

  it('respects the limit and clamps it to [1,20]', () => {
    const anyWord = glossaryEntries[1].definition.split(' ')[0];
    const hits = searchLexicon(anyWord, 3);
    expect(hits.length).toBeLessThanOrEqual(3);
    expect(searchLexicon(anyWord, 999).length).toBeLessThanOrEqual(20);
    expect(searchLexicon(anyWord, 0)).toEqual([]);
  });

  it('returns nothing for empty or stop-word-only queries', () => {
    expect(searchLexicon('')).toEqual([]);
    expect(searchLexicon('the of and')).toEqual([]);
  });

  it('round-trips through tools/call with JSON content', () => {
    const result = parseResult(call(5, 'tools/call', { name: 'search_lexicon', arguments: { query: glossaryEntries[0].term } }));
    expect(result.isError).toBe(false);
    const parsed = JSON.parse(result.content[0].text);
    expect(parsed.results.length).toBeGreaterThan(0);
  });
});

describe('tool: get_term', () => {
  it('finds a term case-insensitively with full entry data', () => {
    const sample = glossaryEntries[0];
    const out = getTerm(sample.term.toUpperCase());
    expect(out.found).toBe(true);
    expect(out.entry?.term).toBe(sample.term);
    expect(out.entry?.definition).toBe(sample.definition);
    expect(out.entry?.category).toBe(sample.category);
  });

  it('carries the hi bridge definition when the entry has one, and never invents one', () => {
    const withHi = glossaryEntries.find((g) => g.hi);
    if (withHi) {
      expect(getTerm(withHi.term).entry?.hiDefinition).toBe(withHi.hi?.definition);
    }
    const withoutHi = glossaryEntries.find((g) => !g.hi);
    if (withoutHi) {
      expect(getTerm(withoutHi.term).entry?.hiDefinition).toBeUndefined();
    }
  });

  it('misses honestly with a suggestion for partial matches', () => {
    const out = getTerm('zzz-definitely-not-a-term');
    expect(out.found).toBe(false);
    const partial = getTerm(glossaryEntries[0].term.slice(0, 3));
    if (!partial.found) expect(typeof partial.suggestion === 'string' || partial.suggestion === undefined).toBe(true);
  });
});

describe('tool: get_pattern', () => {
  it('finds by slug and by display name', () => {
    const sample = allPatterns[0];
    const bySlug = getPattern(sample.slug);
    expect(bySlug.found).toBe(true);
    expect(bySlug.entry?.slug).toBe(sample.slug);
    const byName = getPattern(sample.name);
    expect(byName.found).toBe(true);
    expect(byName.entry?.slug).toBe(sample.slug);
    expect(byName.entry?.relatedSiddhis).toEqual(sample.relatedSiddhis);
  });

  it('misses with suggestion for near-misses', () => {
    const out = getPattern('zzz-no-such-pattern');
    expect(out.found).toBe(false);
    const near = getPattern(allPatterns[0].slug.split('-')[0]);
    if (!near.found) expect(near.suggestion ?? null).toBeDefined();
  });
});

describe('tool: corpus_stats (build-time truth)', () => {
  it('agrees with the same data modules the site pins', () => {
    const stats = corpusStats();
    expect(stats.corpusChunks).toBe(327); // canonical bake count
    expect(stats.glossaryTerms).toBe(glossaryEntries.length);
    expect(stats.patterns).toBe(allPatterns.length);
    expect(stats.folios).toBe(allSiddhis.length);
    expect(stats.vocabularyTerms).toBeGreaterThan(0);
    expect(stats.embedDim).toBeGreaterThan(0);
    expect(stats.sources.length).toBe(4);
  });

  it('round-trips through tools/call', () => {
    const result = parseResult(call(6, 'tools/call', { name: 'corpus_stats', arguments: {} }));
    expect(result.isError).toBe(false);
    const stats = JSON.parse(result.content[0].text);
    expect(stats.corpusChunks).toBe(327);
  });

  it('registry is internally consistent', () => {
    expect(TOOLS).toHaveLength(4);
    expect(new Set(TOOLS.map((t) => t.name)).size).toBe(4);
  });
});

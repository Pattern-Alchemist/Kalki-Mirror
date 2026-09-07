/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — MCP Lexicon server · core (Vol. 4 #15)
   ---------------------------------------------------------------------------
   Pure tool implementations + JSON-RPC/MCP dispatcher. NO server-only
   imports: everything here reads the SAME build-time data modules the site
   reads (src/lib/data/glossary.ts, patterns.ts, siddhis.ts) plus the
   bake-derived corpus truth (src/lib/rag/idf-generated.ts). Authoring-side
   only — zero runtime exposure, zero network, zero DB.

   The dispatcher is protocol-pure so tests can drive full MCP conversations
   (initialize → tools/list → tools/call) in vitest without spawning a
   process; server.ts only wires this dispatch to stdio.
   ═══════════════════════════════════════════════════════════════════════════ */

import { glossaryEntries } from '../../src/lib/data/glossary';
import { allPatterns } from '../../src/lib/data/patterns';
import { allSiddhis } from '../../src/lib/data/siddhis';
import { CORPUS_SIZE, EMBED_MODEL as BAKE_EMBED_MODEL, EMBED_DIM, IDF } from '../../src/lib/rag/idf-generated';

export const SERVER_NAME = 'kalki-lexicon-mcp';
export const SERVER_VERSION = '1.0.0';
export const PROTOCOL_VERSION = '2024-11-05';

// ─── JSON-RPC framing types ────────────────────────────────────────────────

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

const ERR_PARSE = -32700;
const ERR_INVALID_REQUEST = -32600;
const ERR_METHOD_NOT_FOUND = -32601;
const ERR_INVALID_PARAMS = -32602;

// ─── Tool: search_lexicon ──────────────────────────────────────────────────

export interface LexiconHit {
  term: string;
  sanskrit?: string;
  category: string;
  definition: string;
  relatedTerms?: string[];
  score: number;
}

const STOP = new Set([
  'the', 'a', 'an', 'of', 'in', 'to', 'and', 'or', 'is', 'are', 'what',
  'which', 'who', 'how', 'does', 'do', 'for', 'with', 'on', 'it', 'its',
]);

/**
 * Score glossary entries against a free-text query. Exact term match
 * dominates, then substring, then definition-term overlap. Pure.
 */
export function searchLexicon(query: string, limit = 8): LexiconHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const capped = Math.max(1, Math.min(20, Math.floor(limit)));
  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));

  const hits: LexiconHit[] = [];
  for (const g of glossaryEntries) {
    const term = g.term.toLowerCase();
    const sanskrit = (g.sanskrit ?? '').toLowerCase();
    let score = 0;
    if (term === q) score += 100;
    else if (term.includes(q)) score += 40;
    if (sanskrit && (sanskrit === q || sanskrit.includes(q))) score += 25;
    const defLower = g.definition.toLowerCase();
    for (const w of words) {
      if (term.includes(w)) score += 8;
      if (sanskrit.includes(w)) score += 4;
      if (defLower.includes(w)) score += 2;
    }
    if (score > 0) {
      hits.push({
        term: g.term,
        ...(g.sanskrit ? { sanskrit: g.sanskrit } : {}),
        category: g.category,
        definition: g.definition,
        ...(g.relatedTerms ? { relatedTerms: g.relatedTerms } : {}),
        score,
      });
    }
  }
  return hits.sort((a, b) => b.score - a.score || a.term.localeCompare(b.term)).slice(0, capped);
}

// ─── Tool: get_term ────────────────────────────────────────────────────────

export interface TermLookup {
  found: boolean;
  term: string;
  entry?: {
    term: string;
    sanskrit?: string;
    pronunciation?: string;
    definition: string;
    category: string;
    relatedTerms?: string[];
    relatedSiddhiSlugs?: string[];
    hiDefinition?: string; // Vol. 4 #13 hi corpus bridge (top-20 terms)
  };
  suggestion?: string;
}

/** Exact-ish lookup by term or Sanskrit (case-insensitive). Pure. */
export function getTerm(term: string): TermLookup {
  const t = term.trim().toLowerCase();
  if (!t) return { found: false, term };
  const g = glossaryEntries.find(
    (e) =>
      e.term.toLowerCase() === t ||
      (e.sanskrit ?? '').toLowerCase() === t,
  );
  if (g) {
    return {
      found: true,
      term: g.term,
      entry: {
        term: g.term,
        ...(g.sanskrit ? { sanskrit: g.sanskrit } : {}),
        ...(g.pronunciation ? { pronunciation: g.pronunciation } : {}),
        definition: g.definition,
        category: g.category,
        ...(g.relatedTerms ? { relatedTerms: g.relatedTerms } : {}),
        ...(g.relatedSiddhiSlugs ? { relatedSiddhiSlugs: g.relatedSiddhiSlugs } : {}),
        ...(g.hi ? { hiDefinition: g.hi.definition } : {}),
      },
    };
  }
  // One honest suggestion: the best substring match, if any.
  const partial = glossaryEntries.find((e) => e.term.toLowerCase().includes(t));
  return { found: false, term, ...(partial ? { suggestion: partial.term } : {}) };
}

// ─── Tool: get_pattern ─────────────────────────────────────────────────────

export interface PatternLookup {
  found: boolean;
  pattern: string;
  entry?: {
    slug: string;
    name: string;
    subtitle: string;
    description: string;
    signs: string[];
    origin: string;
    practice: string;
    relatedSiddhis: string[];
    minTier?: string;
    archetypeIntegration?: string;
  };
  suggestion?: string;
}

/** Lookup by slug or name (case-insensitive). Pure. */
export function getPattern(pattern: string): PatternLookup {
  const p = pattern.trim().toLowerCase();
  if (!p) return { found: false, pattern };
  const pat = allPatterns.find(
    (x) => x.slug === p || x.slug.replace(/-/g, ' ') === p || x.name.toLowerCase() === p,
  );
  if (pat) {
    return {
      found: true,
      pattern: pat.slug,
      entry: {
        slug: pat.slug,
        name: pat.name,
        subtitle: pat.subtitle,
        description: pat.description,
        signs: pat.signs,
        origin: pat.origin,
        practice: pat.practice,
        relatedSiddhis: pat.relatedSiddhis,
        ...(pat.minTier ? { minTier: pat.minTier } : {}),
        ...(pat.archetypeIntegration ? { archetypeIntegration: pat.archetypeIntegration } : {}),
      },
    };
  }
  const partial = allPatterns.find((x) => x.name.toLowerCase().includes(p) || x.slug.includes(p));
  return { found: false, pattern, ...(partial ? { suggestion: partial.slug } : {}) };
}

// ─── Tool: corpus_stats ────────────────────────────────────────────────────

export interface CorpusStats {
  corpusChunks: number;
  vocabularyTerms: number;
  embedModel: string;
  embedDim: number;
  glossaryTerms: number;
  patterns: number;
  folios: number;
  sources: string[];
}

/**
 * Build-time truth only — the same numbers the site's canonical-count tests
 * pin (corpus 327 since the 2026-09-06 re-bake; 86 lexicon terms). No DB,
 * no network: the MCP server never touches runtime state.
 */
export function corpusStats(): CorpusStats {
  return {
    corpusChunks: CORPUS_SIZE,
    vocabularyTerms: Object.keys(IDF).length,
    embedModel: BAKE_EMBED_MODEL,
    embedDim: EMBED_DIM,
    glossaryTerms: glossaryEntries.length,
    patterns: allPatterns.length,
    folios: allSiddhis.length,
    sources: [
      'src/lib/data/glossary.ts',
      'src/lib/data/patterns.ts',
      'src/lib/data/siddhis.ts',
      'src/lib/rag/idf-generated.ts',
    ],
  };
}

// ─── Tool registry ─────────────────────────────────────────────────────────

export interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, unknown>) => unknown;
}

export const TOOLS: ToolDef[] = [
  {
    name: 'search_lexicon',
    description:
      'Search the KALKI lexicon (86 Sanskrit/Tantric terms) for entries relevant to a query. Exact term matches dominate; definition overlap breaks ties.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1, description: 'Free-text query' },
        limit: { type: 'integer', minimum: 1, maximum: 20, default: 8 },
      },
      required: ['query'],
    },
    run: (args) => {
      const query = args.query;
      if (typeof query !== 'string') throw new Error('query must be a string');
      const limit = typeof args.limit === 'number' ? args.limit : 8;
      return { query, results: searchLexicon(query, limit) };
    },
  },
  {
    name: 'get_term',
    description:
      'Get one lexicon term by English term or Sanskrit (case-insensitive), including its definition, category, related terms, linked folio slugs, and the Hindi bridge definition where present.',
    inputSchema: {
      type: 'object',
      properties: { term: { type: 'string', minLength: 1 } },
      required: ['term'],
    },
    run: (args) => {
      const term = args.term;
      if (typeof term !== 'string') throw new Error('term must be a string');
      return getTerm(term);
    },
  },
  {
    name: 'get_pattern',
    description:
      'Get one behavioral pattern by slug or name (case-insensitive): description, signs, origin, practice, linked folio slugs, minimum tier.',
    inputSchema: {
      type: 'object',
      properties: { pattern: { type: 'string', minLength: 1 } },
      required: ['pattern'],
    },
    run: (args) => {
      const pattern = args.pattern;
      if (typeof pattern !== 'string') throw new Error('pattern must be a string');
      return getPattern(pattern);
    },
  },
  {
    name: 'corpus_stats',
    description:
      'Corpus truth for authoring: chunk count, vocabulary size, embedder identity, glossary/pattern/folio counts. Build-time data only.',
    inputSchema: { type: 'object', properties: {} },
    run: () => corpusStats(),
  },
];

// ─── MCP dispatch ──────────────────────────────────────────────────────────

function toolListResult() {
  return {
    tools: TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    })),
  };
}

function toolCallResult(name: unknown, args: unknown): JsonRpcResponse['result'] {
  if (typeof name !== 'string') {
    return {
      content: [{ type: 'text', text: 'Invalid tool name.' }],
      isError: true,
    };
  }
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${name}. Known tools: ${TOOLS.map((t) => t.name).join(', ')}.` }],
      isError: true,
    };
  }
  try {
    const out = tool.run((args ?? {}) as Record<string, unknown>);
    return {
      content: [{ type: 'text', text: JSON.stringify(out, null, 2) }],
      isError: false,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Tool execution failed.';
    return { content: [{ type: 'text', text: msg }], isError: true };
  }
}

/**
 * Dispatch one MCP/JSON-RPC message. Returns the response object, or null
 * for notifications (messages without an id) — which MUST NOT be answered
 * per JSON-RPC 2.0.
 */
export function dispatch(msg: JsonRpcRequest): JsonRpcResponse | null {
  if (typeof msg.method !== 'string') {
    return { jsonrpc: '2.0', id: msg.id ?? null, error: { code: ERR_INVALID_REQUEST, message: 'Invalid Request: method must be a string' } };
  }
  const id = msg.id ?? null;
  const isNotification = msg.id === undefined || msg.id === null;

  switch (msg.method) {
    case 'initialize':
      if (isNotification) return null;
      return {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
        },
      };
    case 'notifications/initialized':
      return null; // notification — never answered
    case 'ping':
      if (isNotification) return null;
      return { jsonrpc: '2.0', id, result: {} };
    case 'tools/list':
      if (isNotification) return null;
      return { jsonrpc: '2.0', id, result: toolListResult() };
    case 'tools/call': {
      if (isNotification) return null;
      const params = (msg.params ?? {}) as { name?: unknown; arguments?: unknown };
      return { jsonrpc: '2.0', id, result: toolCallResult(params.name, params.arguments) };
    }
    default:
      if (isNotification) return null;
      return {
        jsonrpc: '2.0',
        id,
        error: { code: ERR_METHOD_NOT_FOUND, message: `Method not found: ${msg.method}` },
      };
  }
}

/**
 * Frame-level entry: parse one stdin line and dispatch. Invalid JSON
 * produces a -32700 error with id:null (JSON-RPC 2.0 rules). Never throws.
 */
export function handleLine(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;
  let msg: JsonRpcRequest;
  try {
    msg = JSON.parse(trimmed) as JsonRpcRequest;
  } catch {
    return JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: ERR_PARSE, message: 'Parse error' },
    });
  }
  const resp = dispatch(msg);
  return resp ? JSON.stringify(resp) : null;
}

export { ERR_PARSE, ERR_INVALID_REQUEST, ERR_METHOD_NOT_FOUND, ERR_INVALID_PARAMS };

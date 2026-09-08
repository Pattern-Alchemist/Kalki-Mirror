import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/* ═══════════════════════════════════════════════════════════════════════════
   Vol. 5 #19 — OpenAPI truth II: the DOCUMENTATION census.
   
   The Vol. 3 #20 gate pins the FILE against the filesystem (path-set +
   method equality, both directions). This census pins the COVERAGE
   QUALITY: every documented (path, method) must carry a real summary —
   an operationId, a declared tag, and a hand-audited description of the
   contract. The auto-generated stub era ("Route module — see src",
   "Auto-documented; enrich by hand") is over: a stub may never return,
   and the 22-route tail the census uncovered was upgraded to real
   summaries in the same commit.
   ═══════════════════════════════════════════════════════════════════════════ */

const YAML_FILE = path.join(process.cwd(), 'docs', 'api', 'openapi.yaml');

interface DocumentedOp {
  path: string;
  method: string;
  summary: string | null;
  operationId: string | null;
  tags: string[] | null;
}

function parseOperations(): DocumentedOp[] {
  const lines = fs.readFileSync(YAML_FILE, 'utf8').split('\n');
  const ops: DocumentedOp[] = [];
  let currentPath: string | null = null;
  let currentMethod: string | null = null;
  let inPaths = false;
  for (const line of lines) {
    if (line === 'paths:') {
      inPaths = true;
      continue;
    }
    if (inPaths && line === 'components:') break;
    const pathMatch = line.match(/^  (\/\S+):\s*$/);
    if (pathMatch) {
      currentPath = pathMatch[1];
      currentMethod = null;
      continue;
    }
    const methodMatch = line.match(/^    (get|post|put|patch|delete|head|options):\s*$/);
    if (methodMatch && currentPath) {
      currentMethod = methodMatch[1].toUpperCase();
      ops.push({ path: currentPath, method: currentMethod!, summary: null, operationId: null, tags: null });
      continue;
    }
    if (!currentPath || !currentMethod || ops.length === 0) continue;
    const op = ops[ops.length - 1];
    const summaryMatch = line.match(/^      summary: (.+)$/);
    if (summaryMatch && op.summary === null) op.summary = summaryMatch[1];
    const idMatch = line.match(/^      operationId: (.+)$/);
    if (idMatch && op.operationId === null) op.operationId = idMatch[1];
    const tagMatch = line.match(/^      tags: \[(.+?)\]/);
    if (tagMatch && op.tags === null) {
      op.tags = tagMatch[1].split(',').map((t) => t.trim());
    }
  }
  return ops;
}

const STUB_MARKERS = ['Auto-documented', 'enrich by hand', 'Route module — see src'];

describe('openapi census II: the documentation coverage gate (Vol. 5 #19)', () => {
  const ops = parseOperations();

  it('censuses a real population (the yaml has 60+ documented operations)', () => {
    expect(ops.length).toBeGreaterThanOrEqual(60);
    expect(new Set(ops.map((o) => o.path)).size).toBeGreaterThanOrEqual(50);
  });

  it('every operation carries a summary, an operationId and a declared tag', () => {
    const missing = ops
      .filter((o) => !o.summary || !o.operationId || !o.tags || o.tags.length === 0)
      .map((o) => `${o.method} ${o.path}: summary=${!!o.summary} id=${!!o.operationId} tags=${!!o.tags}`);
    expect(missing, `undocumented operations:\n${missing.join('\n')}`).toEqual([]);
  });

  it('no auto-generated stub survives — the summaries are real contracts', () => {
    const stubs = ops
      .filter((o) => o.summary && (STUB_MARKERS.some((m) => o.summary!.includes(m)) || o.summary!.length < 24))
      .map((o) => `${o.method} ${o.path}: "${o.summary}"`);
    expect(stubs, `stub summaries must be upgraded to real contracts:\n${stubs.join('\n')}`).toEqual([]);
  });

  it('every summary actually names its surface or its contract (auditable prose, not filler)', () => {
    // A summary that never mentions anything content-bearing is filler.
    // The hand-written core section is deliberately concise — the floor
    // is three content-bearing words, not prose-length.
    const filler = ops
      .filter((o) => {
        if (!o.summary) return false;
        const words = o.summary.split(/\s+/).filter((w) => w.replace(/[^a-zA-Zāīūṛṣṇñ-]/g, '').length >= 5);
        return words.length < 3;
      })
      .map((o) => `${o.method} ${o.path}: "${o.summary}"`);
    expect(filler, `filler summaries:\n${filler.join('\n')}`).toEqual([]);
  });

  it('the newly censused tail carries its real contracts (spot pins)', () => {
    const byPath = new Map(ops.map((o) => [`${o.method} ${o.path}`, o]));
    const spot = (key: string, mustContain: string[]) => {
      const op = byPath.get(key);
      expect(op, `${key} documented`).toBeDefined();
      for (const frag of mustContain) {
        expect(op!.summary!, `${key} summary mentions "${frag}"`).toContain(frag);
      }
    };
    spot('GET /api/admin/stats', ['war-room']);
    spot('GET /api/cron/daily-digest', ['dryRun']);
    spot('POST /api/indexnow', ['open relay']);
    spot('GET /api/cron/prewarm-ask', ['ask-cache']);
    spot('GET /api/cron/gsc-indexing', ['OAuth']);
    spot('GET /api/search-index', ['Vol. 5 #18']);
    spot('GET /api/glossary-index', ['Vol. 5 #18']);
  });
});

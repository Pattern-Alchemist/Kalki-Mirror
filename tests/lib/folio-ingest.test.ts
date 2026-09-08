import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  validateFolioJson,
  planIngest,
  FOLIO_SECTIONS,
  CAUTION_LEVELS,
  MIN_CHUNK_CHARS,
  type FolioJson,
} from '@/lib/rag/folio-ingest';
import {
  computeBakePending,
  CORPUS_ENTRY_TYPES,
  type BakePendingEntry,
} from '@/lib/admin/bake-pending';

/**
 * Vol. 5 #7 — the corpus bake one-command path. The bake ritual lived
 * as archaeology across three worklogs; the WRITE path did not exist.
 * Pinned here: the pure ingest contract (validation + plan), the
 * bake-pending diff (studio ContentEntry vs baked FolioChunk), and the
 * fs-truth of the orchestrator + war-room wiring.
 */

const GOOD_FOLIO: FolioJson = {
  slug: 'test-folio',
  caution: 'OPEN',
  sections: [
    { section: 'summary', text: 'A'.repeat(MIN_CHUNK_CHARS + 1) },
    { section: 'warnings', text: 'B'.repeat(MIN_CHUNK_CHARS + 1) },
  ],
};

describe('validateFolioJson — the pure contract', () => {
  it('accepts a well-formed folio and normalizes nothing (input stays verbatim)', () => {
    const v = validateFolioJson(GOOD_FOLIO);
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.folio.slug).toBe('test-folio');
  });

  it('accepts an optional archetype and rejects malformed ones', () => {
    const withArchetype = { ...GOOD_FOLIO, archetype: 'bagalamukhi' };
    expect(validateFolioJson(withArchetype).ok).toBe(true);
    const bad = { ...GOOD_FOLIO, archetype: 42 };
    expect(validateFolioJson(bad).ok).toBe(false);
  });

  it('rejects non-kebab slugs, unknown cautions, unknown sections', () => {
    expect(validateFolioJson({ ...GOOD_FOLIO, slug: 'Bad Slug!' }).ok).toBe(false);
    expect(validateFolioJson({ ...GOOD_FOLIO, caution: 'MAYBE' }).ok).toBe(false);
    const badSection = { ...GOOD_FOLIO, sections: [{ section: 'plot', text: 'x'.repeat(80) }] };
    expect(validateFolioJson(badSection).ok).toBe(false);
  });

  it('rejects duplicate sections and thin/oversized chunk text', () => {
    const dup = { ...GOOD_FOLIO, sections: [GOOD_FOLIO.sections[0], GOOD_FOLIO.sections[0]] };
    expect(validateFolioJson(dup).ok).toBe(false);
    const thin = { ...GOOD_FOLIO, sections: [{ section: 'summary', text: 'too short' }] };
    expect(validateFolioJson(thin).ok).toBe(false);
    const huge = { ...GOOD_FOLIO, sections: [{ section: 'summary', text: 'x'.repeat(4001) }] };
    expect(validateFolioJson(huge).ok).toBe(false);
  });

  it('reports ALL errors at once (the CLI prints the whole list)', () => {
    const v = validateFolioJson({ slug: 'NO', caution: 'WAT', sections: [] });
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('the enums mirror the FolioChunk schema (summary..bibliography · OPEN..SEALED)', () => {
    expect(FOLIO_SECTIONS).toEqual(['summary', 'benefits', 'warnings', 'mantra', 'lineage', 'bibliography']);
    expect(CAUTION_LEVELS).toEqual(['OPEN', 'MODERATE', 'HIGH', 'SEALED']);
  });
});

describe('planIngest — idempotent by slug', () => {
  const existing = [
    { slug: 'baked-folio', section: 'summary' },
    { slug: 'baked-folio', section: 'benefits' },
  ];

  it('skip mode: a slug already baked is skipped whole, never duplicated', () => {
    const plan = planIngest(existing, [GOOD_FOLIO, { ...GOOD_FOLIO, slug: 'baked-folio' }]);
    expect(plan.skipped).toEqual(['baked-folio']);
    expect(plan.inserts.every((i) => i.slug !== 'baked-folio')).toBe(true);
    expect(plan.inserts.length).toBe(2);
  });

  it('replace mode: old slug re-bakes (flagged), plan carries the new rows', () => {
    const plan = planIngest(existing, [{ ...GOOD_FOLIO, slug: 'baked-folio' }], 'replace');
    expect(plan.replaced).toEqual(['baked-folio']);
    expect(plan.inserts.length).toBe(2);
    expect(plan.writes).toEqual([
      { slug: 'baked-folio', section: 'summary' },
      { slug: 'baked-folio', section: 'warnings' },
    ]);
  });

  it('empty corpus → everything inserts (the first folio ever)', () => {
    const plan = planIngest([], [GOOD_FOLIO]);
    expect(plan.inserts.length).toBe(2);
    expect(plan.skipped).toEqual([]);
    expect(plan.inserts[0]).toMatchObject({ slug: 'test-folio', caution: 'OPEN', archetype: null });
  });
});

describe('computeBakePending — the studio-vs-corpus complaint', () => {
  const entries: BakePendingEntry[] = [
    { slug: 'baked-folio', type: 'practice', status: 'PUBLISHED' },
    { slug: 'pending-folio', type: 'pattern', status: 'PUBLISHED' },
    { slug: 'draft-folio', type: 'pattern', status: 'DRAFT' },
  ];

  it('flags published slugs missing from the corpus and ignores drafts', () => {
    const r = computeBakePending({ entries, corpusSlugs: ['baked-folio'] });
    expect(r.pending.map((p) => p.slug)).toEqual(['pending-folio']);
    expect(r.publishedEntries).toBe(2);
    expect(r.corpusSlugs).toBe(1);
    expect(r.pendingCount).toBe(1);
  });

  it('zero pending when the two worlds agree', () => {
    const r = computeBakePending({
      entries,
      corpusSlugs: ['baked-folio', 'pending-folio'],
    });
    expect(r.pendingCount).toBe(0);
  });
});

describe('bake path fs truth', () => {
  const root = join(__dirname, '..', '..');
  const orchestrator = readFileSync(join(root, 'scripts', 'bake-corpus.sh'), 'utf8');
  const cli = readFileSync(join(root, 'scripts', 'ingest-folio-json.ts'), 'utf8');
  const corpusIngest = readFileSync(join(root, 'scripts', 'ingest-folios.ts'), 'utf8');
  const warroom = readFileSync(join(root, 'src', 'app', 'api', 'admin', 'warroom', 'route.ts'), 'utf8');

  it('the orchestrator runs the full gated sequence in order', () => {
    const steps = [
      'step 1 · folio JSON validation',
      'step 2 · ingest',
      'step 3 · bake',
      'step 4 · fingerprint diff',
      'step 5 · CORPUS_SIZE assertion',
      'step 6 · vitest corpus gates',
    ];
    let last = -1;
    for (const s of steps) {
      const idx = orchestrator.indexOf(s);
      expect(idx, `step missing or out of order: ${s}`).toBeGreaterThan(last);
      last = idx;
    }
    expect(orchestrator).toContain('ingest-folio-json.ts --dry-run');
    // the historical data-module ingest keeps its name and its job
    expect(corpusIngest).toContain('allSiddhis');
    expect(orchestrator).toContain('bake-folio-embeddings.ts');
    expect(orchestrator).toContain('neural-swap-fingerprint.ts');
    expect(orchestrator).toContain('pattern-bridge.test.ts');
    expect(orchestrator).toContain('Rollback if anything looks wrong');
  });

  it('the ingest CLI is a thin executor over the pure plan (no ad-hoc validation)', () => {
    expect(cli).toContain('validateFolioJson');
    expect(cli).toContain('planIngest');
    expect(cli).toContain('--dry-run');
    // embeddings land empty — the very next bake step fills them
    expect(cli).toContain("'[]'");
  });

  it('the warroom carries bakePending fail-soft (satellite panel pattern)', () => {
    expect(warroom).toContain('computeBakePending');
    expect(warroom).toContain('staticDb.folioChunk.findMany({ distinct: ["slug"]');
    const idx = warroom.indexOf('let bakePending');
    expect(warroom.slice(idx, idx + 700)).toMatch(/catch/);
  });

  it('CORPUS_ENTRY_TYPES documents which studio types can bake at all', () => {
    expect(CORPUS_ENTRY_TYPES).toContain('practice');
    expect(CORPUS_ENTRY_TYPES).not.toContain('codex');
  });
});

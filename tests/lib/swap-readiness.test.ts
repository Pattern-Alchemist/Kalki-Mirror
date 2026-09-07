import { describe, it, expect } from 'vitest';
import { readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  canonicalIdfFingerprint,
  idfSyncVerdict,
  estimateSwapCost,
} from '@/lib/rag/swap-readiness';

/* ═══════════════════════════════════════════════════════════════════════════
   Vol. 4 #16 — neural-swap rehearsal: verdict logic (pure) + rehearsal
   tooling truth on disk (the script must exist, be executable, stay keyless,
   and print the ONE command the founder runs on swap day).
   ═══════════════════════════════════════════════════════════════════════════ */

const ROOT = process.cwd();

describe('canonicalIdfFingerprint', () => {
  it('is stable and order-independent', () => {
    const a = canonicalIdfFingerprint({ x: 1.000001, y: 2.5 });
    const b = canonicalIdfFingerprint({ y: 2.5, x: 1.000001 });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
  });

  it('rounds to bake precision (6 dp) so sub-1e-7 noise cannot flip the verdict', () => {
    // 1.23456701 and 1.23456749 both round to 1.234567 — noise below the
    // 6-dp bake precision must never change the fingerprint.
    const a = canonicalIdfFingerprint({ t: 1.23456701 });
    const b = canonicalIdfFingerprint({ t: 1.23456749 });
    expect(a).toBe(b);
    expect(canonicalIdfFingerprint({ t: 1.234568 })).not.toBe(a);
  });

  it('distinguishes different value maps and different term sets', () => {
    expect(canonicalIdfFingerprint({ a: 1 })).not.toBe(canonicalIdfFingerprint({ a: 2 }));
    expect(canonicalIdfFingerprint({ a: 1 })).not.toBe(canonicalIdfFingerprint({ a: 1, b: 2 }));
  });
});

describe('idfSyncVerdict', () => {
  const base = {
    recomputed: { mantra: 4.1, japa: 3.2, yoga: 5.0 },
    generated: { mantra: 4.1, japa: 3.2, yoga: 5.0 },
    corpusRows: 327,
    generatedCorpusSize: 327,
  };

  it('in-sync when counts, terms and values all agree', () => {
    const v = idfSyncVerdict(base);
    expect(v.inSync).toBe(true);
    expect(v.corpusCountMatches).toBe(true);
    expect(v.recomputedFingerprint).toBe(v.generatedFingerprint);
    expect(v.missing).toEqual([]);
    expect(v.extra).toEqual([]);
    expect(v.drifted).toEqual([]);
  });

  it('out of sync when the corpus count drifted from CORPUS_SIZE', () => {
    const v = idfSyncVerdict({ ...base, corpusRows: 330, generatedCorpusSize: 327 });
    expect(v.corpusCountMatches).toBe(false);
    expect(v.inSync).toBe(false);
  });

  it('detects missing (corpus gained terms) and extra (corpus lost terms)', () => {
    const gained = idfSyncVerdict({ ...base, recomputed: { ...base.recomputed, newterm: 6.0 } });
    expect(gained.missing).toEqual(['newterm']);
    expect(gained.inSync).toBe(false);

    const lost = idfSyncVerdict({ ...base, generated: { ...base.generated, ghost: 6.0 } });
    expect(lost.extra).toEqual(['ghost']);
    expect(lost.inSync).toBe(false);
  });

  it('detects value drift beyond 1e-6 but tolerates 6-dp noise', () => {
    const noisy = idfSyncVerdict({ ...base, generated: { ...base.generated, mantra: 4.1000001 } });
    expect(noisy.inSync).toBe(true);

    const drifted = idfSyncVerdict({ ...base, generated: { ...base.generated, japa: 3.3 } });
    expect(drifted.inSync).toBe(false);
    expect(drifted.drifted[0]).toEqual({ term: 'japa', recomputed: 3.2, generated: 3.3 });
  });

  it('bounds the drift samples to keep the rehearsal output readable', () => {
    const recomputed = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`t${i}`, 1]));
    const generated = Object.fromEntries(Array.from({ length: 40 }, (_, i) => [`t${i}`, 2]));
    const v = idfSyncVerdict({ recomputed, generated, corpusRows: 1, generatedCorpusSize: 1 });
    expect(v.missing.length).toBeLessThanOrEqual(12);
  });
});

describe('estimateSwapCost', () => {
  it('estimates tokens at 4 chars/token and cost linearly in price', () => {
    const c = estimateSwapCost(327, 327 * 400, 0.02);
    expect(c.corpusChunks).toBe(327);
    expect(c.avgChunkChars).toBe(400);
    expect(c.totalChars).toBe(327 * 400);
    expect(c.estimatedTokens).toBe(Math.ceil((327 * 400) / 4));
    expect(c.estimatedBakeCostUsd).toBeCloseTo((c.estimatedTokens / 1e6) * 0.02, 4);
  });

  it('scales linearly in price (provider-agnostic ballpark)', () => {
    const a = estimateSwapCost(327, 130_800, 0.01);
    const b = estimateSwapCost(327, 130_800, 0.02);
    expect(b.estimatedTokens).toBe(a.estimatedTokens);
    expect(b.estimatedBakeCostUsd / a.estimatedBakeCostUsd).toBeCloseTo(2, 1);
  });

  it('survives an empty corpus without NaN', () => {
    const c = estimateSwapCost(0, 0, 0.02);
    expect(c.avgChunkChars).toBe(0);
    expect(c.estimatedTokens).toBe(0);
    expect(c.estimatedBakeCostUsd).toBe(0);
  });
});

describe('rehearsal tooling truth (filesystem)', () => {
  const scriptPath = join(ROOT, 'scripts', 'rehearse-neural-swap.sh');
  const probePath = join(ROOT, 'scripts', 'neural-swap-fingerprint.ts');

  it('ships the rehearsal script and the fingerprint probe', () => {
    expect(existsSync(scriptPath)).toBe(true);
    expect(existsSync(probePath)).toBe(true);
  });

  it('the rehearsal script is executable', () => {
    const mode = statSync(scriptPath).mode & 0o111;
    expect(mode).not.toBe(0);
  });

  it('the rehearsal stays keyless: guards EMBED_API_KEY, validates the chain, prints the ONE command', () => {
    const src = readFileSync(scriptPath, 'utf8');
    expect(src).toMatch(/EMBED_API_KEY/); // the keyless guard
    expect(src).toMatch(/bake-folio-embeddings\.ts/); // the real swap command
    expect(src).toMatch(/neural-swap-fingerprint\.ts/); // the probe
    expect(src).toMatch(/git checkout -- src\/lib\/rag\/idf-generated\.ts/); // rollback path
    expect(src).toMatch(/NEURAL_EMBED_PRICE_PER_1M_USD/); // tunable price
  });

  it('both scripts are whitelisted against the scripts/* gitignore swallow', () => {
    const gi = readFileSync(join(ROOT, '.gitignore'), 'utf8');
    expect(gi).toMatch(/!scripts\/rehearse-neural-swap\.sh/);
    expect(gi).toMatch(/!scripts\/neural-swap-fingerprint\.ts/);
  });

  it('the fingerprint probe uses the shared tokenizer + the pure verdict lib', () => {
    const src = readFileSync(probePath, 'utf8');
    expect(src).toMatch(/tokenTerms/); // shared tokenizer — never a second math
    expect(src).toMatch(/idfSyncVerdict/);
    expect(src).toMatch(/estimateSwapCost/);
  });
});

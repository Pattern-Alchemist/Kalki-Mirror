import { describe, it, expect } from 'vitest';
import sitemap from '@/app/sitemap';

/* ═══════════════════════════════════════════════════════════════════════════
   Vol. 5 #17 — the sitemap truth gate II. The 2026-09-08 sweep proved the
   map exactly canonical (289 URLs, per-class composition verified, /ask
   correctly absent) and nothing pinned it — the next renderer bug would
   silently reshape the map. This census asserts per-class FLOORS from the
   roadmap spec, fails loud on any URL whose class is not registered (a new
   page class MUST register a floor — that is the discipline), and keeps the
   /ask absence contract honest.
   ═══════════════════════════════════════════════════════════════════════════ */

const BASE = 'https://www.astrokalki.com';

/**
 * The class floor registry — every URL family the sitemap may emit, with
 * the minimum count the roadmap pins. A sitemap URL that classifies into
 * none of these fails the census loud (register the class or fix the bug).
 */
const FLOORS: Record<string, number> = {
  // one-off top-level surfaces (the hub pages themselves)
  'static-core': 11, // / plus method, research, pricing, consultations,
  // email-course, primer, codex, karma, about, guhya — the class hubs
  // themselves classify into their own families below
  archive: 57, // 56 siddhi folios + hub-adjacent detail pages
  patterns: 21, // 20 loops + hub
  archetypes: 11, // 10 Mahāvidyās + hub
  breathwork: 13, // 12 patterns + hub
  sequences: 7, // 6 sequences + hub
  glossary: 87, // 86 lexicon terms + hub
  usa: 6, // hub + 5 service pages (+4 cities → 10 today)
  aghori: 63, // 8 phases + 54 lessons + hub
  tantra: 6, // reclaimed /tantra hub + 5 children
  letters: 1, // the hub must exist even with zero public letters
  library: 6, // the hub + 5 type shelves (DB entries are additive)
};

function classify(pathname: string): string {
  const p = pathname.replace(BASE, '') || '/';
  if (p === '/ask') return 'ASK_FORBIDDEN';
  if (p === '/') return 'static-core';
  if (p.startsWith('/archive')) return 'archive';
  if (p.startsWith('/patterns')) return 'patterns';
  if (p.startsWith('/archetypes')) return 'archetypes';
  if (p.startsWith('/breathwork')) return 'breathwork';
  if (p.startsWith('/sequences')) return 'sequences';
  if (p.startsWith('/glossary')) return 'glossary';
  if (p.startsWith('/usa')) return 'usa';
  if (p.startsWith('/aghori-tantra')) return 'aghori';
  if (p.startsWith('/tantra')) return 'tantra';
  if (p.startsWith('/letters')) return 'letters';
  if (p.startsWith('/library')) return 'library';
  // the closed set of one-off top-level pages — extend static-core ONLY by
  // editing this list (registering the class), never by relaxing the census
  const STATIC_TOP = new Set([
    '/method', '/research', '/pricing', '/consultations', '/email-course',
    '/primer', '/codex', '/karma', '/about', '/guhya',
  ]);
  if (STATIC_TOP.has(p)) return 'static-core';
  return 'UNREGISTERED';
}

async function census(): Promise<{ counts: Record<string, number>; unregistered: string[]; asks: number; dupes: string[]; badBase: string[] }> {
  const entries = (await sitemap()) as Array<{ url: string }>;
  const counts: Record<string, number> = {};
  const unregistered: string[] = [];
  const seen = new Map<string, number>();
  const dupes: string[] = [];
  const badBase: string[] = [];
  let asks = 0;
  for (const { url } of entries) {
    if (!(url === BASE || url.startsWith(`${BASE}/`)) || url.includes(' ')) badBase.push(url);
    const n = (seen.get(url) ?? 0) + 1;
    seen.set(url, n);
    if (n === 2) dupes.push(url);
    const cls = classify(url);
    if (cls === 'ASK_FORBIDDEN') asks += 1;
    else if (cls === 'UNREGISTERED') unregistered.push(url);
    else counts[cls] = (counts[cls] ?? 0) + 1;
  }
  return { counts, unregistered, asks, dupes, badBase };
}

describe('sitemap truth gate II: the census pins the canonical map (Vol. 5 #17)', () => {
  let result: Awaited<ReturnType<typeof census>>;

  it('censuses the live map', async () => {
    result = await census();
    expect(Object.keys(result.counts).length).toBeGreaterThanOrEqual(10);
  });

  it('every per-class floor holds', () => {
    const failures = Object.entries(FLOORS)
      .filter(([cls, floor]) => (result.counts[cls] ?? 0) < floor)
      .map(([cls, floor]) => `${cls}: ${result.counts[cls] ?? 0} < floor ${floor}`);
    expect(failures, `sitemap census shortfalls:\n${failures.join('\n')}`).toEqual([]);
  });

  it('every URL belongs to a registered class — new page classes must register a floor', () => {
    expect(
      result.unregistered,
      `unregistered sitemap URLs (add a class to the census or fix the renderer):\n${result.unregistered.join('\n')}`,
    ).toEqual([]);
  });

  it('/ask is ABSENT — the noindex contract survives in the map', () => {
    expect(result.asks).toBe(0);
  });

  it('no duplicate URLs and every URL carries the canonical base', () => {
    expect(result.dupes, `duplicate sitemap URLs:\n${result.dupes.join('\n')}`).toEqual([]);
    expect(result.badBase, `non-canonical URLs:\n${result.badBase.join('\n')}`).toEqual([]);
  });

  it('the map stays in the canonical neighborhood (total, floor + headroom)', async () => {
    const entries = (await sitemap()) as unknown[];
    const total = entries.length;
    const floorTotal = Object.values(FLOORS).reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(floorTotal);
    // renderer overgrowth is also a bug: the map must not balloon silently
    expect(total).toBeLessThanOrEqual(floorTotal + 120);
  });
});

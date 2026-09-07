import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, sep } from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * STRUCTURED-DATA TRUTH — Vol. 4 #10. The openapi-truth pattern (#20
 * Vol. 3) applied to JSON-LD.
 *
 * Before this suite, the ld+json layer had drifted in the worst way:
 * /pricing's layout carried a HAND-WRITTEN OfferCatalog whose prices
 * were 10× the real tiers (Jal 4999 vs ₹499, Agni 14999 vs ₹1,499,
 * Akash 49990 vs ₹4,999) and a FAQPage describing questions the page
 * does not render — while the page itself rendered a truth-sourced
 * Service graph. Two graphs, one route, contradictory revenue claims.
 *
 * This suite pins the whole structured-data layer in two directions:
 *   1. FILESYSTEM EXHAUSTIVENESS — every page/layout that emits a
 *      JSON-LD script must be registered here (a new graph ships
 *      silently → CI fails), and every registered file must exist.
 *   2. CONTENT TRUTH — inline graphs must contain their declared
 *      @type literals; builder-backed graphs are EXECUTED with real
 *      fixtures and their output asserted, including the revenue
 *      pins (Offer prices must equal pricing.ts exactly).
 */
const REPO = join(__dirname, '..', '..');
const APP = join(REPO, 'src', 'app');

/** Inline graphs: file → '@type' literals that MUST appear in its source. */
const INLINE_REGISTRY: Record<string, string[]> = {
  'patterns/layout.tsx': ['CollectionPage', 'ItemList', 'BreadcrumbList'],
  'patterns/[slug]/layout.tsx': ['Article', 'CollectionPage', 'Person'],
  'karma/page.tsx': ['Article', 'FAQPage'],
  'practice/layout.tsx': ['WebPage', 'BreadcrumbList'],
  'about/page.tsx': ['AboutPage', 'BreadcrumbList'],
  'glossary/page.tsx': ['DefinedTermSet', 'DefinedTerm', 'BreadcrumbList'],
  'method/layout.tsx': ['WebPage', 'BreadcrumbList'],
  'research/layout.tsx': ['WebPage', 'BreadcrumbList'],
  'sequences/layout.tsx': ['CollectionPage', 'BreadcrumbList'],
  'archetypes/layout.tsx': ['CollectionPage', 'FAQPage'],
  'archetypes/[id]/page.tsx': ['Article', 'FAQPage'],
  'library/layout.tsx': ['CollectionPage', 'BreadcrumbList'],
  'dossier/layout.tsx': ['WebPage', 'BreadcrumbList'],
  'consultations/layout.tsx': ['Organization', 'Service', 'WebPage', 'FAQPage', 'BreadcrumbList'],
  'consultations/page.tsx': ['FAQPage'],
  'codex/layout.tsx': ['WebPage', 'BreadcrumbList'],
  'archive/layout.tsx': ['CollectionPage', 'ItemList', 'BreadcrumbList'],
  'archive/[slug]/layout.tsx': ['Article', 'CollectionPage', 'Person'],
  // Vol. 4 #10: the layout's stale price-bearing catalog + phantom FAQ
  // were REMOVED — only the price-free WebPage + Breadcrumb nodes remain.
  // Prices + FAQ live on the page, generated from pricing.ts / faq-data.ts.
  // The negative pins below keep it that way.
  'pricing/layout.tsx': ['WebPage', 'BreadcrumbList'],
  'breathwork/layout.tsx': ['CollectionPage', 'Thing', 'BreadcrumbList'],
};

/** Builder-backed emitters — registered so the fs walk sees them; their
 *  OUTPUT is executed and pinned in the builder-backed block below. */
const BUILDER_FILES = [
  'glossary/[slug]/page.tsx',
  'library/[type]/page.tsx',
  'library/[type]/[slug]/page.tsx',
  'pricing/page.tsx',
  'sequences/[slug]/page.tsx',
  'aghori-tantra/layout.tsx',
  'aghori-tantra/[phase]/page.tsx',
  'aghori-tantra/[phase]/[lesson]/page.tsx',
];

/** Emitters whose graph content is pinned elsewhere (DATA_MODULE_PINS). */
const PINNED_ELSEWHERE_FILES = ['page.tsx'];

/** Home renders FAQ_JSONLD from src/lib/data/faq.ts — pinned at the data module. */
const DATA_MODULE_PINS: { file: string; types: string[] }[] = [
  { file: 'src/lib/data/faq.ts', types: ['FAQPage', 'Question'] },
];

describe('structured-data truth: filesystem exhaustiveness', () => {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      if (name === 'api' || name === 'admin' || name === 'generated') continue;
      const abs = join(dir, name);
      if (statSync(abs).isDirectory()) walk(abs);
      else if ((name === 'page.tsx' || name === 'layout.tsx') && readFileSync(abs, 'utf8').includes('application/ld+json')) {
        found.push(abs.slice(APP.length + 1).split(sep).join('/'));
      }
    }
  };
  walk(APP);

  it('every ld+json emitter is registered (no silent graphs)', () => {
    const registered = new Set([...Object.keys(INLINE_REGISTRY), ...BUILDER_FILES, ...PINNED_ELSEWHERE_FILES]);
    for (const f of found) {
      expect(registered.has(f), `UNREGISTERED graph emitter: src/app/${f} — add it to the registry in tests/lib/structured-data-truth.test.ts`).toBe(true);
    }
  });

  it('every registered file exists and emits a graph', () => {
    for (const file of [...Object.keys(INLINE_REGISTRY), ...BUILDER_FILES, ...PINNED_ELSEWHERE_FILES]) {
      const src = readFileSync(join(APP, file), 'utf8');
      expect(src, `${file} must still emit an ld+json script`).toContain('application/ld+json');
    }
  });
});

describe('structured-data truth: inline graph contents', () => {
  for (const [file, types] of Object.entries(INLINE_REGISTRY)) {
    it(`${file} ships ${types.join(' + ')}`, () => {
      const src = readFileSync(join(APP, file), 'utf8');
      for (const t of types) {
        expect(src, `${file}: missing '@type': '${t}'`).toContain(`'@type': '${t}'`);
      }
    });
  }

  it('pricing/layout.tsx never carries prices or a FAQ again (the 10× lie stays dead)', () => {
    const raw = readFileSync(join(APP, 'pricing/layout.tsx'), 'utf8');
    // Strip comments — the pins target CODE, and the header comment
    // documents (in prose) what was removed.
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(src).not.toContain('OfferCatalog');
    expect(src).not.toContain('FAQPage');
    expect(src).not.toMatch(/price/i);
  });

  for (const pin of DATA_MODULE_PINS) {
    it(`${pin.file} ships ${pin.types.join(' + ')}`, () => {
      const src = readFileSync(join(REPO, pin.file), 'utf8');
      for (const t of pin.types) {
        expect(src).toContain(`'@type': '${t}'`);
      }
    });
  }
});

describe('structured-data truth: builder-backed graphs', () => {
  const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.astrokalki.com';

  function typesOf(graph: unknown): string[] {
    const json = JSON.stringify(graph);
    return [...json.matchAll(/"@type":"([A-Za-z]+)"/g)].map((m) => m[1]);
  }

  it('glossary term graph: DefinedTerm addressable inside the hub termset', async () => {
    const { glossaryTermJsonLd } = await import('@/lib/seo/glossary-seo');
    const { glossaryEntries } = await import('@/lib/data/glossary');
    const g = glossaryTermJsonLd(glossaryEntries[0]);
    const types = typesOf(g);
    expect(types).toContain('DefinedTerm');
    expect(types).toContain('BreadcrumbList');
    expect(JSON.stringify(g)).toContain(`${SITE}/glossary/`);
    expect(JSON.stringify(g)).toContain('termCode');
  });

  it('library type-index graph: ItemList with absolute entry URLs', async () => {
    const { libraryTypeJsonLd } = await import('@/lib/seo/content-seo');
    const updatedAt = new Date('2026-08-01T00:00:00Z');
    const g = libraryTypeJsonLd('practice', [
      { type: 'practice', slug: 'a', title: 'Entry A', publishedAt: updatedAt, updatedAt },
      { type: 'practice', slug: 'b', title: 'Entry B', publishedAt: null, updatedAt },
    ]);
    const types = typesOf(g);
    expect(types).toContain('ItemList');
    expect(types).toContain('BreadcrumbList');
    const json = JSON.stringify(g);
    expect(json).toContain('"numberOfItems":2');
    expect(json).toContain(`${SITE}/library/practice/a`);
    // Breadcrumb mid node = the type index (Vol. 4 #6)
    expect(json).toContain(`"${SITE}/library/practice"`);
  });

  it('library entry graph: breadcrumb mid node is the type index, not the hub (Vol. 4 #6 fix)', async () => {
    const { contentArticleJsonLd } = await import('@/lib/seo/content-seo');
    const updatedAt = new Date('2026-08-01T00:00:00Z');
    const g = contentArticleJsonLd({
      type: 'practice', slug: 'deep-breath', title: 'Deep Breath', excerpt: null,
      body: 'Body.', status: 'PUBLISHED', caution: 'OPEN', publishedAt: updatedAt, updatedAt,
    });
    const types = typesOf(g);
    expect(types).toContain('Article');
    expect(types).toContain('BreadcrumbList');
    expect(JSON.stringify(g)).toContain(`${SITE}/library/practice"`);
  });

  it('pricing Service graph: every Offer price equals pricing.ts EXACTLY (the revenue-lie pin)', async () => {
    const { buildMembershipServiceJsonLd } = await import('@/lib/seo/service-schema');
    const { pricingTiers } = await import('@/lib/data/pricing');
    const graph = buildMembershipServiceJsonLd();
    const json = JSON.stringify(graph);
    expect(typesOf(graph)).toContain('Service');
    for (const tier of pricingTiers) {
      expect(json, `tier ${tier.name} price ${tier.priceINR} must appear exactly`).toContain(`"price":"${tier.priceINR}"`);
    }
    // The stale 10× prices must never return (they contain the real ones
    // as prefixes, so these literals can only come back from bad data).
    expect(json).not.toContain('49990');
    expect(json).not.toContain('14999');
  });

  it('pricing FAQPage graph mirrors the FAQ the page actually renders', async () => {
    const { buildFaqPageJsonLd } = await import('@/lib/seo/faq-schema');
    const { FAQ_DATA } = await import('@/app/pricing/faq-data');
    const g = buildFaqPageJsonLd(FAQ_DATA, { path: '/pricing' });
    expect(typesOf(g)).toContain('FAQPage');
    expect(g.mainEntity).toHaveLength(FAQ_DATA.length);
    for (const q of g.mainEntity) {
      expect(q.name.length).toBeGreaterThan(5);
      expect(q.acceptedAnswer.text.length).toBeGreaterThan(10);
    }
    expect(JSON.stringify(g)).toContain(`${SITE}/pricing`);
  });

  it('sequence HowTo: one step per sequence step, honest totalTime, for EVERY sequence', async () => {
    const { buildSequenceHowToJsonLd, sequenceTotalTime } = await import('@/lib/seo/sequence-schema');
    const { allSequences } = await import('@/lib/data/sequences');
    expect(allSequences.length).toBeGreaterThan(0);
    for (const seq of allSequences) {
      const g = buildSequenceHowToJsonLd(seq);
      expect(typesOf(g)).toContain('HowTo');
      expect(g.step).toHaveLength(seq.steps.length);
      g.step.forEach((s: { name: string }, i: number) => expect(s.name).toBe(seq.steps[i].label));
      const t = sequenceTotalTime(seq.totalDuration);
      if (t !== undefined) expect(t).toMatch(/^PT\d+M$/);
    }
  });

  it('course graphs: hub, phase and lesson builders all mint Course/LearningResource nodes', async () => {
    const { courseHubJsonLd, coursePhaseJsonLd, courseLessonJsonLd } = await import('@/lib/seo/course-jsonld');
    const { aghoriCourse } = await import('@/lib/data/aghori-tantra-course');
    const mod = aghoriCourse[0];
    const lesson = mod.lessons[0];
    expect(typesOf(courseHubJsonLd())).toContain('Course');
    expect(typesOf(coursePhaseJsonLd(mod))).toContain('Course');
    expect(typesOf(courseLessonJsonLd(mod, lesson))).toContain('LearningResource');
  });
});

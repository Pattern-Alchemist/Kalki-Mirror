import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { usaCityPages, usaPages, usaHub, type UsaPage } from '@/lib/data/usa-pages';
import { usaServiceJsonLd } from '@/components/usa/UsaPageShell';

/* ═══════════════════════════════════════════════════════════════════════════
   Vol. 5 #15 — the USA city surfaces. Local-intent queries deserve pages
   with genuinely local copy, NOT the service page re-badged. This gate
   pins the anti-cannibalization discipline: pairwise uniqueness of every
   authored string, localized substance, City-grade JSON-LD, and the
   sitemap/hub registration that makes the surfaces findable.
   ═══════════════════════════════════════════════════════════════════════════ */

const EXPECTED_CITIES = ['austin', 'new-york', 'san-francisco-bay', 'london'] as const;

describe('usaCityPages: the four city surfaces', () => {
  it('exists as exactly the four roadmap cities, with honest paths and topics', () => {
    expect(usaCityPages.map((p) => p.slug)).toEqual([...EXPECTED_CITIES]);
    for (const p of usaCityPages) {
      expect(p.path).toBe(`/usa/${p.slug}`);
      expect(p.topic).toBe(`usa-${p.slug}`);
      expect(p.area).toBeDefined();
    }
  });

  it('every city page carries substantive localized copy (no stubs)', () => {
    for (const p of usaCityPages) {
      expect(p.intro.length).toBeGreaterThanOrEqual(3);
      for (const para of p.intro) expect(para.length).toBeGreaterThanOrEqual(300);
      expect(p.sections.length).toBeGreaterThanOrEqual(2);
      expect(p.faqs.length).toBeGreaterThanOrEqual(4);
      // each page names its own city in the copy — a re-badged clone would
      // pass paragraph counts but fail the city-name weave
      const allText = [p.h1, p.h1Accent ?? '', ...p.intro, ...p.faqs.map((f) => f.q + f.a)].join(' ');
      expect(allText.toLowerCase()).toContain(p.area!.city.toLowerCase());
    }
  });

  it('the noindex-duplicate guard: no authored string is shared between two cities', () => {
    const allPages = [...usaPages, ...usaCityPages, usaHub];
    const seen = new Map<string, string>();
    const dupes: string[] = [];
    const fingerprint = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    for (const page of allPages) {
      const strings: string[] = [
        page.h1,
        page.h1Accent ?? '',
        ...page.intro,
        ...page.sections.flatMap((s) => [s.heading, ...s.paragraphs]),
        ...page.faqs.flatMap((f) => [f.q, f.a]),
      ];
      for (const s of strings) {
        if (s.length < 20) continue; // labels and fragments may legitimately repeat
        const key = fingerprint(s);
        const owner = seen.get(key);
        if (owner && owner !== page.slug) dupes.push(`${owner} ↔ ${page.slug}: "${s.slice(0, 60)}…"`);
        else seen.set(key, page.slug);
      }
    }
    expect(dupes, `template-clone copy detected:\n${dupes.join('\n')}`).toEqual([]);
  });

  it('city pages never cannibalize the service pages: h1s and titles are distinct', () => {
    const service = [...usaPages, usaHub];
    for (const city of usaCityPages) {
      for (const s of service) {
        expect(city.h1.toLowerCase()).not.toBe(s.h1.toLowerCase());
        expect(city.title.toLowerCase()).not.toBe(s.title.toLowerCase());
      }
    }
  });

  it('the WhatsApp attribution topics stay closed and distinct', () => {
    const topics = usaCityPages.map((p) => p.topic);
    expect(new Set(topics).size).toBe(topics.length);
    // no city may borrow a service topic — attribution is the funnel's spine
    const serviceTopics = usaPages.map((p) => p.topic);
    for (const t of topics) expect(serviceTopics).not.toContain(t);
  });

  it('related lists cross-link the layer (hub or a sibling city on every city page)', () => {
    for (const p of usaCityPages) {
      const hrefs = p.related.map((r) => r.href);
      expect(hrefs).toContain('/usa');
      expect(hrefs.some((h) => h.startsWith('/usa/') && h !== p.path)).toBe(true);
    }
  });
});

describe('usaServiceJsonLd: LocalBusiness-grade structure', () => {
  const service = { name: 'Vedic Astrology Consultation', description: 'A session.', priceUSD: 29 };

  it('city pages emit a City + Country areaServed — not the whole-US default', () => {
    const austin = usaCityPages.find((p) => p.slug === 'austin')!;
    const ld = usaServiceJsonLd(service, austin) as { areaServed: Array<{ '@type': string; name: string }> };
    expect(Array.isArray(ld.areaServed)).toBe(true);
    const types = ld.areaServed.map((a) => a['@type']);
    expect(types).toContain('City');
    expect(types).toContain('Country');
    expect(ld.areaServed.find((a) => a['@type'] === 'City')!.name).toBe('Austin');
  });

  it('London emits the United Kingdom — the city is the content, the country is honest', () => {
    const london = usaCityPages.find((p) => p.slug === 'london')!;
    const ld = usaServiceJsonLd(service, london) as { areaServed: Array<{ '@type': string; name: string }> };
    expect(ld.areaServed.find((a) => a['@type'] === 'Country')!.name).toBe('United Kingdom');
  });

  it('pages without an area keep the whole-US Country scope (existing 6 unchanged)', () => {
    const plain: Pick<UsaPage, 'path' | 'area'> = { path: '/usa/vedic-astrology-consultation' };
    const ld = usaServiceJsonLd(service, plain) as { areaServed: { '@type': string; name: string } };
    expect(ld.areaServed['@type']).toBe('Country');
    expect(ld.areaServed.name).toBe('United States');
  });
});

describe('registration: sitemap + hub', () => {
  it('the sitemap module declares all four city URLs', () => {
    const src = fs.readFileSync(path.join(process.cwd(), 'src', 'app', 'sitemap.ts'), 'utf8');
    for (const slug of EXPECTED_CITIES) {
      expect(src).toContain(`/usa/${slug}`);
    }
  });

  it('the hub links the city surfaces (the doors are visible from the front page)', () => {
    for (const slug of EXPECTED_CITIES) {
      expect(usaHub.related.some((r) => r.href === `/usa/${slug}`)).toBe(true);
    }
  });
});

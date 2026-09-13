import { describe, it, expect } from 'vitest';
import { usaLocalBusinessJsonLd, usaServiceJsonLd } from '@/components/usa/UsaPageShell';
import { usaCityPages, usaPages } from '@/lib/data/usa-pages';

/* ══════════════════════════════════════════════════════════════
   Vol. 6 #15 — USA depth II: LocalBusiness JSON-LD + city↔service grid.
   City pages now carry entity-grade local data (areaServed, priceRange,
   sameAs, hasOfferCatalog). Service pages link to all cities; city pages
   link to all services.
   ══════════════════════════════════════════════════════════════ */

const austinPage = usaCityPages.find((p) => p.slug === 'austin')!;

describe('usaLocalBusinessJsonLd — the entity-grade local schema', () => {
  it('emits ProfessionalService @type (Google local pack reads this)', () => {
    const ld = usaLocalBusinessJsonLd(austinPage, [{ name: 'Vedic Astrology', priceUSD: 29 }]);
    expect(ld['@type']).toBe('ProfessionalService');
  });

  it('carries @id, name, url, image', () => {
    const ld = usaLocalBusinessJsonLd(austinPage, []);
    // @id is an absolute URL (schema.org convention)
    expect(String(ld['@id'])).toContain(austinPage.path);
    expect(String(ld['@id'])).toContain('#localbusiness');
    expect(ld['name']).toContain('Austin');
    expect(String(ld['url'])).toContain(austinPage.path);
    expect(String(ld['image'])).toContain('/opengraph-image');
  });

  it('areaServed narrows to City + State + Country (not the whole US)', () => {
    const ld = usaLocalBusinessJsonLd(austinPage, []);
    const areaServed = ld.areaServed as Array<Record<string, unknown>>;
    expect(Array.isArray(areaServed)).toBe(true);
    expect(areaServed.some((a) => a['@type'] === 'City' && a.name === 'Austin')).toBe(true);
    expect(areaServed.some((a) => a['@type'] === 'Country')).toBe(true);
  });

  it('address is a PostalAddress with addressLocality + addressCountry', () => {
    const ld = usaLocalBusinessJsonLd(austinPage, []);
    const addr = ld.address as Record<string, unknown>;
    expect(addr['@type']).toBe('PostalAddress');
    expect(addr.addressLocality).toBe('Austin');
    expect(addr.addressCountry).toBeTruthy();
  });

  it('priceRange is set ($$)', () => {
    const ld = usaLocalBusinessJsonLd(austinPage, []);
    expect(ld.priceRange).toBe('$$');
  });

  it('hasOfferCatalog lists the service catalog', () => {
    const ld = usaLocalBusinessJsonLd(austinPage, [
      { name: 'Vedic Astrology', priceUSD: 29 },
      { name: 'Relationship Reading', priceUSD: 29 },
    ]);
    const catalog = ld.hasOfferCatalog as Record<string, unknown>;
    expect(catalog['@type']).toBe('OfferCatalog');
    const items = catalog.itemListElement as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0].price).toBe(29);
    expect(items[0].priceCurrency).toBe('USD');
  });

  it('sameAs includes the canonical site URL', () => {
    const ld = usaLocalBusinessJsonLd(austinPage, []);
    expect(Array.isArray(ld.sameAs)).toBe(true);
    expect((ld.sameAs as string[]).some((u) => u.includes('astrokalki.com'))).toBe(true);
  });

  it('handles a page without area (falls back to US country scope)', () => {
    const hubPage = { path: '/usa', h1: 'US', area: undefined };
    const ld = usaLocalBusinessJsonLd(hubPage, []);
    const areaServed = ld.areaServed as Record<string, unknown>;
    expect(areaServed['@type']).toBe('Country');
    expect(areaServed.name).toBe('United States');
  });
});

describe('city↔service cross-link grid — the data exists', () => {
  it('usaCityPages has at least 4 city surfaces', () => {
    expect(usaCityPages.length).toBeGreaterThanOrEqual(4);
    const slugs = usaCityPages.map((p) => p.slug);
    expect(slugs).toContain('austin');
    expect(slugs).toContain('new-york');
    expect(slugs).toContain('san-francisco-bay');
    expect(slugs).toContain('london');
  });

  it('every city page has an area with city + country', () => {
    for (const cp of usaCityPages) {
      expect(cp.area, `${cp.slug} missing area`).toBeDefined();
      expect(cp.area!.city, `${cp.slug} missing city`).toBeTruthy();
      expect(cp.area!.country, `${cp.slug} missing country`).toBeTruthy();
    }
  });

  it('usaPages has at least 5 service pages', () => {
    expect(usaPages.length).toBeGreaterThanOrEqual(5);
  });

  it('the existing Service JSON-LD still works (regression pin)', () => {
    const ld = usaServiceJsonLd(
      { name: 'Test Service', description: 'desc', priceUSD: 29 },
      austinPage,
    );
    expect(ld['@type']).toBe('Service');
    expect(ld.name).toBe('Test Service');
  });
});

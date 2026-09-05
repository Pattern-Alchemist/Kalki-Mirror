import { describe, it, expect } from 'vitest';
import {
  buildConsultationServiceJsonLd,
  buildMembershipServiceJsonLd,
  ORG_ID,
  CONSULTATION_SERVICE_ID,
  MEMBERSHIP_SERVICE_ID,
} from '@/lib/seo/service-schema';

/* ══════════════════════════════════════════════════════════════
   Vol. 2 #20 — Service + Offer JSON-LD builders (rich results)
   ══════════════════════════════════════════════════════════════ */

const SITE = 'https://www.astrokalki.com';

describe('buildConsultationServiceJsonLd', () => {
  const graph = buildConsultationServiceJsonLd();
  const service = graph['@graph'].find((n) => n['@id'] === CONSULTATION_SERVICE_ID) as {
    '@type': string;
    makesOffer: Array<Record<string, unknown>>;
    provider: { '@id': string };
    url: string;
  };

  it('is a ProfessionalService with three concrete offers', () => {
    expect(service['@type']).toBe('ProfessionalService');
    expect(service.makesOffer).toHaveLength(3);
  });

  it('charges the real prices in INR (0 / 1999 / 3499)', () => {
    const prices = service.makesOffer.map((o) => Number(o.price));
    expect(prices).toEqual([0, 1999, 3499]);
    for (const o of service.makesOffer) {
      expect(o.priceCurrency).toBe('INR');
      expect(o.availability).toBe('https://schema.org/InStock');
    }
  });

  it('anchors every url and the provider to the site org', () => {
    expect(service.url).toBe(`${SITE}/consultations`);
    expect(service.provider['@id']).toBe(ORG_ID);
    for (const o of service.makesOffer) expect(String(o.url).startsWith(SITE)).toBe(true);
  });

  it('emits serializable JSON (no undefined leaks)', () => {
    expect(() => JSON.stringify(graph)).not.toThrow();
    expect(JSON.parse(JSON.stringify(graph))).toEqual(graph);
  });
});

describe('buildMembershipServiceJsonLd', () => {
  const graph = buildMembershipServiceJsonLd();
  const service = graph['@graph'].find((n) => n['@id'] === MEMBERSHIP_SERVICE_ID) as {
    '@type': string;
    makesOffer: Array<Record<string, unknown>>;
  };

  it('exposes one Offer per pricing tier', () => {
    expect(service.makesOffer).toHaveLength(4); // Prithvi, Jal, Agni, Akash
  });

  it('prices the tiers in INR: 0 / 499 / 1499 / 4999', () => {
    expect(service.makesOffer.map((o) => Number(o.price))).toEqual([0, 499, 1499, 4999]);
  });

  it('carries monthly unit pricing on paid tiers only', () => {
    const paid = service.makesOffer.filter((o) => Number(o.price) > 0);
    const free = service.makesOffer.filter((o) => Number(o.price) === 0);
    for (const o of paid) {
      const spec = o.priceSpecification as Record<string, unknown>;
      expect(spec).toMatchObject({ '@type': 'UnitPriceSpecification', unitText: 'MONTH', priceCurrency: 'INR' });
    }
    for (const o of free) expect(o.priceSpecification).toBeUndefined();
  });
});

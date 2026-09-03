// =============================================================
// KALKI — MAHĀVIDYĀ FOLIO PAGES (/archetypes/[id])
// -------------------------------------------------------------
// Server-rendered authoritative pages for the ten Mahāvidyās
// (spec §5: "definitive knowledge pages", not SEO stubs).
// Content: editorial layer in src/lib/data/mahavidya-content.ts
// joined with the platform's archetype data (archetypes.ts).
// Only the ten Mahāvidyā ids get pages — the six supplementary
// pantheon forces remain on the hub (tier-gated material).
// =============================================================

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getArchetypeById, TEN_MAHAVIDYAS } from '@/lib/data/archetypes';
import { allPatterns } from '@/lib/data/patterns';
import { allSiddhis } from '@/lib/data/siddhis';
import { MAHAVIDYA_CONTENT } from '@/lib/data/mahavidya-content';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';
import { TrackView } from '@/components/analytics/TrackView';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';

const MAHAVIDYA_IDS = TEN_MAHAVIDYAS.map((m) => m.id);

export function generateStaticParams() {
  return MAHAVIDYA_IDS.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const archetype = getArchetypeById(id);
  const content = MAHAVIDYA_CONTENT[id];
  if (!archetype || !content) return { title: 'Not Found' };

  return {
    title: content.title,
    description: content.description,
    alternates: pageAlternates(`/archetypes/${id}`),
    openGraph: {
      url: canonicalUrl(`/archetypes/${id}`),
      title: content.title,
      description: content.description,
      type: 'article',
      images: [
        {
          url: archetype.image,
          width: 1200,
          height: 630,
          alt: `${archetype.name} — ${archetype.pattern} | KALKI`,
        },
      ],
    },
  };
}

export default async function MahavidyaFolioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const archetype = getArchetypeById(id);
  const content = MAHAVIDYA_CONTENT[id];
  if (!archetype || !content) notFound();

  const relatedPatterns = allPatterns.filter((p) =>
    archetype.relatedPatternSlugs.includes(p.slug),
  );
  const relatedSiddhis = allSiddhis.filter((s) =>
    archetype.relatedSiddhiSlugs.includes(s.slug),
  );
  const gated = archetype.cautionLevel !== 'OPEN';

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Archetypes', item: `${SITE_URL}/archetypes` },
      {
        '@type': 'ListItem',
        position: 3,
        name: archetype.name,
        item: `${SITE_URL}/archetypes/${id}`,
      },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: content.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.description,
    image: archetype.image,
    author: { '@id': `${SITE_URL}/#person`, name: 'Kaustubh' },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: canonicalUrl(`/archetypes/${id}`),
    about: {
      '@type': 'Thing',
      name: `${archetype.name} (${archetype.sanskrit})`,
      description: archetype.description,
    },
  };

  return (
    <div className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
      <TrackView event="archetype_viewed" slug={id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="mb-10 text-xs tracking-widest uppercase">
          <ol className="flex flex-wrap gap-2 text-foreground/40">
            <li>
              <Link href="/" className="hover:text-gold transition-colors">Home</Link>
              <span aria-hidden="true" className="ml-2">/</span>
            </li>
            <li>
              <Link href="/archetypes" className="hover:text-gold transition-colors">Archetypes</Link>
              <span aria-hidden="true" className="ml-2">/</span>
            </li>
            <li>{archetype.name}</li>
          </ol>
        </nav>

        {/* ── Hero ── */}
        <header className="mb-16">
          <p className="section-label mb-5">
            Mahāvidyā {archetype.number} of {TEN_MAHAVIDYAS.length} · {archetype.sanskrit}
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.98] tracking-[0.04em] engraved-heading font-light mb-6">
            {archetype.name}
          </h1>
          <p className="text-editorial text-foreground/75 text-lg leading-relaxed max-w-3xl mb-6">
            {archetype.description}
          </p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-foreground/50">
            <span>Bīja: <strong className="text-foreground/80">{archetype.bija}</strong></span>
            <span>Element: <strong className="text-foreground/80">{archetype.element}</strong></span>
            <span>Governs: <strong className="text-foreground/80">{archetype.pattern}</strong></span>
          </div>
        </header>

        <div className="divider-subtle mb-16" />

        {/* ── Editorial sections ── */}
        {content.sections.map((s) => (
          <section key={s.label} className="mb-16">
            <p className="section-label mb-6">{s.label}</p>
            <h2 className="font-display text-2xl md:text-4xl text-foreground tracking-wide mb-8 engraved-heading font-light">
              {s.heading}
            </h2>
            <div className="space-y-6">
              {s.paragraphs.map((p, i) => (
                <p key={i} className="text-editorial text-foreground/85 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}

        {/* ── Caution gate note ── */}
        {gated && (
          <section className="mb-16 border border-gold-dim/30 rounded-sm px-6 py-8 md:px-10 bg-foreground/[0.03]">
            <p className="section-label mb-3">Practice Caution · {archetype.cautionLevel}</p>
            <p className="text-editorial text-foreground/80 leading-relaxed">
              The sādhana corpus connected to {archetype.name} carries a{' '}
              <strong className="text-foreground">{archetype.cautionLevel}</strong> caution grade in
              the tradition itself. KALKI documents the architecture and the evidence grades
              openly; operative protocols for this register stay behind the practice tiers —
              not as mystique, but because the tradition gates them and the documentation
              respects its own gates.
            </p>
          </section>
        )}

        {/* ── Related platform material ── */}
        {(relatedPatterns.length > 0 || relatedSiddhis.length > 0) && (
          <section className="mb-16">
            <p className="section-label mb-6">The Loop, Mapped on the Platform</p>
            <h2 className="font-display text-2xl md:text-4xl text-foreground tracking-wide mb-8 engraved-heading font-light">
              Where {archetype.name} operates in the corpus
            </h2>
            {relatedPatterns.length > 0 && (
              <div className="mb-8">
                <h3 className="text-foreground text-lg font-medium mb-4">Pattern Atlas folios</h3>
                <div className="flex flex-wrap gap-3">
                  {relatedPatterns.map((p) => (
                    <Link key={p.slug} href={`/patterns/${p.slug}`} className="ghost-cta text-sm">
                      {p.name} — {p.subtitle}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {relatedSiddhis.length > 0 && (
              <div>
                <h3 className="text-foreground text-lg font-medium mb-4">Archive sādhana folios</h3>
                <div className="flex flex-wrap gap-3">
                  {relatedSiddhis.map((s) => (
                    <Link key={s.slug} href={`/archive/${s.slug}`} className="ghost-cta text-sm">
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── FAQ ── */}
        <section className="mb-16">
          <p className="section-label mb-6">Questions</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground tracking-wide mb-8 engraved-heading font-light">
            Asked about {archetype.name}
          </h2>
          <div className="space-y-8">
            {content.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="text-foreground text-lg font-medium mb-3">{f.q}</h3>
                <p className="text-editorial text-foreground/80 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Conversion band ── */}
        <section className="mb-16 border border-gold-dim/30 rounded-sm px-6 py-10 md:px-10 bg-foreground/[0.03]">
          <p className="section-label mb-4">Work With the Force</p>
          <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide mb-5 font-light">
            Reading the loop, or running it
          </h2>
          <p className="text-editorial text-foreground/80 leading-relaxed mb-8 max-w-2xl">
            A consultation with Kaustubh locates this force in your own pattern — and
            prescribes the practice that addresses it at its actual level. Or take the
            free Ten Doors course and meet all ten doorways across ten days.
          </p>
          <div className="flex flex-wrap gap-3">
            <WhatsAppCTA
              variant="inline"
              label="Consult the Archivist"
              message={`Hello Kaustubh, I have been reading about ${archetype.name} and I want to explore how this force operates in my own pattern.`}
              topic={`mahavidya:${id}`}
            />
            <Link href="/email-course" className="ghost-cta text-sm">The Ten Doors — Free</Link>
            <Link href="/archetypes" className="ghost-cta text-sm">Back to the Wheel</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

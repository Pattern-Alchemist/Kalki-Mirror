// =============================================================
// KALKI — US ACQUISITION SCAFFOLD (server component)
// -------------------------------------------------------------
// Renders a UsaPage data entry with the house typography system:
// breadcrumb → hero → intro → numbered sections → visible FAQ →
// dual conversion band (email course + attributed WhatsApp) →
// related cross-links. Emits FAQPage + BreadcrumbList JSON-LD on
// every page (Service schema added on commercial children via the
// `service` prop). Content itself is authored per-page in
// src/lib/data/usa-pages.ts — this shell is typography only.
// =============================================================

import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_URL, canonicalUrl, pageAlternates } from '@/lib/utils/metadata';
import { TrackView } from '@/components/analytics/TrackView';
import { WhatsAppCTA } from '@/components/booking/WhatsAppCTA';
import type { UsaPage } from '@/lib/data/usa-pages';

const EMAIL_COURSE_HREF = '/email-course';

const CTA_MESSAGE =
  'Hello Kaustubh, I found KALKI through the site and I\u2019d like to explore a consultation.';

interface UsaPageShellProps {
  page: UsaPage;
  /** Breadcrumb trail ending at this page (home is prepended automatically). */
  crumbs: { name: string; path: string }[];
  /** TrackView slug — '' for the hub, page slug for children. */
  trackSlug: string;
  /** Service JSON-LD for commercial pages (omitted on the hub). */
  service?: {
    name: string;
    description: string;
    priceUSD: number;
  };
}

export function usaPageMetadata(page: UsaPage): Metadata {
  return {
    title: page.title,
    description: page.description,
    alternates: pageAlternates(page.path),
    openGraph: {
      url: canonicalUrl(page.path),
      title: page.title,
      description: page.description,
      images: [
        {
          url: 'https://res.cloudinary.com/b9oo5abp/image/upload/f_jpg,q_auto:good,w_1200,h_630,c_fill/kalki-mirror/aghori/ashram/entering-path',
          width: 1200,
          height: 630,
          alt: page.h1,
        },
      ],
    },
  };
}

export function UsaPageShell({ page, crumbs, trackSlug, service }: UsaPageShellProps) {
  const trail = [{ name: 'Home', path: '' }, ...crumbs];

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      ...(c.path ? { item: `${SITE_URL}${c.path}` } : {}),
    })),
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const serviceJsonLd = service
    ? {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.description,
        provider: { '@id': `${SITE_URL}/#person`, name: 'Kaustubh' },
        areaServed: { '@type': 'Country', name: 'United States' },
        serviceType: 'Online consultation',
        offers: {
          '@type': 'Offer',
          price: service.priceUSD,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}${page.path}`,
        },
      }
    : null;

  return (
    <div className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
      <TrackView event="usa_page_viewed" slug={trackSlug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {serviceJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
      )}

      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="mb-10 text-xs tracking-widest uppercase">
          <ol className="flex flex-wrap gap-2 text-foreground/40">
            {trail.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {c.path ? (
                  <Link href={c.path} className="hover:text-gold transition-colors">
                    {c.name}
                  </Link>
                ) : (
                  <span>{c.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* ── Hero ── */}
        <header className="mb-16">
          <p className="section-label mb-5">{page.label}</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[0.98] tracking-[0.04em] engraved-heading font-light mb-6">
            {page.h1}
            {page.h1Accent && (
              <>
                <br />
                {page.h1Accent}
              </>
            )}
          </h1>
          <div className="space-y-5">
            {page.intro.map((p, i) => (
              <p key={i} className="text-editorial text-foreground/80 text-lg leading-relaxed max-w-3xl">
                {p}
              </p>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <WhatsAppCTA variant="inline" label="Message Kaustubh on WhatsApp" message={CTA_MESSAGE} topic={page.topic} />
            <Link href={EMAIL_COURSE_HREF} className="ghost-cta text-sm">
              The Ten Doors — Free Email Course
            </Link>
          </div>
        </header>

        <div className="divider-subtle mb-16" />

        {/* ── Sections ── */}
        {page.sections.map((s) => (
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
            {s.bullets && (
              <ul className="mt-8 space-y-3">
                {s.bullets.map((b, i) => (
                  <li key={i} className="flex gap-3 text-editorial text-foreground/85 leading-relaxed">
                    <span className="text-gold mt-1" aria-hidden="true">◆</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* ── Conversion band ── */}
        <section className="mb-16 border border-gold-dim/30 rounded-sm px-6 py-10 md:px-10 bg-foreground/[0.03]">
          <p className="section-label mb-4">Begin</p>
          <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-wide mb-5 font-light">
            Two doors, both open
          </h2>
          <p className="text-editorial text-foreground/80 leading-relaxed mb-8 max-w-2xl">
            Talk directly with Kaustubh — sessions run on WhatsApp video, in your time zone,
            beginning with a free thirty-minute discovery call. Or learn the framework first:
            the Ten Doors email course walks the entire method across ten days, free.
          </p>
          <div className="flex flex-wrap gap-3">
            <WhatsAppCTA variant="inline" label="Book the Free Discovery Call" message={CTA_MESSAGE} topic={page.topic} />
            <Link href={EMAIL_COURSE_HREF} className="ghost-cta text-sm">
              Start the Ten Doors
            </Link>
          </div>
        </section>

        {/* ── FAQ (visible) ── */}
        <section className="mb-16">
          <p className="section-label mb-6">Questions</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground tracking-wide mb-8 engraved-heading font-light">
            Asked by seekers like you
          </h2>
          <div className="space-y-8">
            {page.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="text-foreground text-lg font-medium mb-3">{f.q}</h3>
                <p className="text-editorial text-foreground/80 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Related ── */}
        <section>
          <p className="section-label mb-6">Continue</p>
          <div className="flex flex-wrap gap-3">
            {page.related.map((r) => (
              <Link key={r.href} href={r.href} className="ghost-cta text-sm">
                {r.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

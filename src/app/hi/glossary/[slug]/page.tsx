import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { glossaryEntries } from '@/lib/data/glossary';
import { termAnchor } from '@/lib/utils/term-anchor';
import { glossaryTermPath } from '@/lib/seo/glossary-seo';
import { pickDefinition } from '@/lib/i18n/lexicon-bridge';
import { SITE_URL } from '@/lib/utils/metadata';
import { TermText } from '@/components/longform/TermText';
import { TrackView } from '@/components/analytics/TrackView';

// =============================================================
// Vol. 6 #17 — /hi/glossary/[slug] — the hi-locale twin.
// -------------------------------------------------------------
// Same data, same slugs, same JSON-LD as the EN page — but:
//   · the definition is served in Devanagari (hi) when the term has
//     a hi bridge; EN fallback for untranslated terms (the invariant)
//   · canonical points to the EN version (/glossary/[slug]) so Google
//     knows the EN page is the primary URL
//   · hreflang declares the hi variant so Google can route hi seekers
//   · the page is noindex (canonical-only) — the EN page is the
//     indexed version; the hi page is the reading layer for direct
//     visitors from the locale switcher or the hi sitemap alternates
// =============================================================

export const dynamicParams = false;

export function generateStaticParams() {
  return glossaryEntries.map((e) => ({ slug: termAnchor(e.term) }));
}

function locate(slug: string) {
  return glossaryEntries.find((e) => termAnchor(e.term) === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = locate(slug);
  if (!entry) return { title: 'Not Found', robots: { index: false, follow: true } };

  const enPath = glossaryTermPath(entry.term);
  const hiPath = `/hi/glossary/${slug}`;
  return {
    title: `${entry.term} — कोश | KALKI`,
    description: entry.hi?.definition.slice(0, 155).replace(/\s+\S*$/, '') ?? entry.definition.slice(0, 155),
    // Canonical = EN version. Google indexes the EN URL; the hi page is
    // the reading layer, not a separate indexable entity.
    alternates: {
      canonical: `${SITE_URL}${enPath}`,
      languages: {
        'en-US': `${SITE_URL}${enPath}`,
        'hi': `${SITE_URL}${hiPath}`,
        'x-default': `${SITE_URL}${enPath}`,
      },
    },
    robots: { index: false, follow: true }, // canonical-only — don't compete with EN
    openGraph: {
      url: hiPath,
      title: `${entry.term} — कोश | KALKI`,
      locale: 'hi_IN',
    },
  };
}

export default async function HiGlossaryTermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = locate(slug);
  if (!entry) notFound();

  // Force hi locale — the /hi/ URL is the hi reading layer
  const picked = pickDefinition(entry, 'hi');
  const enPath = glossaryTermPath(entry.term);

  return (
    <>
      <TrackView event="glossary_term_viewed" slug={entry.term} />
      <article className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb — hi */}
          <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
            <Link href="/hi/glossary" className="hover:text-gold transition-colors">कोश</Link>
            <span className="mx-2 text-gold/40">/</span>
            <span className="text-gold-dim">{entry.term}</span>
          </nav>

          {/* Term */}
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            {entry.term}
          </h1>
          {entry.sanskrit && (
            <p className="font-display text-xl text-gold-dim mb-6" lang="sa">
              {entry.sanskrit}
            </p>
          )}

          {/* Definition — hi or EN fallback */}
          <div className="prose prose-invert max-w-none">
            <TermText text={picked.text} />
          </div>

          {!picked.hiAvailable && (
            <p className="mt-8 text-sm text-text-muted border-l-2 border-gold/20 pl-4">
              यह प्रविष्टि अभी हिंदी में उपलब्ध नहीं है। EN पाठ दिखाया गया है।
            </p>
          )}

          {/* Canonical link to EN version */}
          <div className="mt-12 pt-8 border-t border-gold/10">
            <p className="text-xs text-text-muted">
              <Link href={enPath} className="text-gold-dim hover:text-gold transition-colors">
                View in English →
              </Link>
            </p>
          </div>
        </div>
      </article>
    </>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allPatterns } from '@/lib/data/patterns';
import { pickPatternDescription } from '@/lib/i18n/lexicon-bridge';
import { SITE_URL } from '@/lib/utils/metadata';
import { TrackView } from '@/components/analytics/TrackView';

// =============================================================
// Vol. 6 #17 — /hi/patterns/[slug] — the hi-locale pattern twin.
// -------------------------------------------------------------
// Same data, same slugs as the EN pattern folio — but:
//   · the description is served in Devanagari (hi) when the pattern has
//     a hi bridge; EN fallback for untranslated patterns (the invariant)
//   · canonical points to the EN version (/patterns/[slug])
//   · hreflang declares the hi variant
//   · noindex (canonical-only) — the EN page is the indexed version
// =============================================================

export const dynamicParams = false;

export function generateStaticParams() {
  return allPatterns.map((p) => ({ slug: p.slug }));
}

function locate(slug: string) {
  return allPatterns.find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const pattern = locate(slug);
  if (!pattern) return { title: 'Not Found', robots: { index: false, follow: true } };

  const enPath = `/patterns/${slug}`;
  const hiPath = `/hi/patterns/${slug}`;
  return {
    title: `${pattern.name} — पैटर्न | KALKI`,
    description: pattern.hi?.definition.slice(0, 155).replace(/\s+\S*$/, '') ?? pattern.description.slice(0, 155),
    alternates: {
      canonical: `${SITE_URL}${enPath}`,
      languages: {
        'en-US': `${SITE_URL}${enPath}`,
        'hi': `${SITE_URL}${hiPath}`,
        'x-default': `${SITE_URL}${enPath}`,
      },
    },
    robots: { index: false, follow: true },
    openGraph: {
      url: hiPath,
      title: `${pattern.name} — पैटर्न | KALKI`,
      locale: 'hi_IN',
    },
  };
}

export default async function HiPatternFolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pattern = locate(slug);
  if (!pattern) notFound();

  const picked = pickPatternDescription(pattern, 'hi');
  const enPath = `/patterns/${slug}`;

  return (
    <>
      <TrackView event="pattern_viewed" slug={slug} />
      <article className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb — hi */}
          <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
            <Link href="/hi/patterns" className="hover:text-gold transition-colors">पैटर्न</Link>
            <span className="mx-2 text-gold/40">/</span>
            <span className="text-gold-dim">{pattern.name}</span>
          </nav>

          {/* Pattern name */}
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
            {pattern.name}
          </h1>
          <p className="text-text-secondary text-lg mb-6">
            {pattern.subtitle}
          </p>

          {/* Description — hi or EN fallback */}
          <div className="prose prose-invert max-w-none">
            <p className="text-text-secondary leading-relaxed">{picked.text}</p>
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

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { glossaryEntries } from '@/lib/data/glossary';
import type { GlossaryEntry } from '@/lib/data/glossary';
import { CATEGORIES } from '@/lib/data/glossary';
import { termAnchor } from '@/lib/utils/term-anchor';
import { glossaryTermPath, glossaryTermJsonLd, resolveRelatedTerm } from '@/lib/seo/glossary-seo';
import { TermText } from '@/components/longform/TermText';
import { pageAlternates } from '@/lib/utils/metadata';
import { getTranslations, getLocale } from 'next-intl/server';
import { pickDefinition } from '@/lib/i18n/lexicon-bridge';
import { TrackView } from '@/components/analytics/TrackView';
import { TIER_BADGE_STYLES } from '@/lib/utils/tier-gate';
import { cn } from '@/lib/utils';

// Static generation off the glossary data module — 86 indexable URLs
// minted from data that already exists. Unknown slugs 404 (no dynamic
// fallback: the Lexicon is a closed set).
export const dynamicParams = false;

export function generateStaticParams() {
  return glossaryEntries.map((e) => ({ slug: termAnchor(e.term) }));
}

function locate(slug: string): GlossaryEntry | undefined {
  return glossaryEntries.find((e) => termAnchor(e.term) === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = locate(slug);
  if (!entry) return { title: 'Not Found', robots: { index: false, follow: true } }; // Vol.4 #18: soft-404 guard — streaming shells ship HTTP 200; the miss body must never be indexable
  const title = `${entry.term} — The Lexicon | KALKI`;
  const description = entry.definition.slice(0, 155).replace(/\s+\S*$/, '');
  return {
    title,
    description,
    alternates: pageAlternates(glossaryTermPath(entry.term)),
    openGraph: {
      url: glossaryTermPath(entry.term),
      title,
      description,
      // Vol. 4 #11: the bespoke per-term card comes from the sibling
      // opengraph-image.tsx route — the old shared Cloudinary hero is
      // retired; og:image truth now lives in exactly one place.
    },
  };
}

const CATEGORY_STYLES: Record<string, string> = {
  foundational: 'bg-gold/10 text-gold border-gold/20',
  pranayama: 'bg-[#c44b2b]/10 text-[#e8734f] border-[#c44b2b]/20',
  tantra: 'bg-[#c44b2b]/10 text-[#e8734f] border-[#c44b2b]/20',
  ritual: 'bg-[#8a7230]/10 text-[#d4a853] border-[#8a7230]/20',
  philosophical: 'bg-foreground/5 text-text-secondary border-foreground/10',
  archetype: 'bg-[#c44b2b]/10 text-[#e8734f] border-[#c44b2b]/20',
};

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((c) => c.value !== 'all').map((c) => [c.value, c.label])
);

export default async function GlossaryTermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = locate(slug);
  if (!entry) notFound();

  // Vol. 4 #13 — the hi bridge: chrome + definition follow the seeker's
  // NEXT_LOCALE cookie; EN is the fallback of last resort. Metadata stays
  // EN (the corpus is indexed en-US; the hi layer is a reading layer).
  const t = await getTranslations('lexicon');
  const locale = await getLocale();
  const picked = pickDefinition(entry, locale);

  // Cross-links: related terms become real links ONLY when the name
  // resolves to an actual entry (the hub renders them as plain chips —
  // the data contains a few aspirational references like "Bīja Mantra"
  // that have no card of their own; linking those would 404).
  const related = (entry.relatedTerms ?? [])
    .map((name) => ({ name, rel: resolveRelatedTerm(name) }))
    .filter((r): r is { name: string; rel: GlossaryEntry } => !!r.rel && termAnchor(r.rel.term) !== termAnchor(entry.term));

  const categoryLabel = CATEGORY_LABELS[entry.category] ?? entry.category;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossaryTermJsonLd(entry)) }}
      />
      <TrackView event="glossary_term_viewed" slug={entry.term} />
      <article className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
            <Link href="/glossary" className="hover:text-gold transition-colors">{t('title')}</Link>
            <span className="mx-2 text-gold/40">/</span>
            <span className="text-gold-dim">{entry.term}</span>
          </nav>

          <header className="mb-10">
            <p className="section-label mb-4">LEXICON · {categoryLabel.toUpperCase()}</p>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 sm:gap-6 mb-3">
              <h1 className="font-display text-4xl md:text-6xl text-foreground gold-foil-text leading-[1.02] tracking-[0.04em]">
                {entry.term}
              </h1>
              {entry.sanskrit && (
                <p className="font-display text-2xl md:text-3xl text-gold/60">{entry.sanskrit}</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {entry.pronunciation && (
                <span className="font-mono text-xs text-text-muted tracking-[0.12em]">/{entry.pronunciation}/</span>
              )}
              <span className={cn('glass-chip text-[0.6rem] font-mono tracking-[0.15em] uppercase', CATEGORY_STYLES[entry.category])}>
                {categoryLabel}
              </span>
              {entry.minTier && (
                <span
                  className={cn(
                    'text-[0.6rem] font-mono tracking-[0.15em] uppercase px-2 py-1 rounded-sm border',
                    TIER_BADGE_STYLES[entry.minTier]
                  )}
                >
                  {t('tierPractice', { tier: entry.minTier })}
                </span>
              )}
              {/* Vol. 4 #13 — the bridge badge: this term reads in Hindi */}
              {picked.isHi && (
                <span className="text-[0.6rem] font-mono tracking-[0.15em] uppercase px-2 py-1 rounded-sm border border-gold/30 text-gold">
                  हिंदी
                </span>
              )}
            </div>
          </header>

          <div className="divider-subtle mb-10" />

          {/* Definition — the same text the hub publishes in structured
              data (DefinedTermSet); here it renders as readable HTML with
              the Lexicon auto-linker (Vol. 4 #9): the first mention of
              every OTHER term links its page — the crawl graph becomes a
              web. The term itself never links itself.
              Vol. 4 #13: under a hi locale with a translated term, the
              hi definition serves (EN fallback otherwise — the invariant
              is that the corpus never regresses). The EN text stays on
              the page for terms WITH a translation, so the sadhu-register
              rendering is always checkable against its source. */}
          <p className="text-editorial text-lg text-foreground/85 leading-relaxed editorial-spacing">
            <TermText text={picked.text} excludeTerm={entry.term} />
          </p>
          {picked.isHi && (
            <div className="mt-8 rounded-md border border-gold/20 bg-surface/40 px-5 py-4">
              <p className="section-label mb-3">{entry.term} — English</p>
              <p className="text-sm text-foreground/60 leading-relaxed editorial-spacing">
                <TermText text={entry.definition} excludeTerm={entry.term} />
              </p>
            </div>
          )}

          {/* Cross-linked vocabulary */}
          {related.length > 0 && (
            <>
              <div className="divider-subtle my-12" />
              <section aria-label="Related terms">
                <p className="section-label mb-6">{t('relatedTerms')}</p>
                <div className="flex flex-wrap gap-2">
                  {related.map(({ name, rel }) => (
                    <Link
                      key={name}
                      href={glossaryTermPath(rel.term)}
                      className="glass-chip text-[0.65rem] font-mono tracking-wider text-gold-dim hover:text-gold transition-colors"
                    >
                      {rel.term}
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* Folio links (existing hub behavior, kept) */}
          {entry.relatedSiddhiSlugs && entry.relatedSiddhiSlugs.length > 0 && (
            <>
              <div className="divider-subtle my-12" />
              <section aria-label="Related practices">
                <p className="section-label mb-6">{t('relatedPractices')}</p>
                <div className="flex flex-wrap gap-2">
                  {entry.relatedSiddhiSlugs.map((s) => (
                    <Link
                      key={s}
                      href={`/archive/${s}`}
                      className="glass-chip text-[0.65rem] font-mono tracking-wider text-gold-dim hover:text-gold transition-colors"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

          <div className="divider-subtle my-14" />

          {/* Return path */}
          <div className="glass-chip px-6 py-6 text-center">
            <p className="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-3">
              {glossaryEntries.length} terms — the complete vocabulary
            </p>
            <p className="text-editorial text-sm text-foreground/70 leading-relaxed max-w-xl mx-auto mb-5">
              {entry.term} is one coordinate in the Lexicon — the KALKI reference system
              mapping tantrik psychology term by term. Each definition is cross-linked
              to the practices and patterns it describes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/glossary" className="gold-cta text-xs">Back to the Lexicon</Link>
              <Link href="/archive" className="ghost-cta text-xs">The Akashic Archive</Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

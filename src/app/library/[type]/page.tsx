import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import {
  isPublicContentType,
  isPubliclyRenderable,
  libraryTypePath,
  libraryTypeJsonLd,
  contentEntryPath,
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  type PublicContentType,
} from '@/lib/seo/content-seo';
import { pageAlternates } from '@/lib/utils/metadata';
import { TrackView } from '@/components/analytics/TrackView';

// Same freshness contract as [slug]: entries publish and withdraw at
// runtime from the admin studio, so the index must never serve a stale
// static copy. (The roadmap's "generateStaticParams over the five types"
// was reconciled to this: the type set is closed via CONTENT_TYPES — the
// guard below refuses anything else — but the LISTING stays live, because
// a static copy would re-introduce the exact staleness the [slug]
// renderer's force-dynamic decision exists to prevent.)
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ type: string }>;
}

async function loadTypeEntries(type: string) {
  if (!isPublicContentType(type)) return undefined;
  const rows = await db.contentEntry.findMany({
    where: { type },
    orderBy: [{ publishedAt: 'desc' }, { updatedAt: 'desc' }],
  });
  // Identical public gate as the entry renderer: PUBLISHED only, SEALED
  // never renders publicly even when published.
  return rows.filter(isPubliclyRenderable);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  if (!isPublicContentType(type)) {
    // Vol. 4 #18 soft-404 guard: streaming shells ship HTTP 200; the miss
    // body must never be indexable.
    return { title: 'Not Found', robots: { index: false, follow: true } };
  }
  const label = CONTENT_TYPE_LABELS[type as PublicContentType];
  const title = `${label} — The Sādhanā Library | KALKI`;
  const description = `Published ${label.toLowerCase()} entries from the KALKI studio — practice notes and studies under the same evidence-first discipline as the folios of the Akashic Archive.`;
  return {
    title,
    description,
    alternates: pageAlternates(libraryTypePath(type)),
    openGraph: {
      url: libraryTypePath(type),
      title,
      description,
    },
  };
}

export default async function LibraryTypePage({ params }: Props) {
  const { type } = await params;
  const entries = await loadTypeEntries(type).catch(() => undefined);
  if (!entries) notFound();

  const label = CONTENT_TYPE_LABELS[type as PublicContentType];

  return (
    <>
      {entries.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(libraryTypeJsonLd(type as PublicContentType, entries)) }}
        />
      )}
      <TrackView event="library_type_viewed" slug={type} />
      <section className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb — hub / type index */}
          <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
            <Link href="/library" className="hover:text-gold transition-colors">The Library</Link>
            <span className="mx-2 text-gold/40">/</span>
            <span className="text-gold-dim">{label}</span>
          </nav>

          <header className="mb-12">
            <p className="section-label mb-4">FROM THE STUDIO</p>
            <h1 className="font-display text-3xl md:text-5xl text-foreground leading-[1.05] tracking-[0.04em] engraved-heading font-light">
              {label}
            </h1>
            <p className="text-editorial text-lg text-foreground/70 leading-relaxed max-w-xl mt-5">
              {entries.length === 1 ? '1 published entry' : `${entries.length} published entries`} — every one
              reachable from this index, two hops from the Library hub.
            </p>
          </header>

          <div className="divider-subtle mb-12" />

          {entries.length === 0 ? (
            <div className="glass-chip px-6 py-10 text-center">
              <p className="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">
                Nothing published here yet
              </p>
              <p className="text-editorial text-sm text-foreground/70 leading-relaxed max-w-md mx-auto mb-6">
                The studio has not published any {label.toLowerCase()} entries yet. The other
                shelves of the Library may already hold published work.
              </p>
              <Link href="/library" className="gold-cta text-xs">Back to the Sādhanā Library</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => {
                const published = entry.publishedAt ?? entry.updatedAt;
                return (
                  <article key={entry.id} className="group">
                    <Link
                      href={contentEntryPath(entry.type, entry.slug)}
                      className="block border border-gold/10 hover:border-gold/30 rounded-md px-6 py-6 transition-colors bg-foreground/[0.02]"
                    >
                      <p className="font-mono text-xs text-text-muted tracking-[0.12em] mb-3">
                        <time dateTime={published.toISOString()}>
                          {published.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                      </p>
                      <h2 className="font-display text-xl md:text-2xl text-foreground group-hover:text-gold transition-colors tracking-wide mb-3">
                        {entry.title}
                      </h2>
                      {entry.excerpt && (
                        <p className="text-editorial text-sm text-foreground/70 leading-relaxed">
                          {entry.excerpt}
                        </p>
                      )}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          <div className="divider-subtle my-14" />

          {/* Sibling shelves — the type set is closed (CONTENT_TYPES) */}
          <div className="glass-chip px-6 py-6 text-center">
            <p className="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">
              Other shelves
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {CONTENT_TYPES.filter((t) => t !== type).map((t) => (
                <Link key={t} href={libraryTypePath(t)} className="ghost-cta text-xs">
                  {CONTENT_TYPE_LABELS[t]}
                </Link>
              ))}
              <Link href="/library" className="ghost-cta text-xs">The Sādhanā Library</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

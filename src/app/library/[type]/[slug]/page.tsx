import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { db } from '@/lib/db';
import {
  isPublicContentType,
  isPubliclyRenderable,
  contentEntryPath,
  contentArticleJsonLd,
  contentDescription,
  CONTENT_TYPE_LABELS,
} from '@/lib/seo/content-seo';
import { pageAlternates } from '@/lib/utils/metadata';
import { TrackView } from '@/components/analytics/TrackView';
import CaptureBand from '@/components/capture/CaptureBand';

// Content is publish-gated from the admin studio at runtime — entries can
// go live or be withdrawn at any moment, so the renderer must never serve
// a stale static copy. Fresh on every request (volume is studio-paced).
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ type: string; slug: string }>;
}

async function loadEntry(type: string, slug: string) {
  if (!isPublicContentType(type)) return undefined;
  const entry = await db.contentEntry.findFirst({
    where: { type, slug },
  });
  // Public gate: PUBLISHED only, and SEALED stays studio-internal even then.
  if (!entry || !isPubliclyRenderable(entry)) return undefined;
  return entry;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params;
  const entry = await loadEntry(type, slug).catch(() => undefined);
  if (!entry) return { title: 'Not Found' };
  const typeLabel = CONTENT_TYPE_LABELS[entry.type as keyof typeof CONTENT_TYPE_LABELS] ?? entry.type;
  const title = `${entry.title} | KALKI`;
  const description = contentDescription(entry);
  return {
    title,
    description,
    alternates: pageAlternates(contentEntryPath(entry.type, entry.slug)),
    openGraph: {
      url: contentEntryPath(entry.type, entry.slug),
      title,
      description,
      type: 'article',
      publishedTime: (entry.publishedAt ?? entry.updatedAt).toISOString(),
      modifiedTime: entry.updatedAt.toISOString(),
    },
  };
}

const CAUTION_BAND: Record<string, { label: string; className: string }> = {
  MODERATE: {
    label: 'Practice caution — intermediate intensity',
    className: 'border-amber-500/30 bg-amber-500/5 text-amber-300',
  },
  HIGH: {
    label: 'High caution — advanced practice, preparation required',
    className: 'border-orange-500/30 bg-orange-500/5 text-orange-300',
  },
};

export default async function LibraryEntryPage({ params }: Props) {
  const { type, slug } = await params;
  const entry = await loadEntry(type, slug).catch(() => undefined);
  if (!entry) notFound();

  const typeLabel = CONTENT_TYPE_LABELS[entry.type as keyof typeof CONTENT_TYPE_LABELS] ?? entry.type;
  const caution = CAUTION_BAND[entry.caution];
  const published = entry.publishedAt ?? entry.updatedAt;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contentArticleJsonLd(entry)) }}
      />
      <TrackView event="library_entry_viewed" slug={`${entry.type}/${entry.slug}`} />
      <article className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
            <Link href="/library" className="hover:text-gold transition-colors">The Library</Link>
            <span className="mx-2 text-gold/40">/</span>
            <span className="text-gold-dim">{typeLabel}</span>
          </nav>

          <header className="mb-10">
            <p className="section-label mb-4">{typeLabel.toUpperCase()}</p>
            <h1 className="font-display text-3xl md:text-5xl text-foreground leading-[1.05] tracking-[0.04em] engraved-heading font-light mb-4">
              {entry.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <time dateTime={published.toISOString()} className="font-mono text-xs text-text-muted tracking-[0.12em]">
                {published.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </time>
            </div>
          </header>

          {entry.excerpt && (
            <p className="text-editorial text-lg text-foreground/70 leading-relaxed border-l-2 border-gold/30 pl-5 mb-10">
              {entry.excerpt}
            </p>
          )}

          {caution && (
            <div role="note" className={`mb-10 rounded-md border px-5 py-4 font-mono text-xs tracking-[0.08em] ${caution.className}`}>
              {caution.label}
            </div>
          )}

          <div className="divider-subtle mb-10" />

          {/* Body — the studio editor writes markdown */}
          <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-wide prose-p:text-foreground/85 prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-gold prose-blockquote:border-gold/30 prose-blockquote:text-foreground/70">
            <ReactMarkdown>{entry.body}</ReactMarkdown>
          </div>

          <div className="divider-subtle my-14" />

          <div className="glass-chip px-6 py-6 text-center">
            <p className="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-3">
              From the KALKI studio
            </p>
            <p className="text-editorial text-sm text-foreground/70 leading-relaxed max-w-xl mx-auto mb-5">
              This entry is part of the studio corpus — practice notes, archetype and
              pattern studies published under the same evidence-first discipline as
              the folios of the Akashic Archive.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/archive" className="gold-cta text-xs">The Akashic Archive</Link>
              <Link href="/library" className="ghost-cta text-xs">The Sādhanā Library</Link>
            </div>
          </div>

          <CaptureBand topic={`studio:${entry.type}/${entry.slug}`} className="mt-10" />
        </div>
      </article>
    </>
  );
}

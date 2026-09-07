import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { db } from '@/lib/db';
import { pageAlternates } from '@/lib/utils/metadata';

// Letters publish the moment a broadcast is confirmed and can be taken
// public/private from the data layer at any moment, so the renderer must
// never serve a stale static copy. Fresh on every request (volume is
// broadcast-paced — a handful of rows, page-cached by the CDN anyway).
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function loadLetter(slug: string) {
  return db.letter.findFirst({ where: { slug, isPublic: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const letter = await loadLetter(slug).catch(() => undefined);
  if (!letter) {
    // Vol. 4 #18 soft-404 guard — streaming shells ship HTTP 200; the miss
    // body must never be indexable.
    return { title: 'Not Found', robots: { index: false, follow: true } };
  }
  const title = `${letter.subject} — Letters | KALKI`;
  const description =
    letter.body.replace(/\s+/g, ' ').trim().slice(0, 155).replace(/\s+\S*$/, '') ||
    'A letter from the KALKI broadcast archive.';
  return {
    title,
    description,
    alternates: pageAlternates(`/letters/${letter.slug}`),
    openGraph: {
      url: `/letters/${letter.slug}`,
      title,
      description,
      type: 'article',
      publishedTime: letter.sentAt.toISOString(),
    },
  };
}

export default async function LetterPage({ params }: Props) {
  const { slug } = await params;
  const letter = await loadLetter(slug).catch(() => undefined);
  if (!letter) notFound();

  return (
    <article className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
      <div className="max-w-3xl mx-auto px-6 lg:px-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span className="mx-2 text-gold/40">/</span>
          <Link href="/letters" className="hover:text-gold transition-colors">Letters</Link>
          <span className="mx-2 text-gold/40">/</span>
          <span className="text-gold-dim">{letter.subject.slice(0, 40)}{letter.subject.length > 40 ? '…' : ''}</span>
        </nav>

        <header className="mb-10">
          <p className="section-label mb-4">A LETTER FROM THE WORK</p>
          <h1 className="font-display text-3xl md:text-5xl text-foreground leading-[1.05] tracking-[0.04em] engraved-heading font-light mb-4">
            {letter.subject}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <time dateTime={letter.sentAt.toISOString()} className="font-mono text-xs text-text-muted tracking-[0.12em]">
              {letter.sentAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </time>
            <span className="font-mono text-xs text-text-muted tracking-[0.12em]">
              · sent to {letter.recipientCount} {letter.recipientCount === 1 ? 'seeker' : 'seekers'}
            </span>
          </div>
        </header>

        <div className="divider-subtle mb-10" />

        {/* Body — the raw composed text, rendered with the same prose
            discipline as the Library. The per-recipient email chrome
            (signed unsubscribe URLs) is deliberately NOT reproduced;
            the footer below keeps the RFC 8058 promise generically. */}
        <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:tracking-wide prose-p:text-foreground/85 prose-p:leading-relaxed prose-strong:text-foreground prose-a:text-gold prose-blockquote:border-gold/30 prose-blockquote:text-foreground/70">
          <ReactMarkdown>{letter.body}</ReactMarkdown>
        </div>

        <div className="divider-subtle my-14" />

        <div className="glass-chip px-6 py-6 text-center">
          <p className="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-3">
            This letter went to the KALKI list
          </p>
          <p className="text-editorial text-sm text-foreground/70 leading-relaxed max-w-xl mx-auto mb-5">
            Every email KALKI sends carries a one-click unsubscribe footer
            (RFC 8058) — the archive keeps the promise but strips the personal
            links. Not on the list yet? The 10 Doors course is free, and every
            Door lands as a letter like this one.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/email-course" className="gold-cta text-xs">Start the free course</Link>
            <Link href="/letters" className="ghost-cta text-xs">All letters</Link>
          </div>
        </div>
      </div>
    </article>
  );
}

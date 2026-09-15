import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { allSequences } from '@/lib/data/sequences';
import { SITE_URL } from '@/lib/utils/metadata';
import { TrackView } from '@/components/analytics/TrackView';

export const dynamicParams = false;

export function generateStaticParams() {
  return allSequences.map((s) => ({ slug: s.slug }));
}

function locate(slug: string) {
  return allSequences.find((s) => s.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const seq = locate(slug);
  if (!seq) return { title: 'Not Found', robots: { index: false, follow: true } };

  const enPath = `/sequences/${slug}`;
  const hiPath = `/hi/sequences/${slug}`;
  return {
    title: `${seq.name} — अनुक्रम | KALKI`,
    description: seq.description?.slice(0, 155) ?? `हिंदी अनुवाद: ${seq.name}`,
    alternates: {
      canonical: `${SITE_URL}${enPath}`,
      languages: {
        'en-US': `${SITE_URL}${enPath}`,
        'hi': `${SITE_URL}${hiPath}`,
        'x-default': `${SITE_URL}${enPath}`,
      },
    },
    robots: { index: false, follow: true },
    openGraph: { url: hiPath, title: `${seq.name} — अनुक्रम | KALKI`, locale: 'hi_IN' },
  };
}

export default async function HiSequencePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seq = locate(slug);
  if (!seq) notFound();

  const enPath = `/sequences/${slug}`;

  return (
    <>
      <TrackView event="sequence_viewed" slug={slug} />
      <article className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
            <Link href="/hi/sequences" className="hover:text-gold transition-colors">अनुक्रम</Link>
            <span className="mx-2 text-gold/40">/</span>
            <span className="text-gold-dim">{seq.name}</span>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">{seq.name}</h1>
          {seq.description && <p className="text-text-secondary leading-relaxed mb-8">{seq.description}</p>}
          <p className="mt-8 text-sm text-text-muted border-l-2 border-gold/20 pl-4">
            यह पृष्ठ हिंदी पठन-स्तर है। सम्पूर्ण EN सामग्री के लिए{' '}
            <Link href={enPath} className="text-gold-dim hover:text-gold transition-colors">English देखें →</Link>
          </p>
        </div>
      </article>
    </>
  );
}

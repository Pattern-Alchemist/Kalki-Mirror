import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TEN_MAHAVIDYAS } from '@/lib/data/archetypes';
import { SITE_URL } from '@/lib/utils/metadata';
import { TrackView } from '@/components/analytics/TrackView';

export const dynamicParams = false;

export function generateStaticParams() {
  return TEN_MAHAVIDYAS.map((a) => ({ id: a.id }));
}

function locate(id: string) {
  return TEN_MAHAVIDYAS.find((a) => a.id === id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const arch = locate(id);
  if (!arch) return { title: 'Not Found', robots: { index: false, follow: true } };

  const enPath = `/archetypes/${id}`;
  const hiPath = `/hi/archetypes/${id}`;
  return {
    title: `${arch.name} — स्वरूप | KALKI`,
    description: (arch.description ?? arch.name).slice(0, 155),
    alternates: {
      canonical: `${SITE_URL}${enPath}`,
      languages: {
        'en-US': `${SITE_URL}${enPath}`,
        'hi': `${SITE_URL}${hiPath}`,
        'x-default': `${SITE_URL}${enPath}`,
      },
    },
    robots: { index: false, follow: true },
    openGraph: { url: hiPath, title: `${arch.name} — स्वरूप | KALKI`, locale: 'hi_IN' },
  };
}

export default async function HiArchetypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const arch = locate(id);
  if (!arch) notFound();

  const enPath = `/archetypes/${id}`;

  return (
    <>
      <TrackView event="archetype_viewed" slug={id} />
      <article className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
            <Link href="/hi/archetypes" className="hover:text-gold transition-colors">स्वरूप</Link>
            <span className="mx-2 text-gold/40">/</span>
            <span className="text-gold-dim">{arch.name}</span>
          </nav>
          <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">{arch.name}</h1>
          {arch.description && <p className="text-text-secondary leading-relaxed mb-8">{arch.description}</p>}
          <p className="mt-8 text-sm text-text-muted border-l-2 border-gold/20 pl-4">
            यह पृष्ठ हिंदी पठन-स्तर है। सम्पूर्ण EN सामग्री के लिए{' '}
            <Link href={enPath} className="text-gold-dim hover:text-gold transition-colors">English देखें →</Link>
          </p>
        </div>
      </article>
    </>
  );
}

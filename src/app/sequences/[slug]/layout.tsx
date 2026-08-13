import type { Metadata } from 'next';
import { allSequences } from '@/lib/data/sequences';
import { SITE_URL, canonicalUrl } from '@/lib/utils/metadata';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const sequence = allSequences.find((s) => s.slug === slug);

  if (!sequence) {
    return { title: 'Sequence Not Found | KALKI' };
  }

  const title = `${sequence.name}${sequence.sanskrit ? ` — ${sequence.sanskrit}` : ''} | KALKI`;
  const description = sequence.description.slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl(`/sequences/${slug}`) },
    openGraph: {
      title,
      description,
      url: canonicalUrl(`/sequences/${slug}`),
      type: 'article',
      siteName: 'KALKI',
    },
    robots: { index: true, follow: true },
  };
}

export default function SequenceSlugLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

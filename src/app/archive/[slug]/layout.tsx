import type { Metadata } from 'next';
import { allSiddhis } from '@/lib/data/siddhis';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const siddhi = allSiddhis.find((s) => s.slug === slug);

  if (!siddhi) {
    return { title: 'Siddhi Not Found | KALKI' };
  }

  const title = `${siddhi.name} — ${siddhi.sanskrit || 'Siddhi'} | KALKI Archive`;
  const description = siddhi.summary
    ? siddhi.summary.slice(0, 160)
    : `${siddhi.name}: a ${siddhi.cautionLevel ? siddhi.cautionLevel.toLowerCase() : ''} siddhi from the Tantric tradition.`;

  return {
    title,
    description: description.slice(0, 160),
    openGraph: {
      title,
      description: description.slice(0, 160),
      type: 'article',
    },
  };
}

export default function SiddhiFolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}

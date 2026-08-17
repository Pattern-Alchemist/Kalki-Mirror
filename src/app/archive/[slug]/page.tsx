import { allSiddhis, getSiddhiBySlug } from '@/lib/data/siddhis';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SiddhiFolioClient from './SiddhiFolioClient';

export function generateStaticParams() {
  return allSiddhis.map(s => ({ slug: s.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const siddhi = getSiddhiBySlug(slug);
    if (!siddhi) return { title: 'Not Found' };
    return {
      title: `${siddhi.name} — ${siddhi.sanskrit}`,
      description: siddhi.summary,
    };
  });
}

export default async function SiddhiFolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const siddhi = getSiddhiBySlug(slug);
  if (!siddhi) notFound();
  return <SiddhiFolioClient siddhi={siddhi} />;
}

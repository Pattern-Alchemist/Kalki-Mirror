import { allSiddhis, getSiddhiBySlug } from '@/lib/data/siddhis';
import { allPatterns } from '@/lib/data/patterns';
import { getArchetypeById, PATTERN_ARCHETYPE_MAP } from '@/lib/data/archetypes';
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

  // Pre-compute related data on the server
  const relatedSiddhis = allSiddhis.filter(s => s.slug !== siddhi.slug && s.category === siddhi.category).slice(0, 3);
  const relatedPatterns = allPatterns.filter(p => p.relatedSiddhis.includes(siddhi.slug)).slice(0, 4);

  const archetype = siddhi.archetypeId ? getArchetypeById(siddhi.archetypeId) : undefined;
  const patternArchetype = relatedPatterns.length > 0
    ? getArchetypeById(PATTERN_ARCHETYPE_MAP[relatedPatterns[0].slug])
    : undefined;
  const activeArchetype = archetype || patternArchetype;

  return (
    <SiddhiFolioClient
      siddhi={siddhi}
      relatedSiddhis={relatedSiddhis}
      relatedPatterns={relatedPatterns}
      activeArchetype={activeArchetype}
    />
  );
}

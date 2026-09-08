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
    if (!siddhi) return { title: 'Not Found', robots: { index: false, follow: true } }; // Vol.4 #18: soft-404 guard — streaming shells ship HTTP 200; the miss body must never be indexable
    return {
      title: `${siddhi.name} — ${siddhi.sanskrit}`,
      description: siddhi.summary,
      openGraph: {
        title: `${siddhi.name} — ${siddhi.sanskrit}`,
        description: siddhi.summary,
        // Vol. 5 #10: the bespoke per-folio card comes from the sibling
        // opengraph-image.tsx route — the layout's shared Cloudinary hero
        // no longer cascades; og:image truth lives in exactly one place.
      },
    };
  });
}

export default async function SiddhiFolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const siddhi = getSiddhiBySlug(slug);
  if (!siddhi) notFound();

  // Pre-compute related data on the server.
  // Vol. 5 #18 — the related cards render {slug,name,level} and
  // {slug,name} only; the full objects rode dead weight into every folio.
  const relatedSiddhis = allSiddhis
    .filter(s => s.slug !== siddhi.slug && s.category === siddhi.category)
    .slice(0, 3)
    .map(s => ({ slug: s.slug, name: s.name, level: s.level }));
  const relatedPatterns = allPatterns
    .filter(p => p.relatedSiddhis.includes(siddhi.slug))
    .slice(0, 4)
    .map(p => ({ slug: p.slug, name: p.name, subtitle: p.subtitle }));

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

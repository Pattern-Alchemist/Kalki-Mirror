import { UsaPageShell, usaPageMetadata } from '@/components/usa/UsaPageShell';
import { usaHub, usaPages } from '@/lib/data/usa-pages';

const page = usaPages.find((p) => p.slug === 'spiritual-consultation') ?? usaHub;

export const metadata = usaPageMetadata(page);

export default function Page() {
  return (
    <UsaPageShell
      page={page}
      crumbs={[
        { name: 'United States', path: '/usa' },
        { name: page.h1, path: page.path },
      ]}
      trackSlug={page.slug}
      service={{
        name: 'Spiritual Consultation and Sadhana Guidance',
        description: 'Practice advisory grounded in classical sources: japa, pranayama and sadhana sequencing with evidence grades, caution levels, and a written practice sheet.',
        priceUSD: 29,
      }}
    />
  );
}

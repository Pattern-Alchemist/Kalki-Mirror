import { UsaPageShell, usaPageMetadata } from '@/components/usa/UsaPageShell';
import { usaHub, usaPages } from '@/lib/data/usa-pages';

const page = usaPages.find((p) => p.slug === 'relationship-pattern-reading') ?? usaHub;

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
        name: 'Relationship Pattern Reading',
        description: 'A 60-minute diagnostic for repeating relationship loops - imprint, selection signature, and the traditional practice that interrupts the pattern.',
        priceUSD: 29,
      }}
    />
  );
}

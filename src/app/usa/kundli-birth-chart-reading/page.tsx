import { UsaPageShell, usaPageMetadata } from '@/components/usa/UsaPageShell';
import { usaHub, usaPages } from '@/lib/data/usa-pages';

const page = usaPages.find((p) => p.slug === 'kundli-birth-chart-reading') ?? usaHub;

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
        name: 'Kundli and Birth Chart Reading',
        description: 'A 60-minute Vedic birth-chart reading covering houses, grahas, nakshatras and the dasha timing layer - with the pattern cross-reference KALKI adds.',
        priceUSD: 29,
      }}
    />
  );
}

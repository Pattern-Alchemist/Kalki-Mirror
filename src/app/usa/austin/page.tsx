import { UsaPageShell, usaPageMetadata } from '@/components/usa/UsaPageShell';
import { usaCityPages } from '@/lib/data/usa-pages';

const page = usaCityPages.find((p) => p.slug === 'austin')!;

export const metadata = usaPageMetadata(page);

export default function Page() {
  return (
    <UsaPageShell
      page={page}
      crumbs={[
        { name: 'United States', path: '/usa' },
        { name: 'Austin', path: page.path },
      ]}
      trackSlug={page.slug}
      service={{
        name: 'Vedic Astrology Consultation — Austin',
        description:
          'A 60-minute online jyotisha and pattern-analysis session for Austin seekers - the chart read as a diagnostic instrument, cross-referenced with the Mirror Method, ending in a prescribed practice.',
        priceUSD: 29,
      }}
    />
  );
}

import { TantraPageShell, tantraPageMetadata } from '@/components/tantra/TantraPageShell';
import { tantraHub, tantraPages } from '@/lib/data/tantra-pages';

const page = tantraPages.find((p) => p.slug === 'shakta-tantra') ?? tantraHub;

export const metadata = tantraPageMetadata(page);

export default function Page() {
  return (
    <TantraPageShell
      page={page}
      crumbs={[
        { name: 'Tantra', path: '/tantra' },
        { name: page.h1, path: page.path },
      ]}
      trackSlug={page.slug}
    />
  );
}

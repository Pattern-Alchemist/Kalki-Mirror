import { TantraPageShell, tantraPageMetadata } from '@/components/tantra/TantraPageShell';
import { tantraHub } from '@/lib/data/tantra-pages';

export const metadata = tantraPageMetadata(tantraHub);

export default function TantraHubPage() {
  return (
    <TantraPageShell
      page={tantraHub}
      crumbs={[{ name: 'Tantra', path: '/tantra' }]}
      trackSlug=""
    />
  );
}

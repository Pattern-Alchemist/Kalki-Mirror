import { UsaPageShell, usaPageMetadata } from '@/components/usa/UsaPageShell';
import { usaHub } from '@/lib/data/usa-pages';

export const metadata = usaPageMetadata(usaHub);

export default function UsaHubPage() {
  return <UsaPageShell page={usaHub} crumbs={[{ name: 'United States', path: '/usa' }]} trackSlug="" />;
}

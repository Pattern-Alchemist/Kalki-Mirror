import type { Metadata } from 'next';
import { allSiddhis } from '@/lib/data/siddhis';
import PracticeLoggerPage from './PracticePageClient';

export const metadata: Metadata = {
  title: 'Practice Instruments — The Inner Laboratory | KALKI',
  description: 'Timer, session logger, and practice tracker. Track your sādhana with precision.',
};

// Build siddhis grouped by level on the server
const siddhisByLevel: Record<string, { slug: string; name: string }[]> = {};
for (const s of allSiddhis) {
  if (!siddhisByLevel[s.level]) siddhisByLevel[s.level] = [];
  siddhisByLevel[s.level].push({ slug: s.slug, name: s.name });
}

export default function PracticePage() {
  return <PracticeLoggerPage siddhisByLevel={siddhisByLevel} />;
}

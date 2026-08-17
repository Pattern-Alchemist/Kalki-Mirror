import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Archetypes — Ten Mahāvidyās | KALKI',
  description: 'The ten Mahāvidyās as diagnostic archetypes — each governing a specific karmic loop. Kali, Tara, Bhuvaneshwari, and the architecture of consciousness.',
};

const ArchetypesPageClient = dynamic(
  () => import('./ArchetypesPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-center justify-center text-center px-6">
        <div className="max-w-3xl mx-auto">
          <p className="section-label mb-6">THE WHEEL OF BECOMING</p>
          <h1 className="font-display text-5xl md:text-7xl text-foreground leading-[0.95] tracking-[0.06em] mb-6 hero-heading uppercase">
            Ten Mahāvidyās
          </h1>
          <p className="text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Ten faces of the divine feminine — loading&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function ArchetypesPage() {
  return <ArchetypesPageClient />;
}
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Archetypes — Ten Mahāvidyās | KALKI',
  description: 'The ten Mahāvidyās as diagnostic archetypes — each governing a specific karmic loop. Kali, Tara, Bhuvaneshwari, and the architecture of consciousness.',
};

const DeitiesPageClient = dynamic(
  () => import('./DeitiesPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-end">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pb-20 md:pb-28">
          <p className="section-label mb-6">ARCHETYPE COMPENDIUM</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            The Pantheon
          </h1>
          <p className="text-foreground text-xl md:text-2xl max-w-3xl editorial-spacing text-shadow-deep">
            16 archetypal forces. Each governing a karmic loop.&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function DeitiesPage() {
  return <DeitiesPageClient />;
}

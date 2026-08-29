import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'The Mirror Method — Pattern Dissolution',
  description: 'Five stages of pattern dissolution — from recognition to liberation. The Mirror Method maps your recurring behavioral loops to specific tantric practices from the Aghorī, Kashmiri Shaiva, and Vajrayāna traditions.',
};

const MethodPageClient = dynamic(
  () => import('./MethodPageClient'),
  {
    loading: () => (
      <div className="bg-deep-black min-h-screen flex items-end">
        <div className="max-w-3xl mx-auto px-6 lg:px-10 pb-20 md:pb-28">
          <p className="section-label mb-6">THE ARCHITECTURE OF PATTERN DISSOLUTION</p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[0.95] tracking-[0.06em] mb-5 hero-heading"
            style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
          >
            The Mirror Method
          </h1>
          <p className="text-foreground text-xl md:text-2xl max-w-3xl editorial-spacing text-shadow-deep">
            Five stages. From recognition to liberation.&hellip;
          </p>
        </div>
      </div>
    ),
  }
);

export default function MethodPage() {
  return <MethodPageClient />;
}

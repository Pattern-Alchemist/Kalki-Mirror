import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page Not Found | KALKI',
  description: 'The path you seek does not exist in this archive.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="relative min-h-[100vh] flex flex-col items-center justify-center bg-deep-black px-6 overflow-hidden">
      {/* Atmospheric layers */}
      <div className="atmospheric-bg absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="page-vignette absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Faint radial glow behind yantra */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center max-w-lg">
        {/* Yantra spinner */}
        <div className="mx-auto mb-10 w-28 h-28 relative">
          <img
            src="/kalki-yantra.svg"
            alt=""
            className="w-full h-full opacity-30"
            style={{ animation: 'yantraDraw 2.4s ease-out forwards' }}
            aria-hidden="true"
          />
          {/* Pulsing bindu at center */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gold/50 rounded-full"
            style={{ animation: 'binduPulse 1.2s ease-in-out infinite' }}
            aria-hidden="true"
          />
        </div>

        {/* 404 number */}
        <p
          className="font-mono text-7xl md:text-8xl text-gold/20 font-light tracking-[0.3em] mb-4 select-none"
        >
          404
        </p>

        <p className="section-label mb-6">
          PATH NOT FOUND
        </p>

        <h1
          className="font-display text-3xl md:text-4xl text-foreground font-light tracking-wide mb-6 engraved-heading"
        >
          This path does not exist.
        </h1>

        <p
          className="text-text-muted mb-10 max-w-md mx-auto editorial-spacing"
        >
          The siddhi, pattern, or page you seek is not in this archive.
          Not all paths lead to Shambhala — but you can return to the threshold.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="gold-cta">Return to the Threshold</Link>
          <Link href="/archive" className="ghost-cta">Browse the Archive</Link>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6 text-text-muted/40">
          <Link href="/patterns" className="text-[0.6875rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Patterns</Link>
          <span className="text-text-muted/20">{'\u00B7'}</span>
          <Link href="/archetypes" className="text-[0.6875rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Mahavidyas</Link>
          <span className="text-text-muted/20">{'\u00B7'}</span>
          <Link href="/consultations" className="text-[0.6875rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Consult</Link>
          <span className="text-text-muted/20">{'\u00B7'}</span>
          <Link href="/practice" className="text-[0.6875rem] font-mono tracking-[0.15em] uppercase hover:text-gold-dim transition-colors duration-500">Practice</Link>
        </div>
      </div>
    </div>
  );
}

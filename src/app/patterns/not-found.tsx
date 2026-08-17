import Link from 'next/link';

export default function SectionNotFound() {
  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6">
      <div className="relative z-10 max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full border border-gold-500/20 flex items-center justify-center">
          <span className="text-gold-400/60 text-2xl font-mono">?</span>
        </div>
        <p className="section-label">Pattern Not Found</p>
        <p className="text-text-secondary text-sm editorial-spacing">
          No pattern matches this geometry. The Pattern Atlas contains all known
          configurations.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/patterns" className="ghost-cta text-sm">
            Pattern Atlas
          </Link>
          <Link href="/" className="gold-cta text-sm">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

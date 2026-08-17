import Link from 'next/link';

/**
 * Catch-all 404 route — handles any URL that doesn't match a
 * defined page, dynamic route, or API route.
 */
export default function CatchAllPage() {
  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6">
      <div className="relative z-10 max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full border border-gold-500/20 flex items-center justify-center">
          <span className="text-gold-400/60 text-2xl font-mono">?</span>
        </div>
        <p className="section-label">Path Not Mapped</p>
        <p className="text-text-secondary text-sm editorial-spacing">
          This geometry does not exist in the Kalki system.
          The path you followed leads to uncharted territory.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="gold-cta text-sm">Return Home</Link>
          <Link href="/patterns" className="ghost-cta text-sm">Pattern Atlas</Link>
        </div>
      </div>
    </div>
  );
}

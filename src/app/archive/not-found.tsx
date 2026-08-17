import Link from 'next/link';

export default function SectionNotFound() {
  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6">
      <div className="relative z-10 max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full border border-gold-500/20 flex items-center justify-center">
          <span className="text-gold-400/60 text-2xl font-mono">?</span>
        </div>
        <p className="section-label">Siddhi Not Found</p>
        <p className="text-text-secondary text-sm editorial-spacing">
          This siddhi does not exist in the archive. The 108 siddhis are
          catalogued in the Archive.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/archive" className="ghost-cta text-sm">
            Siddhi Archive
          </Link>
          <Link href="/" className="gold-cta text-sm">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

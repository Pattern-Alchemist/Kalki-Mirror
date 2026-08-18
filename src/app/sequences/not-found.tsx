import Link from 'next/link';

export default function SectionNotFound() {
  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6">
      <div className="relative z-10 max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 rounded-full border border-gold-500/20 flex items-center justify-center">
          <span className="text-gold-400/60 text-2xl font-mono">?</span>
        </div>
        <p className="section-label">Sequence Not Found</p>
        <p className="text-text-secondary text-sm editorial-spacing">
          This sequence does not exist in the index. All active sequences are
          listed in the Sequence Index.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/sequences" className="ghost-cta text-sm">
            Sequence Index
          </Link>
          <Link href="/" className="gold-cta text-sm">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

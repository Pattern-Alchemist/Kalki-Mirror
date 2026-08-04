import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-deep-black px-6">
      <p className="section-label mb-4">404</p>
      <h1 className="font-display text-4xl mb-4">This path does not exist.</h1>
      <p className="text-text-muted mb-8 max-w-md text-center">
        The siddhi, pattern, or page you seek is not in this archive.
      </p>
      <Link href="/" className="gold-cta">Return to the Threshold</Link>
    </div>
  );
}
// =============================================================
// KALKI — THE LETTERS ARCHIVE (Vol. 4 #7)
// -------------------------------------------------------------
// Public archive of the broadcast letters (EmailSend kind "ops"
// dispatches — the marketing sends; course Doors and transactional
// email are NEVER archived here).
//
// ROBOTS DECISION (documented per the roadmap item): index:true.
// Every letter here is a generic broadcast — the raw body the admin
// composed, with NO personal data: the Letter row stores subject +
// body + an aggregate recipient count only. Per-recipient unsubscribe
// URLs and signed headers are never stored, so nothing personal can
// leak into the archive. Per-letter pages carry the Vol. 4 #18
// soft-404 guard (noindex on miss); the index and live letters are
// crawlable proof-of-life for the course.
// =============================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import { pageAlternates } from '@/lib/utils/metadata';
import CaptureBand from '@/components/capture/CaptureBand';

export const dynamic = 'force-dynamic';

async function loadLetters() {
  return db.letter.findMany({
    where: { isPublic: true },
    orderBy: { sentAt: 'desc' },
    take: 200,
  });
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Letters — KALKI',
    description:
      'The broadcast archive — every letter sent to the KALKI list, published as proof-of-life: practice notes, mirror observations, and course dispatches.',
    alternates: pageAlternates('/letters'),
    openGraph: {
      url: '/letters',
      title: 'Letters — KALKI',
      description:
        'Every broadcast letter, published as proof-of-life for the course.',
    },
  };
}

export default async function LettersPage() {
  const letters = await loadLetters().catch(() => []);

  return (
    <>
      <section className="bg-deep-black min-h-screen pt-28 md:pt-36 pb-32">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-10 font-mono text-xs tracking-[0.15em] uppercase text-text-muted">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span className="mx-2 text-gold/40">/</span>
            <span className="text-gold-dim">Letters</span>
          </nav>

          <header className="mb-12">
            <p className="section-label mb-4">THE BROADCAST ARCHIVE</p>
            <h1 className="font-display text-3xl md:text-5xl text-foreground leading-[1.05] tracking-[0.04em] engraved-heading font-light mb-5">
              Letters
            </h1>
            <p className="text-editorial text-lg text-foreground/70 leading-relaxed max-w-xl">
              Every letter sent to the KALKI list, published as proof-of-life —
              the same words the inbox received, unsubscribe promise and all,
              minus anything personal.
            </p>
          </header>

          <div className="divider-subtle mb-12" />

          {/* Vol. 5 #13 — /letters had no capture. The house capture band
              (honeypot, attribution, welcome + one-click unsub posture)
              posts to the existing course subscribe route — one list,
              one brain; the letters hub just offers the door. */}
          <div className="mb-14">
            <CaptureBand
              topic="letters-hub"
              kicker="The letters, in your inbox"
              heading="Every letter lands here — get it first by email."
              note="Practice notes and mirror observations from the Archive — one letter at a time, unsubscribe in one click, no friction."
            />
          </div>

          {letters.length === 0 ? (
            <div className="glass-chip px-6 py-10 text-center">
              <p className="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-4">
                No letters yet
              </p>
              <p className="text-editorial text-sm text-foreground/70 leading-relaxed max-w-md mx-auto mb-6">
                The first broadcast will land here the moment it is sent.
                The email course is already running — you can start it today.
              </p>
              <Link href="/email-course" className="gold-cta text-xs">Start the free course</Link>
            </div>
          ) : (
            <div className="space-y-6">
              {letters.map((letter) => {
                const excerpt = letter.body.replace(/\s+/g, ' ').trim().slice(0, 150);
                return (
                  <article key={letter.id} className="group">
                    <Link
                      href={`/letters/${letter.slug}`}
                      className="block border border-gold/10 hover:border-gold/30 rounded-md px-6 py-6 transition-colors bg-foreground/[0.02]"
                    >
                      <p className="font-mono text-xs text-text-muted tracking-[0.12em] mb-3">
                        <time dateTime={letter.sentAt.toISOString()}>
                          {letter.sentAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </time>
                        <span className="mx-2 text-gold/40">·</span>
                        sent to {letter.recipientCount} {letter.recipientCount === 1 ? 'seeker' : 'seekers'}
                      </p>
                      <h2 className="font-display text-xl md:text-2xl text-foreground group-hover:text-gold transition-colors tracking-wide mb-3">
                        {letter.subject}
                      </h2>
                      {excerpt && (
                        <p className="text-editorial text-sm text-foreground/70 leading-relaxed">
                          {excerpt}{letter.body.replace(/\s+/g, ' ').trim().length > 150 ? '…' : ''}
                        </p>
                      )}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}

          <div className="divider-subtle my-14" />

          {/* RFC 8058 note — the archive keeps the promise, not the URLs */}
          <div className="glass-chip px-6 py-6 text-center">
            <p className="font-mono text-xs text-text-muted tracking-[0.15em] uppercase mb-3">
              About this archive
            </p>
            <p className="text-editorial text-sm text-foreground/70 leading-relaxed max-w-xl mx-auto mb-5">
              Every email KALKI sends carries a one-click unsubscribe footer
              (RFC 8058) — the archive keeps that promise in the copy but strips
              the personal links. If you are on the list, the real link is in
              your inbox; if you are not, the course is free to join.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/email-course" className="gold-cta text-xs">The 10 Doors — free course</Link>
              <Link href="/" className="ghost-cta text-xs">Return home</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

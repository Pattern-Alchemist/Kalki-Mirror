'use client';

import { useState, useCallback } from 'react';
import { track } from '@/lib/analytics/track';
import { PRIMER_PDF_PATH } from '@/lib/data/primer';

/**
 * /primer — lead-magnet gate for the Seven Patterns PDF.
 *
 * The gate is deliberately light: the address enters the SAME first-party
 * capture as the Dispatch (POST /api/subscribe with source=primer), and on
 * success the download link is revealed in place. Storage outages degrade
 * to "pending" success on the API side, so the PDF is never held hostage
 * by infrastructure — the funnel's first touch must not be its first
 * point of failure.
 */
const SOURCE = 'primer';

export default function PrimerClient() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (state === 'sending') return;
      setState('sending');
      setMessage('');
      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, source: SOURCE }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          setState('done');
          track('email_subscribed', { properties: { source: SOURCE, status: data.status } });
        } else {
          setState('error');
          setMessage(data.error || 'The mirror is fogged. Try again.');
        }
      } catch {
        setState('error');
        setMessage('The mirror is fogged. Try again.');
      }
    },
    [email, state]
  );

  return (
    <div className="bg-deep-black min-h-screen text-white">
      {/* Hero */}
      <section className="relative flex min-h-[46vh] items-end">
        <div className="atmospheric-bg absolute inset-0 opacity-30" />
        <div className="relative z-10 mx-auto w-full max-w-[1400px] px-6 pb-12 pt-28 lg:px-10">
          <p className="section-label mb-4">A FREE FIELD GUIDE · PDF</p>
          <h1 className="font-display text-4xl font-light tracking-wide md:text-6xl">
            The Seven Patterns
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/70 md:text-lg">
            Seven of the twenty emotional patterns the Mirror sees — the Rescuer,
            the Perfectionist, the Saboteur, the Martyr, the Judge, the Seeker, and
            the Void. Each with its signs, its origin, and a first practice small
            enough to actually happen daily.
          </p>
        </div>
      </section>

      {/* Gate + contents */}
      <section className="mx-auto w-full max-w-[1400px] px-6 pb-24 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="font-display text-2xl font-light md:text-3xl">
              What the primer holds
            </h2>
            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-foreground/75">
              <li className="border-l border-gold/30 pl-4">
                What a pattern is — and what it is not. Patterns as intelligences,
                not diagnoses; why the thing that kept you safe is the thing that
                now runs you.
              </li>
              <li className="border-l border-gold/30 pl-4">
                The four zones of the work — Recognition, Confrontation, Dissolution,
                Integration — and where each of the seven sits on that arc.
              </li>
              <li className="border-l border-gold/30 pl-4">
                Seven pattern dossiers: how each shows up in a life, where it was
                formed, its Tantric archetype mapping, and one first practice with
                a journal prompt.
              </li>
              <li className="border-l border-gold/30 pl-4">
                How to read your own mirror without the pattern&apos;s defenses
                turning the reading into another dodge.
              </li>
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-foreground/50">
              Eleven pages · drawn from the live Archive at astrokalki.com · every
              claim graded, nothing to take on faith.
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-deep-black/60 p-6 md:p-8">
            {state === 'done' ? (
              <div role="status">
                <p className="section-label mb-3">The primer is yours</p>
                <p className="font-display text-xl font-light">
                  Walk gently with what you find.
                </p>
                <a
                  href={PRIMER_PDF_PATH}
                  download
                  className="gold-cta mt-6 inline-block text-xs"
                >
                  Download the PDF
                </a>
                <p className="mt-6 text-xs leading-relaxed text-foreground/50">
                  Next Door: the free 10-day email course walks the full arc, one
                  pattern per day —{' '}
                  <a href="/email-course" className="text-copper underline underline-offset-4 hover:text-gold">
                    the Ten Doors
                  </a>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={submit}>
                <p className="section-label mb-3">Where the primer goes</p>
                <p className="mb-5 text-sm leading-relaxed text-foreground/70">
                  Leave an address and the download opens in place. You also join
                  the Dispatch — occasional letters from the work, no noise, one
                  click to leave.
                </p>
                <label htmlFor="primer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="primer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="glass-chip w-full px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/40 focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/40"
                  aria-describedby={state === 'error' ? 'primer-error' : undefined}
                />
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="gold-cta mt-3 w-full text-xs disabled:opacity-50"
                >
                  {state === 'sending' ? 'Opening the gate…' : 'Send me the primer'}
                </button>
                {state === 'error' && (
                  <p id="primer-error" className="mt-3 text-xs leading-snug text-red-300/80" role="alert">
                    {message}
                  </p>
                )}
                <p className="mt-4 text-[11px] leading-relaxed text-foreground/40">
                  First-party storage only — the address never leaves the mirror.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

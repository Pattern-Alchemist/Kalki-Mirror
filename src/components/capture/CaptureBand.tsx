'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { track } from '@/lib/analytics/track';

/**
 * CAPTURE BAND — Leak L3 fix (Platform Blueprint Vol. III, Ch. 8/12).
 *
 * One inline capture surface for folio pages: offers the 10 Doors email
 * course at the exact moment a seeker finishes reading. Posts to the
 * existing /api/email-course/subscribe endpoint (first-party EmailSubscriber
 * table, attribution cookie, honeypot, rate-limited). Fires the
 * `email_subscribed` event into the first-party analytics store so the
 * funnel widgets can attribute signups to the hosting folio.
 *
 * Placement: mounted on the evidence-based top-20 folio surfaces —
 * patterns/[slug], archive/[slug], archetypes/[id], karma, and the
 * aghori-tantra phase pages (one component, five templates, ~150 folios).
 *
 * Fail-soft: subscribe errors stay inline and quiet; telemetry never throws.
 */

type CaptureState = 'idle' | 'sending' | 'done' | 'error';

interface CaptureBandProps {
  /** Folio identifier for attribution, e.g. "pattern:the-void". */
  topic: string;
  /** Kicker label above the heading. */
  kicker?: string;
  /** Heading line. */
  heading?: string;
  /** Supporting line under the heading. */
  note?: string;
  /** Optional class passthrough for spacing overrides. */
  className?: string;
}

export default function CaptureBand({
  topic,
  kicker = 'Ten Doors · A Free Course',
  heading = 'Ten days. Ten doors into the tradition.',
  note = 'One letter a day from the Archive — evidence-graded, no mythology, unsubscribe anytime.',
  className = '',
}: CaptureBandProps) {
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — humans never see it
  const [state, setState] = useState<CaptureState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const reduced = useReducedMotion();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === 'sending') return;
    setState('sending');
    setErrorMsg(null);
    try {
      const res = await fetch('/api/email-course/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, doorDay: null }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (res.ok && data?.ok) {
        track('email_subscribed', { slug: topic, properties: { source: 'capture_band' } });
        setState('done');
        setEmail('');
      } else {
        setErrorMsg(data?.error ?? 'Could not subscribe right now. Try again shortly.');
        setState('error');
      }
    } catch {
      setErrorMsg('The gate did not answer. Try again shortly.');
      setState('error');
    }
  }

  return (
    <motion.section
      aria-label="Subscribe to the Ten Doors email course"
      className={`glass-chip px-6 py-10 sm:px-10 text-center ${className}`}
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <p className="section-label mb-4">{kicker}</p>

      {state === 'done' ? (
        <div role="status">
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3 tracking-wide">
            The first door opens in your inbox.
          </h2>
          <p className="text-foreground/70 text-sm leading-relaxed max-w-md mx-auto">
            You are on the list — Door One is on its way to <span className="text-gold">{email || 'your address'}</span>.
          </p>
        </div>
      ) : (
        <>
          <h2 className="font-display text-2xl md:text-3xl text-foreground mb-3 tracking-wide">
            {heading}
          </h2>
          <p className="text-foreground/70 text-sm leading-relaxed max-w-md mx-auto mb-6">
            {note}
          </p>

          <form onSubmit={handleSubmit} className="max-w-md mx-auto" noValidate={false}>
            {/* Honeypot — bots fill it, humans never see it. */}
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                aria-label="Email address"
                className="w-full flex-1 min-h-[48px] rounded-lg border border-white/15 bg-black/40 px-5 py-3.5 text-white placeholder:text-foreground/30 focus:border-gold/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={state === 'sending'}
                className="gold-cta min-h-[48px] whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {state === 'sending' ? 'Opening…' : 'Begin Door One'}
              </button>
            </div>
            {state === 'error' && errorMsg && (
              <p role="alert" className="text-copper text-sm mt-3">
                {errorMsg}
              </p>
            )}
            <p className="text-foreground/40 text-xs mt-4">
              First-party only — your address lives on this platform, nowhere else.
            </p>
          </form>
        </>
      )}
    </motion.section>
  );
}

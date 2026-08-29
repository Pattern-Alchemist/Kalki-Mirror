'use client';

import { useState, useCallback } from 'react';
import { track } from '@/lib/analytics/track';

/**
 * Newsletter signup — the owned-channel capture point.
 * Posts to /api/subscribe (first-party storage, no external service).
 * Sits in the footer on every page.
 */
export function NewsletterSignup({ source = 'footer' }: { source?: string }) {
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
          body: JSON.stringify({ email, source }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success) {
          setState('done');
          setMessage(
            data.status === 'exists'
              ? 'The mirror already holds your address. Welcome back.'
              : 'Received. The dispatch will find you.'
          );
          track('email_subscribed', { properties: { source, status: data.status } });
        } else {
          setState('error');
          setMessage(data.error || 'The mirror is fogged. Try again.');
        }
      } catch {
        setState('error');
        setMessage('The mirror is fogged. Try again.');
      }
    },
    [email, source, state]
  );

  if (state === 'done') {
    return (
      <div>
        <p className="section-label mb-3">The Dispatch</p>
        <p className="text-gold text-sm leading-relaxed" role="status">
          {message}
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="section-label mb-3">The Dispatch</p>
      <p className="text-text-secondary text-sm leading-relaxed mb-4 max-w-xs">
        Occasional letters from the work — new folios, pattern notes, and
        practice material. No noise, no schedule worship.
      </p>
      <form onSubmit={submit} className="flex flex-col gap-2">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
          className="glass-chip px-4 py-2.5 text-sm text-foreground placeholder:text-text-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/40 w-full"
          aria-describedby={state === 'error' ? 'newsletter-error' : undefined}
        />
        <button
          type="submit"
          disabled={state === 'sending'}
          className="gold-cta text-xs w-full disabled:opacity-50"
        >
          {state === 'sending' ? 'Recording…' : 'Join the Dispatch'}
        </button>
        {state === 'error' && (
          <p id="newsletter-error" className="text-red-300/80 text-xs leading-snug" role="alert">
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

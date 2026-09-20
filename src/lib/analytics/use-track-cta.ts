'use client';

import { useCallback } from 'react';
import { track } from '@/lib/analytics/track';

// =============================================================
// AUDIT #5 — CTA click tracker hook
// -------------------------------------------------------------
// Wraps any onClick handler to fire a 'cta_click' event before
// the original handler runs. Usage:
//
//   const trackCta = useTrackCTA();
//   <button onClick={trackCta('pricing-cta', 'See Pricing', () => router.push('/pricing'))}>
//     See Pricing
//   </button>
//
// Or for link elements:
//   <Link href="/pricing" onClick={trackCta('pricing-cta', 'See Pricing')}>
//     See Pricing
//   </Link>
// =============================================================

export function useTrackCTA() {
  return useCallback(
    (ctaId: string, ctaText: string, onClick?: () => void) => {
      return (e?: React.MouseEvent) => {
        track('cta_click', {
          properties: {
            ctaId,
            ctaText,
            path: typeof window !== 'undefined' ? window.location.pathname : '/',
            destination: onClick ? undefined : (e?.currentTarget as HTMLAnchorElement)?.href,
          },
        });
        onClick?.();
      };
    },
    [],
  );
}

/**
 * Fire a 'subscribe_submit' event. Call from the subscribe form's
 * onSubmit handler, after success/failure is known.
 */
export function trackSubscribeSubmit(source: string, success: boolean) {
  track('subscribe_submit', {
    properties: {
      source,
      success,
      path: typeof window !== 'undefined' ? window.location.pathname : '/',
    },
  });
}

/**
 * Fire a 'consultation_funnel_step' event. Call at each step of the
 * consultation intake flow (step 1: view form, step 2: fill, step 3: submit).
 */
export function trackConsultationStep(step: string) {
  track('consultation_funnel_step', {
    properties: {
      step,
      path: typeof window !== 'undefined' ? window.location.pathname : '/',
    },
  });
}

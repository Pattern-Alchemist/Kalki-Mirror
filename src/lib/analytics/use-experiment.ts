'use client';

import { useState, useEffect } from 'react';

// =============================================================
// PATH B #3 — Public A/B experiment assignment hook
// -------------------------------------------------------------
// Reads the visitor's assigned variant from a cookie (kalki-exp-${id}).
// If no cookie exists, assigns one deterministically based on a
// random ID (stored in localStorage for stickiness). The assignment
// is sticky for 30 days.
//
// This is the PUBLIC-side companion to the admin Experiment model.
// The admin creates experiments; this hook assigns visitors.
// =============================================================

export interface ExperimentAssignment {
  variantId: string;
  isAssigned: boolean;
}

const COOKIE_PREFIX = 'kalki-exp-';
const SESSION_ID_KEY = 'kalki-exp-sid';
const COOKIE_MAX_AGE = 30 * 86_400; // 30 days

/** Get or create a stable session ID for variant assignment. */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    let sid = localStorage.getItem(SESSION_ID_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(SESSION_ID_KEY, sid);
    }
    return sid;
  } catch {
    return 'fallback';
  }
}

/** Read a cookie by name. */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

/** Set a cookie with a 30-day expiry. */
function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export interface VariantDef {
  id: string;
  weight: number; // 0-100
}

/**
 * Assign a visitor to a variant for the given experiment.
 * Uses weighted random selection based on the session ID hash.
 * Sticky via cookie.
 *
 * Usage:
 *   const { variantId } = useExperiment('pricing-headline', [
 *     { id: 'A', weight: 50 },
 *     { id: 'B', weight: 50 },
 *   ]);
 *   const headline = variantId === 'B' ? 'Choose Your Path' : 'The Covenant';
 */
export function useExperiment(
  experimentId: string,
  variants: VariantDef[],
): ExperimentAssignment {
  const [assignment, setAssignment] = useState<ExperimentAssignment>({
    variantId: variants[0]?.id ?? 'A',
    isAssigned: false,
  });

  useEffect(() => {
    if (variants.length === 0) return;
    const cookieName = `${COOKIE_PREFIX}${experimentId}`;
    const existing = getCookie(cookieName);

    if (existing && variants.some(v => v.id === existing)) {
      setAssignment({ variantId: existing, isAssigned: true });
      return;
    }

    // Assign based on session ID hash (deterministic per visitor)
    const sid = getSessionId();
    let hash = 0;
    for (let i = 0; i < sid.length; i++) {
      hash = ((hash << 5) - hash + sid.charCodeAt(i)) | 0;
    }
    const rand = Math.abs(hash) % 100;
    let cumulative = 0;
    let assigned = variants[0].id;
    for (const v of variants) {
      cumulative += v.weight;
      if (rand < cumulative) {
        assigned = v.id;
        break;
      }
    }
    setCookie(cookieName, assigned);
    setAssignment({ variantId: assigned, isAssigned: true });
  }, [experimentId, variants]);

  return assignment;
}

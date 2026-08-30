'use client';

import { useEffect } from 'react';
import { captureAttribution } from '@/lib/attribution';

/**
 * Invisible client component mounted once in the root layout.
 * Records the visit's UTM/referral attribution into the first-party
 * `kr_attribution` cookie (90 days) so the consultation server action can
 * stamp every lead with its source. Fail-silent; renders nothing.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}

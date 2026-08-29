'use client';

import { useEffect, useRef } from 'react';
import { track, type TrackEventName } from '@/lib/analytics/track';

/**
 * Fire-once page-view tracker for server components.
 * Mount inside any page: <TrackView event="karma_page_viewed" slug="karma" />
 */
export function TrackView({
  event,
  slug,
  properties,
}: {
  event: TrackEventName;
  slug?: string;
  properties?: Record<string, unknown>;
}) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, { slug, properties });
  }, [event, slug, properties]);
  return null;
}

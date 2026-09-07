'use client';

/**
 * First-party analytics client (TGA §12 event dictionary).
 *
 * Zero external services: events POST to /api/events and land in the
 * first-party Turso store. sendBeacon keeps delivery alive through page
 * unload; fetch keepalive is the fallback. Sessions persist in
 * sessionStorage so a seeker's visit groups under one id without cookies.
 */

// The event dictionary lives in ONE place (src/lib/analytics-shared.ts).
// The client previously carried a duplicated copy that could drift
// silently — replaced in Vol. 4 #6 with a type-only import, which
// vanishes at runtime, so the client bundle stays server-free.
import type { EventName } from '@/lib/analytics-shared';

export type TrackEventName = EventName;

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem('kalki_sid');
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem('kalki_sid', sid);
    }
    return sid;
  } catch {
    return 'anon';
  }
}

export function track(
  event: TrackEventName,
  opts?: { slug?: string; properties?: Record<string, unknown> }
): void {
  try {
    const payload = JSON.stringify({
      event,
      path: window.location.pathname,
      slug: opts?.slug,
      properties: opts?.properties,
      sessionId: getSessionId(),
    });
    if (typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon('/api/events', new Blob([payload], { type: 'application/json' }));
    } else {
      void fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      });
    }
  } catch {
    // never surface telemetry errors
  }
}

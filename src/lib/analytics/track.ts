'use client';

/**
 * First-party analytics client (TGA §12 event dictionary).
 *
 * Zero external services: events POST to /api/events and land in the
 * first-party Turso store. sendBeacon keeps delivery alive through page
 * unload; fetch keepalive is the fallback. Sessions persist in
 * sessionStorage so a seeker's visit groups under one id without cookies.
 */

const EVENT_NAMES = [
  'folio_viewed',
  'pattern_viewed',
  'glossary_term_viewed',
  'search_performed',
  'archetype_viewed',
  'karma_page_viewed',
  'aghori_lesson_viewed',
  'aghori_phase_viewed',
  'breathwork_viewed',
  'sequence_viewed',
  'pricing_viewed',
  'dossier_started',
  'dossier_completed',
  'consultation_started',
  // Consultation-wizard funnel (lead-capture pipeline):
  'wizard_step_completed',
  'wizard_submitted',
  'whatsapp_handoff_clicked',
  'email_subscribed',
] as const;

export type TrackEventName = (typeof EVENT_NAMES)[number];

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

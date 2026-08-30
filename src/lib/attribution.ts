/**
 * KALKI ATTRIBUTION LAYER — first-party, cookie-based, zero external calls.
 *
 * WHY: every consultation lead should answer "where did this seeker come
 * from?" — campaign (utm_*), paid click (gclid/fbclid/…), referring site,
 * or direct. The snapshot is captured once per browser into a 90-day cookie
 * (`kr_attribution`) and written into the Consultation row at submit time by
 * the server action. Nothing leaves the origin; analytics stays first-party.
 *
 * SEMANTICS (industry-standard, simplified):
 *   first touch  — frozen at the very first capture inside the cookie window
 *   last touch   — updated on every NEW tracked arrival (utm/click-id present)
 *                  or referral; a direct return NEVER overwrites a known
 *                  last touch (last-non-direct rule)
 *   sessions     — increments when 30+ minutes passed since the previous
 *                  tracked arrival
 *
 * Everything here is fail-silent by design: attribution must never break UX
 * or the lead funnel. The server re-validates on read, so a malformed or
 * tampered cookie degrades to `null` (no attribution), not an error.
 */

export const ATTRIBUTION_COOKIE = 'kr_attribution';
const COOKIE_MAX_AGE_S = 60 * 60 * 24 * 90; // 90 days
const SESSION_GAP_MS = 30 * 60 * 1000; // 30 min inactivity = new session
const MAX_JSON_LEN = 1800; // cookie budget — snapshot is ~400B, hard cap for safety

export interface Touch {
  source?: string; // utm_source | ad platform | referral host | 'direct'
  medium?: string; // utm_medium | 'cpc' | 'referral' | 'direct'
  campaign?: string;
  term?: string;
  content?: string;
  clickId?: string; // gclid | fbclid | msclkid | ttclid
  referrer?: string; // full document.referrer at arrival ('' when none)
  landingPath?: string; // path+search at arrival (first touch mainly)
  ts: string; // ISO timestamp
}

export interface AttributionSnapshot {
  first: Touch;
  last: Touch;
  sessions: number;
}

/* ─── Cookie IO (browser) ─────────────────────────────────────────────────── */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const hit = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${COOKIE_MAX_AGE_S}; path=/; SameSite=Lax`;
}

/* ─── Parse / serialize (isomorphic, used by client AND server) ───────────── */

export function parseAttributionCookie(raw: string | null | undefined): AttributionSnapshot | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as Partial<AttributionSnapshot>;
    if (!obj || typeof obj !== 'object' || !obj.first || !obj.last) return null;
    if (typeof obj.first.ts !== 'string' || typeof obj.last.ts !== 'string') return null;
    const snap: AttributionSnapshot = {
      first: obj.first,
      last: obj.last,
      sessions: typeof obj.sessions === 'number' && obj.sessions > 0 ? Math.floor(obj.sessions) : 1,
    };
    if (JSON.stringify(snap).length > MAX_JSON_LEN) return null;
    return snap;
  } catch {
    return null;
  }
}

export function serializeAttribution(snap: AttributionSnapshot): string | null {
  try {
    const json = JSON.stringify(snap);
    return json.length <= MAX_JSON_LEN ? json : null;
  } catch {
    return null;
  }
}

/* ─── Arrival classification (browser) ────────────────────────────────────── */

const CLICK_ID_SOURCE: Record<string, string> = {
  gclid: 'google-ads',
  wbraid: 'google-ads',
  fbclid: 'facebook',
  msclkid: 'bing-ads',
  ttclid: 'tiktok',
};

function referrerHost(referrer: string): string | null {
  if (!referrer) return null;
  try {
    const h = new URL(referrer).hostname;
    return h && h !== location.hostname ? h.toLowerCase() : null;
  } catch {
    return null;
  }
}

/** Classifies the current page arrival. Returns null when nothing is trackable. */
function classifyArrival(): Touch | null {
  const params = new URLSearchParams(location.search);

  const clickKey = Object.keys(CLICK_ID_SOURCE).find((k) => params.get(k));
  const utm = {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    term: params.get('utm_term') || undefined,
    content: params.get('utm_content') || undefined,
  };
  const hasUtm = Boolean(utm.source || utm.medium || utm.campaign || utm.term || utm.content);

  const ref = typeof document !== 'undefined' ? document.referrer : '';
  const refHost = referrerHost(ref);

  // Paid click without utm_source still gets a canonical source.
  const clickId = clickKey;
  if (!hasUtm && !clickId && !refHost) return null; // direct arrival — handled by caller

  const touch: Touch = {
    ts: new Date().toISOString(),
    referrer: ref || undefined,
    landingPath: `${location.pathname}${location.search}`.slice(0, 300),
  };
  if (hasUtm) {
    touch.source = utm.source;
    touch.medium = utm.medium;
    touch.campaign = utm.campaign;
    touch.term = utm.term;
    touch.content = utm.content;
  }
  if (!touch.source && clickId) {
    touch.source = CLICK_ID_SOURCE[clickId];
    touch.medium = touch.medium || 'cpc';
  }
  if (!touch.source && refHost) {
    touch.source = refHost;
    touch.medium = touch.medium || 'referral';
  }
  if (clickId) touch.clickId = clickId;
  return touch;
}

/** Browser read of the current snapshot (for event properties, dashboards). */
export function getAttribution(): AttributionSnapshot | null {
  try {
    return parseAttributionCookie(readCookie(ATTRIBUTION_COOKIE));
  } catch {
    return null;
  }
}

/**
 * Capture the current arrival. Call once on app mount (AttributionCapture).
 * Never throws.
 */
export function captureAttribution(): void {
  try {
    if (typeof location === 'undefined') return;
    // Skip admin/preview surfaces — leads only ever originate on public pages.
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/api')) return;

    const now = Date.now();
    const prev = getAttribution();
    const touch = classifyArrival();

    if (!prev) {
      // First capture in the window. Direct arrivals get an explicit
      // 'direct' touch so the funnel can distinguish "no cookie yet"
      // (later utm arrival) from a true direct visit.
      const first: Touch = touch ?? {
        source: 'direct',
        medium: 'direct',
        landingPath: `${location.pathname}${location.search}`.slice(0, 300),
        ts: new Date(now).toISOString(),
      };
      const snap: AttributionSnapshot = { first, last: { ...first }, sessions: 1 };
      const json = serializeAttribution(snap);
      if (json) writeCookie(ATTRIBUTION_COOKIE, json);
      return;
    }

    // Returning visitor: update last touch + session count.
    const isNewSession = now - new Date(prev.last.ts).getTime() > SESSION_GAP_MS;
    const last: Touch = touch && !(touch.source === undefined) ? touch : prev.last;

    // Direct return → keep the previous last touch (last-non-direct rule);
    // only refresh the timestamp on a new session.
    const next: AttributionSnapshot = {
      first: prev.first,
      last,
      sessions: prev.sessions + (isNewSession ? 1 : 0),
    };
    if (isNewSession && !touch) {
      next.last = { ...prev.last, ts: new Date(now).toISOString() };
    }
    const json = serializeAttribution(next);
    if (json) writeCookie(ATTRIBUTION_COOKIE, json);
  } catch {
    // fail-silent
  }
}

/* ─── Server-side helpers (server actions / routes) ───────────────────────── */

/** Referrer URL → registrable domain for the flat column. */
export function referrerDomainOf(referrer: string | null | undefined): string | null {
  if (!referrer) return null;
  try {
    const h = new URL(referrer).hostname.toLowerCase();
    return h || null;
  } catch {
    return null;
  }
}

/** Canonical display source for chips/rollups: last touch source or 'direct'. */
export function attributionSource(snap: AttributionSnapshot | null): string | null {
  return snap?.last.source ?? null;
}

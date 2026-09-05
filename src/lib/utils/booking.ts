/**
 * Tier-3 ③ — Cal.com booking handoff (roadmap #13).
 *
 * After payment (or instead of back-and-forth scheduling), hand the
 * seeker a real calendar. Env-first, runtime-read — the same contract
 * as UPI_VPA: set CAL_BOOKING_URL in Vercel (e.g. the free-tier
 * cal.com/<user>/kalki-session link) and the block appears on the
 * next server action response. No rebuild, no code change, and the
 * wizard stays WhatsApp-only when unset.
 *
 * Accepts a full Cal.com URL (https://cal.com/kaustubh/kalki-session)
 * or a bare path (kaustubh/kalki-session → https://cal.com/<path>).
 */

export interface BookingConfig {
  url: string;
}

function normalize(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (/^https:\/\/(cal\.com|cal\.dev)\/.+/i.test(v)) return v;
  // bare "user/event" or "user" path → cal.com
  if (/^[a-zA-Z0-9][\w.-]*(\/[\w.-]+)*$/.test(v)) return `https://cal.com/${v}`;
  return null;
}

/** Server-side resolver for the action result — null when unset/invalid. */
export function resolveBookingConfig(): BookingConfig | null {
  const url = normalize(process.env.CAL_BOOKING_URL ?? process.env.NEXT_PUBLIC_CAL_BOOKING_URL ?? '');
  return url ? { url } : null;
}

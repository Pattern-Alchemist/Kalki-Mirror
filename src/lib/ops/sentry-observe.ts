// =============================================================
// KALKI — Sentry spike observer (Vol. 6 #5)
// -------------------------------------------------------------
// The digest's window into the error plane. When the founder flips
// the Sentry env trio (SENTRY_AUTH_TOKEN + SENTRY_ORG +
// SENTRY_PROJECT — the DSN alone activates capture, the trio
// activates OBSERVATION), this module reads the last 24h of
// unresolved issues and the digest speaks when NEW issues appear.
//
// Posture, mirroring every other digest block:
//   unconfigured → no line at all (the flip is founder-gated; an
//                  absent sensor is not an incident)
//   clean        → no line (the digest goes quiet on green)
//   new issues   → one line: count, unresolved total, top issue
//   fetch error  → no line, console.error (fail-soft; uptime.yml
//                  and the drills cover the rest of the plane)
// =============================================================

const SENTRY_API = "https://sentry.io/api/0";

export interface SentryIssueLite {
  shortId: string;
  title: string;
  count: number;
  firstSeen: string;
}

export interface SentrySpikeState {
  configured: boolean;
  newCount: number;
  unresolvedTotal: number;
  top: SentryIssueLite[];
}

export function isSentryObserved(): boolean {
  return Boolean(
    process.env.SENTRY_AUTH_TOKEN &&
      process.env.SENTRY_ORG &&
      process.env.SENTRY_PROJECT,
  );
}

/** Pure — parse the organizations/{org}/issues/ payload into the lite
 *  shape (defensive: Sentry adds fields freely, we take three). */
export function parseSentryIssues(payload: unknown): SentryIssueLite[] {
  if (!Array.isArray(payload)) return [];
  const out: SentryIssueLite[] = [];
  for (const raw of payload) {
    if (!raw || typeof raw !== "object") continue;
    const obj = raw as Record<string, unknown>;
    const shortId = typeof obj.shortId === "string" ? obj.shortId : "?";
    const title = typeof obj.title === "string" ? obj.title : "unknown issue";
    const rawCount =
      typeof obj.count === "string" ? Number(obj.count) : obj.count;
    const count = typeof rawCount === "number" && Number.isFinite(rawCount) ? rawCount : 0;
    const firstSeen = typeof obj.firstSeen === "string" ? obj.firstSeen : "";
    out.push({ shortId, title, count, firstSeen });
  }
  return out;
}

/** Pure — how many of the issues are genuinely NEW (first seen within
 *  the window). Sentry's statsPeriod bounds "active"; firstSeen bounds
 *  "new", which is what the digest means by a spike. */
export function countNewIssues(issues: SentryIssueLite[], now: Date, windowMs = 24 * 3600_000): number {
  return issues.filter((i) => {
    const t = Date.parse(i.firstSeen);
    return Number.isFinite(t) && now.getTime() - t <= windowMs;
  }).length;
}

export function sentryDigestLine(state: SentrySpikeState | null): string {
  if (!state || !state.configured) return "";
  if (state.newCount <= 0) return "";
  const top = state.top[0];
  return (
    `SENTRY: ${state.newCount} new issue${state.newCount === 1 ? "" : "s"} in 24h ` +
    `(${state.unresolvedTotal} unresolved)` +
    (top ? ` — e.g. ${top.shortId} ${top.title.slice(0, 80)}` : "")
  );
}

/** Fetch the last-24h unresolved issues. Returns null when
 *  unconfigured or on any fetch failure (fail-soft, never the digest). */
export async function readSentrySpike(now: Date = new Date()): Promise<SentrySpikeState | null> {
  if (!isSentryObserved()) return null;
  const org = process.env.SENTRY_ORG as string;
  const token = process.env.SENTRY_AUTH_TOKEN as string;
  const url =
    `${SENTRY_API}/organizations/${encodeURIComponent(org)}/issues/` +
    `?statsPeriod=24h&query=is%3Aunresolved&sort=new&per_page=10`;
  try {
    const req = new Request(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await fetch(req, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.error("[sentry-observe] issues fetch failed", res.status);
      return null;
    }
    const issues = parseSentryIssues(await res.json());
    const newCount = countNewIssues(issues, now);
    const unresolvedTotal = issues.reduce((s, i) => s + i.count, 0);
    return { configured: true, newCount, unresolvedTotal, top: issues.slice(0, 3) };
  } catch (err) {
    console.error("[sentry-observe] probe failed", err);
    return null;
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — AI route stats aggregation (Vol. 4 #17)
   ---------------------------------------------------------------------------
   Pure half of readAiRouteStats (analytics-db): turns raw AnalyticsEvent
   rows (ai_* events written by src/lib/ai/observe.ts) into the per-route
   rollup the war-room panel renders. Kept free of any I/O so vitest can
   pin the aggregation exactly — percentiles, outcome buckets, last-seen.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface AiRouteStat {
  event: string;
  calls: number;
  ok: number;
  limited: number;
  invalid: number;
  unconfigured: number;
  error: number;
  p50: number;
  p95: number;
  lastAt: string | null;
}

export interface AiEventRow {
  event: string;
  properties: string | null;
  createdAt: string | null;
}

const OUTCOMES = ['ok', 'limited', 'invalid', 'unconfigured', 'error'] as const;
type AiOutcomeKey = (typeof OUTCOMES)[number];

/** Median of a sorted numeric array (index-average convention for even n). */
function median(sorted: number[]): number {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]
    : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 100) / 100;
}

/** Nearest-rank percentile of a sorted numeric array. */
function percentile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
}

/**
 * Aggregate raw ai_* event rows into per-route stats, sorted by call volume.
 * Rows for non-ai_ events are ignored; malformed properties JSON still counts
 * the call but skips the props — telemetry must never distort traffic truth.
 */
export function aggregateAiRouteStats(
  rows: readonly AiEventRow[],
  aiNames: readonly string[],
): AiRouteStat[] {
  interface Agg {
    calls: number;
    lat: number[];
    outcomes: Record<AiOutcomeKey, number>;
    lastAt: string | null;
  }
  const aiSet = new Set(aiNames);
  const byEvent = new Map<string, Agg>();

  for (const row of rows) {
    const ev = String(row.event);
    if (!aiSet.has(ev)) continue;
    let agg = byEvent.get(ev);
    if (!agg) {
      agg = { calls: 0, lat: [], outcomes: { ok: 0, limited: 0, invalid: 0, unconfigured: 0, error: 0 }, lastAt: null };
      byEvent.set(ev, agg);
    }
    agg.calls += 1;
    const raw = row.properties != null ? String(row.properties) : '';
    if (raw) {
      try {
        const p = JSON.parse(raw) as { latency_ms?: unknown; outcome?: unknown };
        if (typeof p.latency_ms === 'number' && Number.isFinite(p.latency_ms) && p.latency_ms >= 0) {
          agg.lat.push(p.latency_ms);
        }
        if (typeof p.outcome === 'string' && (OUTCOMES as readonly string[]).includes(p.outcome)) {
          agg.outcomes[p.outcome as AiOutcomeKey] += 1;
        }
      } catch {
        // malformed properties — the call still counts, the props are skipped
      }
    }
    const createdAt = row.createdAt != null ? String(row.createdAt) : null;
    if (createdAt && (!agg.lastAt || createdAt > agg.lastAt)) agg.lastAt = createdAt;
  }

  return [...byEvent.entries()]
    .map(([event, a]) => {
      const lat = [...a.lat].sort((x, y) => x - y);
      return {
        event,
        calls: a.calls,
        ok: a.outcomes.ok,
        limited: a.outcomes.limited,
        invalid: a.outcomes.invalid,
        unconfigured: a.outcomes.unconfigured,
        error: a.outcomes.error,
        p50: median(lat),
        p95: percentile(lat, 0.95),
        lastAt: a.lastAt,
      };
    })
    .sort((x, y) => y.calls - x.calls || x.event.localeCompare(y.event));
}

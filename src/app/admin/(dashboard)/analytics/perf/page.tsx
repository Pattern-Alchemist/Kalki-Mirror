"use client";

import { useAdminSWR } from "@/components/admin/use-admin-swr";

// =============================================================
// VOL. 2 #18 — Core Web Vitals Perf Dashboard
// -------------------------------------------------------------
// Shows p50/p75/p95 per metric (LCP, FID, CLS, INP, TTFB) +
// per-route + per-device breakdowns. Reads from the web_vitals
// events fired by the WebVitalsBeacon component.
// =============================================================

interface MetricStat {
  metric: string;
  count: number;
  p50: number | null;
  p75: number | null;
  p95: number | null;
  goodCount: number;
  needsImprovementCount: number;
  poorCount: number;
}

interface RouteStat {
  path: string;
  count: number;
  medianLcp: number | null;
  medianCls: number | null;
}

interface PerfResponse {
  totalSamples: number;
  rangeDays: number;
  byMetric: MetricStat[];
  byRoute: RouteStat[];
  byDevice: [string, number][];
}

const METRIC_UNIT: Record<string, string> = {
  LCP: 'ms',
  FID: 'ms',
  INP: 'ms',
  TTFB: 'ms',
  CLS: '', // unitless score
};

const METRIC_THRESHOLD: Record<string, { good: number; poor: number }> = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  TTFB: { good: 800, poor: 1800 },
  CLS: { good: 0.1, poor: 0.25 },
};

function fmtMetric(metric: string, value: number | null): string {
  if (value === null) return '—';
  if (metric === 'CLS') return value.toFixed(3);
  return `${Math.round(value)}${METRIC_UNIT[metric] || ''}`;
}

function metricColor(metric: string, value: number | null): string {
  if (value === null) return 'text-[var(--aw-text-3)]';
  const t = METRIC_THRESHOLD[metric];
  if (!t) return 'text-[var(--aw-text)]';
  if (value <= t.good) return 'text-emerald-400';
  if (value <= t.poor) return 'text-amber-300';
  return 'text-red-400';
}

export default function PerfDashboardPage() {
  const { data, loading, error } = useAdminSWR<PerfResponse>({
    key: 'admin-perf',
    fetcher: async () => {
      const r = await fetch('/api/admin/web-vitals?range=7');
      if (!r.ok) throw new Error('Failed to load perf data');
      return r.json();
    },
    refreshInterval: 5 * 60_000,
    revalidateOnFocus: false,
  });

  if (loading && !data) return <div className="text-center py-20 text-[var(--aw-text-2)]">Loading perf dashboard…</div>;
  if (error) return <div className="text-center py-20 text-red-400">{error.message}</div>;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--aw-text)]">Core Web Vitals</h1>
        <p className="mt-1 text-sm text-[var(--aw-text-2)]">
          Real-user monitoring. {data.totalSamples} samples over the last {data.rangeDays} days. Beacon fires once per session via the WebVitalsBeacon component.
        </p>
      </div>

      {data.totalSamples === 0 ? (
        <div className="aw-card text-center py-12">
          <p className="text-sm text-[var(--aw-text-2)]">
            No Web Vitals samples yet. The beacon fires once per session — visit the public site to seed data.
          </p>
        </div>
      ) : (
        <>
          {/* Per-metric breakdown */}
          <section className="aw-card">
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Per Metric</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]">
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Metric</th>
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Samples</th>
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">p50</th>
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">p75</th>
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">p95</th>
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Good</th>
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">NI</th>
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Poor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data.byMetric.map(m => (
                    <tr key={m.metric} className="hover:bg-[var(--aw-glass-1)]/30">
                      <td className="px-4 py-3 font-medium text-[var(--aw-text)]">{m.metric}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--aw-text-2)]">{m.count}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${metricColor(m.metric, m.p50)}`}>{fmtMetric(m.metric, m.p50)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${metricColor(m.metric, m.p75)}`}>{fmtMetric(m.metric, m.p75)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${metricColor(m.metric, m.p95)}`}>{fmtMetric(m.metric, m.p95)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-emerald-400">{m.goodCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-amber-300">{m.needsImprovementCount}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-red-400">{m.poorCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Per-route */}
          <section className="aw-card">
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">
              Per Route — Top {data.byRoute.length}
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]">
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Path</th>
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Samples</th>
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Median LCP</th>
                    <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Median CLS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {data.byRoute.map(r => (
                    <tr key={r.path} className="hover:bg-[var(--aw-glass-1)]/30">
                      <td className="px-4 py-3 font-mono text-xs text-[var(--aw-cyan)]">{r.path}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[var(--aw-text-2)]">{r.count}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${metricColor('LCP', r.medianLcp)}`}>{fmtMetric('LCP', r.medianLcp)}</td>
                      <td className={`px-4 py-3 text-right tabular-nums ${metricColor('CLS', r.medianCls)}`}>{fmtMetric('CLS', r.medianCls)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Per device */}
          <section className="aw-card">
            <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">By Device</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {data.byDevice.map(([device, count]) => (
                <div
                  key={device}
                  className="flex items-center justify-between rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-1.5"
                  style={{ minWidth: '120px' }}
                >
                  <span className="text-xs text-[var(--aw-text-2)]">{device}</span>
                  <span className="text-xs tabular-nums text-[var(--aw-text)]">{count}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

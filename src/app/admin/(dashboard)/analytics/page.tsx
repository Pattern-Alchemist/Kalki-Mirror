"use client";
import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import type { AnalyticsSnapshot } from "@/lib/analytics-db";

const GROUP_COLORS: Record<string, string> = {
  Discovery: "text-blue-400 border-blue-500/20 bg-blue-500/5",
  Education: "text-amber-400 border-amber-500/20 bg-amber-500/5",
  Practice: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
  Conversion: "text-rose-400 border-rose-500/20 bg-rose-500/5",
  Retention: "text-violet-400 border-violet-500/20 bg-violet-500/5",
};

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  const colors: Record<string, string> = {
    amber: "border-amber-500/20 text-amber-400",
    emerald: "border-emerald-500/20 text-emerald-400",
    blue: "border-blue-500/20 text-blue-400",
    violet: "border-violet-500/20 text-violet-400",
  };
  const c = colors[accent || "amber"] || colors.amber;
  return (
    <div className={`rounded-xl border ${c} bg-zinc-900/50 p-5`}>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

function FunnelStep({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? Math.max(2, Math.round((count / max) * 100)) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-zinc-400">{label}</span>
        <span className="text-sm font-semibold tabular-nums text-zinc-200">{count}</span>
      </div>
      <div className="mt-1.5 h-2 w-full rounded-full bg-zinc-800">
        <div className="h-full rounded-full bg-amber-500/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [err, setErr] = useState("");

  const fetchAnalytics = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/analytics");
      if (!r.ok) throw new Error(await r.text());
      setData(await r.json());
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (err) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{err}</p>
        <button onClick={fetchAnalytics} className="mt-4 px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-medium hover:bg-amber-400">Retry</button>
      </div>
    );
  }
  if (!data) return <div className="text-center py-20 text-zinc-500">Loading analytics…</div>;

  if (!data.available) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">First-Party Analytics</h1>
          <p className="mt-1 text-sm text-zinc-500">The 15-event dictionary (TGA §12) across every public surface</p>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
          <p className="text-sm text-amber-400">Event store unreachable.</p>
          <p className="mt-2 text-sm text-zinc-400">
            The analytics tables live in Turso and self-create on the first write. This is expected
            in local development without Turso credentials, or when no event has been recorded yet.
            In production, verify <code className="rounded bg-zinc-800 px-1 text-xs">TURSO_DATABASE_URL</code> is set.
          </p>
        </div>
      </div>
    );
  }

  const chartData = data.daily.map((d) => ({ day: d.day.slice(5), count: d.count }));
  const funnelMax = Math.max(
    data.funnel.dossierStarted, data.funnel.dossierCompleted,
    data.funnel.pricingViewed, data.funnel.consultationStarted, 1,
  );
  const completionRate = data.funnel.dossierStarted > 0
    ? Math.round((data.funnel.dossierCompleted / data.funnel.dossierStarted) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">First-Party Analytics</h1>
          <p className="mt-1 text-sm text-zinc-500">The 15-event dictionary (TGA §12) across every public surface</p>
        </div>
        <p className="text-xs text-zinc-600">Times are UTC · windows: 7d / 30d / all-time</p>
      </div>

      {/* Headline stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Events (all-time)" value={data.totals.events} sub="since collection began" accent="amber" />
        <StatCard label="Events · 7 days" value={data.totals.events7d} sub="this week" accent="emerald" />
        <StatCard label="Events · 30 days" value={data.totals.events30d} sub="this month" accent="blue" />
        <StatCard label="Sessions · 30 days" value={data.totals.sessions30d} sub="unique sessionId" accent="violet" />
        <StatCard label="Subscribers" value={data.totals.subscribers} sub={`+${data.totals.subscribers30d} in 30d`} accent="amber" />
      </section>

      {/* Daily activity */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">Daily Activity (30 days)</h2>
        {chartData.length === 0 ? (
          <p className="text-sm text-zinc-600">No events in the window yet. Traffic is arriving — the corpus surface was indexed only recently.</p>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(245, 158, 11, 0.08)" }}
                  contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                <Bar dataKey="count" name="events" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Event dictionary table */}
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">Event Dictionary — 15 signals</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-600">
                  <th className="pb-2 pr-4 font-medium">Signal</th>
                  <th className="pb-2 pr-4 text-right font-medium">7d</th>
                  <th className="pb-2 pr-4 text-right font-medium">30d</th>
                  <th className="pb-2 text-right font-medium">All</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((e) => (
                  <tr key={e.event} className="border-b border-zinc-800/50 last:border-0">
                    <td className="py-2 pr-4">
                      <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${GROUP_COLORS[e.group] || GROUP_COLORS.Discovery}`}>
                        {e.group}
                      </span>
                      <span className="ml-2 text-zinc-300">{e.label}</span>
                    </td>
                    <td className="py-2 pr-4 text-right tabular-nums text-zinc-400">{e.count7d}</td>
                    <td className="py-2 pr-4 text-right tabular-nums text-zinc-200">{e.count30d}</td>
                    <td className="py-2 text-right tabular-nums text-zinc-500">{e.countAll}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          {/* Conversion funnel */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">Conversion Funnel (30 days)</h2>
            <div className="space-y-4">
              <FunnelStep label="Pricing viewed" count={data.funnel.pricingViewed} max={funnelMax} />
              <FunnelStep label="Assessment started" count={data.funnel.dossierStarted} max={funnelMax} />
              <FunnelStep label="Assessment completed" count={data.funnel.dossierCompleted} max={funnelMax} />
              <FunnelStep label="Consultation intent" count={data.funnel.consultationStarted} max={funnelMax} />
            </div>
            {data.funnel.dossierStarted > 0 && (
              <p className="mt-4 text-xs text-zinc-500">
                Assessment completion rate: <span className="font-semibold text-zinc-300">{completionRate}%</span>
                {" "}— the hybrid station gate (TGA §8) will eventually read this same signal.
              </p>
            )}
          </section>

          {/* Top content */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">Top Content (30 days)</h2>
            {data.topContent.length === 0 ? (
              <p className="text-sm text-zinc-600">No content views recorded yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.topContent.map((t, i) => (
                  <li key={t.slug} className="flex items-center gap-3 text-sm">
                    <span className="w-5 text-right text-xs tabular-nums text-zinc-600">{i + 1}</span>
                    <span className="flex-1 truncate font-mono text-xs text-zinc-300">{t.slug}</span>
                    <span className="tabular-nums text-zinc-400">{t.views}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Subscribers */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Newsletter Subscribers — recent {data.recentSubscribers.length}
        </h2>
        {data.recentSubscribers.length === 0 ? (
          <p className="text-sm text-zinc-600">No subscribers yet. The signup lives in the footer (NewsletterSignup) with rate-limited ingestion.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-600">
                  <th className="pb-2 pr-4 font-medium">Email</th>
                  <th className="pb-2 pr-4 font-medium">Source</th>
                  <th className="pb-2 font-medium">Joined (UTC)</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSubscribers.map((s) => (
                  <tr key={s.email} className="border-b border-zinc-800/50 last:border-0">
                    <td className="py-2 pr-4 text-zinc-200">{s.email}</td>
                    <td className="py-2 pr-4 text-zinc-500">{s.source || "footer"}</td>
                    <td className="py-2 tabular-nums text-zinc-500">{s.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  RefreshCw, Download, Copy, Check, ExternalLink,
  ArrowUpRight, ArrowDownRight, Pause, Play, Inbox,
} from "lucide-react";
import type { AnalyticsSnapshot, AnalyticsRange, EventGroup } from "@/lib/analytics-shared";
import {
  GROUP_NAMES, GROUP_COLORS, GROUP_BADGE_CLASSES,
  contentHref, referrerDomain, timeAgo, parseDbDate, ANALYTICS_RANGES,
} from "@/lib/analytics-shared";

const ACCENTS: Record<string, string> = {
  amber: "border-amber-500/20 text-amber-400",
  emerald: "border-emerald-500/20 text-emerald-400",
  blue: "border-blue-500/20 text-blue-400",
  violet: "border-violet-500/20 text-violet-400",
  rose: "border-rose-500/20 text-rose-400",
};

const fmt = (n: number) => n.toLocaleString("en-US");

/* ── Small pieces ────────────────────────────────────────────────────────── */

function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (cur === 0 && prev === 0) return null;
  if (prev === 0) {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
        new
      </span>
    );
  }
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) {
    return (
      <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-800/50 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">
        flat
      </span>
    );
  }
  const up = pct > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
        up
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-rose-500/20 bg-rose-500/10 text-rose-400"
      }`}
    >
      {up ? <ArrowUpRight className="h-3 w-3" aria-hidden /> : <ArrowDownRight className="h-3 w-3" aria-hidden />}
      {Math.abs(pct)}%
    </span>
  );
}

function StatCard({
  label, value, sub, accent = "amber", delta,
}: {
  label: string; value: string | number; sub?: string; accent?: string;
  delta?: { cur: number; prev: number };
}) {
  return (
    <div className={`rounded-xl border ${ACCENTS[accent] || ACCENTS.amber} bg-zinc-900/50 p-5`}>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-3xl font-semibold tabular-nums text-zinc-100">{value}</p>
        {delta && <Delta cur={delta.cur} prev={delta.prev} />}
      </div>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

function Panel({
  title, action, children, className = "",
}: {
  title: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-dashed border-zinc-800 px-4 py-5">
      <Inbox className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600" aria-hidden />
      <p className="text-sm text-zinc-600">{children}</p>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsSnapshot | null>(null);
  const [err, setErr] = useState("");
  const [range, setRange] = useState<AnalyticsRange>(30);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "done" | "error">("idle");
  const [hiddenGroups, setHiddenGroups] = useState<ReadonlySet<EventGroup>>(new Set());
  const [now, setNow] = useState(() => new Date());

  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!silent) {
      setRefreshing(true);
      setErr("");
    }
    try {
      const r = await fetch(`/api/admin/analytics?range=${range}`);
      if (!r.ok) throw new Error(`Request failed (${r.status})`);
      setData(await r.json());
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [range]);

  useEffect(() => { void fetchAnalytics(); }, [fetchAnalytics]);

  // Live mode: silent refetch every 60s while the tab is visible.
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      if (typeof document === "undefined" || document.visibilityState === "hidden") return;
      void fetchAnalytics(true);
    }, 60_000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchAnalytics]);

  // Keep relative timestamps honest.
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  function toggleGroup(g: EventGroup) {
    setHiddenGroups((prev) => {
      if (prev.has(g)) {
        const next = new Set(prev);
        next.delete(g);
        return next;
      }
      if (prev.size === GROUP_NAMES.length - 1) return prev; // keep one visible
      return new Set(prev).add(g);
    });
  }

  async function copyEmails() {
    try {
      const r = await fetch("/api/admin/analytics?format=csv");
      if (!r.ok) throw new Error("export unavailable");
      const emails = (await r.text())
        .split(/\r?\n/)
        .slice(1)
        .map((line) => line.split(",")[1])
        .filter(Boolean);
      if (emails.length === 0) return;
      await navigator.clipboard.writeText(emails.join(", "));
      setCopyState("done");
    } catch {
      setCopyState("error");
    } finally {
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  /* ── Render states ── */

  if (err && !data) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-red-400">{err}</p>
        <button
          onClick={() => void fetchAnalytics()}
          className="mt-4 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="py-20 text-center">
        <p className="animate-pulse text-sm text-zinc-500">Consulting the event store…</p>
      </div>
    );
  }

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
            In production, verify{" "}
            <code className="rounded bg-zinc-800 px-1 text-xs">TURSO_DATABASE_URL</code> is set.
          </p>
          <button
            onClick={() => void fetchAnalytics()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
            Retry connection
          </button>
        </div>
      </div>
    );
  }

  /* ── Derived (post-guard: data.available === true) ── */

  const chartData = data.daily.map((d) => ({ ...d, day: d.day.slice(5) }));
  const groupTotals = GROUP_NAMES.map((g) => ({
    group: g,
    total: data.daily.reduce((sum, d) => sum + d[g], 0),
  }));
  const maxWindow = Math.max(...data.events.map((e) => e.countWindow), 1);
  const funnelSteps = [
    { key: "pricingViewed", label: "Pricing viewed" },
    { key: "dossierStarted", label: "Assessment started" },
    { key: "dossierCompleted", label: "Assessment completed" },
    { key: "consultationStarted", label: "Consultation intent" },
    { key: "wizardSubmitted", label: "Intake submitted (lead)" },
    { key: "whatsappHandoff", label: "WhatsApp handoff" },
    { key: "upiPay", label: "Pay — Google Pay / UPI" },
    { key: "paymentConfirm", label: "Payment confirmed" },
    { key: "paid", label: "Reconciled PAID ✓" },
  ] as const;
  const funnelMax = Math.max(...funnelSteps.map((s) => data.funnel[s.key]), 1);
  const completionRate = data.funnel.dossierStarted > 0
    ? Math.round((data.funnel.dossierCompleted / data.funnel.dossierStarted) * 100)
    : 0;
  const busiest = data.daily.reduce(
    (best, d) => (d.count > best.count ? d : best),
    { day: "", count: 0 } as AnalyticsSnapshot["daily"][number],
  );
  const perDay = (data.totals.eventsWindow / data.range).toFixed(1);
  const visibleGroups = GROUP_NAMES.filter((g) => !hiddenGroups.has(g));
  const updated = parseDbDate(data.generatedAt);

  return (
    <div className="space-y-8">
      {/* Header + controls */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">First-Party Analytics</h1>
          <p className="mt-1 text-sm text-zinc-500">
            The 15-event dictionary (TGA §12) across every public surface
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Analytics window"
            className="flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5"
          >
            {ANALYTICS_RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                aria-pressed={range === r}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 ${
                  range === r ? "bg-amber-500/15 text-amber-400" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {r}d
              </button>
            ))}
          </div>
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            aria-pressed={autoRefresh}
            aria-label={autoRefresh ? "Pause live refresh" : "Resume live refresh"}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 ${
              autoRefresh
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-800 bg-zinc-900/60 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {autoRefresh ? <Pause className="h-3.5 w-3.5" aria-hidden /> : <Play className="h-3.5 w-3.5" aria-hidden />}
            <span className="hidden sm:inline">{autoRefresh ? "Live" : "Paused"}</span>
          </button>
          <button
            onClick={() => void fetchAnalytics()}
            disabled={refreshing}
            aria-label="Refresh analytics now"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <p className="text-xs text-zinc-600" title={updated.toISOString()}>
            Updated {timeAgo(data.generatedAt, now)} · UTC
          </p>
        </div>
      </div>

      {/* Headline stats */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Headline statistics">
        <StatCard
          label={`Events · ${data.range}d`}
          value={fmt(data.totals.eventsWindow)}
          sub={`${fmt(data.totals.events)} all-time`}
          accent="amber"
          delta={{ cur: data.totals.eventsWindow, prev: data.totals.eventsPrevWindow }}
        />
        <StatCard
          label="Events / day"
          value={perDay}
          sub={`average across ${data.range}d window`}
          accent="blue"
        />
        <StatCard
          label={`Sessions · ${data.range}d`}
          value={fmt(data.totals.sessionsWindow)}
          sub="unique seekers (sessionId)"
          accent="violet"
          delta={{ cur: data.totals.sessionsWindow, prev: data.totals.sessionsPrevWindow }}
        />
        <StatCard
          label="Subscribers"
          value={fmt(data.totals.subscribers)}
          sub={`+${fmt(data.totals.subscribersWindow)} in the last ${data.range}d`}
          accent="emerald"
        />
        <StatCard
          label="Busiest day"
          value={busiest.count > 0 ? busiest.day.slice(5) : "—"}
          sub={busiest.count > 0 ? `${fmt(busiest.count)} events` : "no events in window"}
          accent="rose"
        />
      </section>

      {/* Daily activity — stacked by lattice group */}
      <Panel
        title={`Daily Activity (${data.range} days)`}
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            {groupTotals.map(({ group, total }) => (
              <button
                key={group}
                onClick={() => toggleGroup(group)}
                aria-pressed={!hiddenGroups.has(group)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500 ${
                  hiddenGroups.has(group)
                    ? "border-zinc-800 bg-transparent text-zinc-600"
                    : `${GROUP_BADGE_CLASSES[group]}`
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: hiddenGroups.has(group) ? "#52525b" : GROUP_COLORS[group] }}
                  aria-hidden
                />
                {group} · {fmt(total)}
              </button>
            ))}
          </div>
        }
      >
        {data.totals.eventsWindow === 0 ? (
          <EmptyNote>
            No events in this window yet. The corpus surface was indexed recently — traffic is
            arriving. Share a folio or the karma map and this chart wakes up.
          </EmptyNote>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#27272a" strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  interval={data.range === 7 ? 0 : data.range === 30 ? 4 : 14}
                />
                <YAxis tick={{ fill: "#71717a", fontSize: 10 }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(245, 158, 11, 0.08)" }}
                  contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#a1a1aa" }}
                />
                {visibleGroups.map((g) => (
                  <Bar key={g} dataKey={g} stackId="lattice" name={g} fill={GROUP_COLORS[g]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Event dictionary table */}
        <Panel title="Event Dictionary — 15 signals">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-600">
                  <th scope="col" className="pb-2 pr-4 font-medium">Signal</th>
                  <th scope="col" className="pb-2 pr-4 text-right font-medium">{data.range}d</th>
                  <th scope="col" className="pb-2 pr-4 text-right font-medium">7d</th>
                  <th scope="col" className="pb-2 pr-4 text-right font-medium">30d</th>
                  <th scope="col" className="pb-2 text-right font-medium">All</th>
                </tr>
              </thead>
              <tbody>
                {data.events.map((e) => {
                  const group = e.group as EventGroup;
                  return (
                    <tr key={e.event} className="border-b border-zinc-800/50 last:border-0">
                      <td className="py-2 pr-4">
                        <span className={`inline-block rounded border px-1.5 py-0.5 text-[10px] font-medium ${GROUP_BADGE_CLASSES[group] || GROUP_BADGE_CLASSES.Discovery}`}>
                          {e.group}
                        </span>
                        <span className="ml-2 text-zinc-300">{e.label}</span>
                        <span
                          className="mt-1 block h-0.5 rounded-full bg-amber-500/40"
                          style={{ width: `${Math.max(2, Math.round((e.countWindow / maxWindow) * 100))}%` }}
                          aria-hidden
                        />
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums text-zinc-100">{fmt(e.countWindow)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums text-zinc-400">{fmt(e.count7d)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums text-zinc-200">{fmt(e.count30d)}</td>
                      <td className="py-2 text-right tabular-nums text-zinc-500">{fmt(e.countAll)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-6">
          {/* Conversion funnel */}
          <Panel title={`Conversion Funnel (${data.range} days)`}>
            {data.funnel.pricingViewed === 0 && data.funnel.dossierStarted === 0 ? (
              <EmptyNote>
                No conversion signals yet. Pricing → assessment → consultation intents will layer
                in as seekers arrive.
              </EmptyNote>
            ) : (
              <ol className="space-y-4">
                {funnelSteps.map((s, i) => {
                  const count = data.funnel[s.key];
                  const prevCount = i > 0 ? data.funnel[funnelSteps[i - 1].key] : null;
                  const stepPct = prevCount && prevCount > 0 ? Math.round((count / prevCount) * 100) : null;
                  return (
                    <li key={s.key}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs text-zinc-400">{s.label}</span>
                        <span className="flex items-baseline gap-2">
                          {stepPct !== null && (
                            <span className={`text-[10px] tabular-nums ${stepPct >= 50 ? "text-emerald-400" : "text-zinc-500"}`}>
                              {stepPct}% of prev
                            </span>
                          )}
                          <span className="text-sm font-semibold tabular-nums text-zinc-200">{fmt(count)}</span>
                        </span>
                      </div>
                      <div className="mt-1.5 h-2 w-full rounded-full bg-zinc-800">
                        <div
                          className="h-full rounded-full bg-amber-500/70 transition-[width] duration-500"
                          style={{ width: `${Math.max(count > 0 ? 2 : 0, Math.round((count / funnelMax) * 100))}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
            {data.funnel.dossierStarted > 0 && (
              <p className="mt-4 text-xs text-zinc-500">
                Assessment completion rate:{" "}
                <span className="font-semibold text-zinc-300">{completionRate}%</span> — the hybrid
                station gate (TGA §8) will eventually read this same signal.
              </p>
            )}
          </Panel>

          {/* Top content */}
          <Panel title={`Top Content (${data.range} days)`}>
            {data.topContent.length === 0 ? (
              <EmptyNote>No content views recorded in this window yet.</EmptyNote>
            ) : (
              <ul className="space-y-2">
                {data.topContent.map((t, i) => {
                  const href = contentHref(t.event, t.slug);
                  const label = (
                    <>
                      <span className="flex-1 truncate font-mono text-xs text-zinc-300">{t.slug}</span>
                      <span className="text-[10px] uppercase tracking-wide text-zinc-600">
                        {t.event.replace(/_(viewed|page_viewed)$/, "").replace(/_/g, " ")}
                      </span>
                    </>
                  );
                  return (
                    <li key={`${t.event}-${t.slug}`} className="flex items-center gap-3 text-sm">
                      <span className="w-5 text-right text-xs tabular-nums text-zinc-600">{i + 1}</span>
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-1 items-center gap-2 rounded px-1 py-0.5 transition-colors hover:bg-zinc-800/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
                        >
                          {label}
                          <ExternalLink className="h-3 w-3 shrink-0 text-zinc-600" aria-hidden />
                        </a>
                      ) : (
                        <span className="flex flex-1 items-center gap-2">{label}</span>
                      )}
                      <span className="tabular-nums text-zinc-400">{fmt(t.views)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {/* Top referrers */}
          <Panel title={`Top Referrers (${data.range} days)`}>
            {data.topReferrers.length === 0 ? (
              <EmptyNote>No referred visits yet — everything so far arrived directly.</EmptyNote>
            ) : (
              <ul className="space-y-2">
                {data.topReferrers.map((r) => {
                  const maxVisits = Math.max(...data.topReferrers.map((x) => x.visits), 1);
                  return (
                    <li key={r.domain} className="flex items-center gap-3 text-sm">
                      <span className={`flex-1 truncate font-mono text-xs ${r.domain === "(direct)" ? "text-zinc-500" : "text-zinc-300"}`}>
                        {r.domain}
                      </span>
                      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-800" aria-hidden>
                        <span
                          className="block h-full rounded-full bg-blue-500/60"
                          style={{ width: `${Math.max(2, Math.round((r.visits / maxVisits) * 100))}%` }}
                        />
                      </span>
                      <span className="w-12 text-right tabular-nums text-zinc-400" title={`${fmt(r.sessions)} sessions`}>
                        {fmt(r.visits)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      {/* Recent activity feed */}
      <Panel title="Recent Activity" action={<span className="text-xs text-zinc-600">latest 15 · newest first</span>}>
        {data.recentEvents.length === 0 ? (
          <EmptyNote>The event store is empty. The next visitor to any tracked surface lands here.</EmptyNote>
        ) : (
          <ul className="max-h-96 space-y-1 overflow-y-auto pr-1 [scrollbar-color:#3f3f46_transparent] [scrollbar-width:thin]">
            {data.recentEvents.map((e, i) => {
              const group = e.group as EventGroup;
              const domain = referrerDomain(e.referrer);
              return (
                <li
                  key={`${e.createdAt}-${e.event}-${i}`}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-zinc-800/30"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: GROUP_COLORS[group] || GROUP_COLORS.Discovery }} aria-hidden />
                  <span className="text-zinc-300">{e.label}</span>
                  {e.path && (
                    <a
                      href={e.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-mono text-xs text-zinc-500 transition-colors hover:text-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
                    >
                      {e.path}
                    </a>
                  )}
                  {domain !== "(direct)" && (
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/5 px-1.5 py-0.5 text-[10px] font-medium text-blue-400">
                      ← {domain}
                    </span>
                  )}
                  {e.sessionId && (
                    <span className="hidden font-mono text-[10px] text-zinc-600 sm:inline" title={e.sessionId}>
                      {e.sessionId.slice(0, 8)}
                    </span>
                  )}
                  <span className="ml-auto shrink-0 text-xs tabular-nums text-zinc-600" title={e.createdAt}>
                    {timeAgo(e.createdAt, now)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      {/* Subscribers */}
      <Panel
        title={`Newsletter Subscribers — ${fmt(data.totals.subscribers)} total`}
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => void copyEmails()}
              disabled={data.totals.subscribers === 0}
              aria-label="Copy all subscriber email addresses"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              {copyState === "done" ? <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
              {copyState === "done" ? "Copied" : copyState === "error" ? "Copy failed" : "Copy all"}
            </button>
            <a
              href="/api/admin/analytics?format=csv"
              download
              aria-label="Download all subscribers as CSV"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
            >
              <Download className="h-3.5 w-3.5" aria-hidden />
              CSV
            </a>
          </div>
        }
      >
        {data.recentSubscribers.length === 0 ? (
          <EmptyNote>
            No subscribers yet. The signup lives in the footer (NewsletterSignup) with rate-limited
            ingestion — once seekers subscribe, export them here for your mailing tool.
          </EmptyNote>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-600">
                  <th scope="col" className="pb-2 pr-4 font-medium">Email</th>
                  <th scope="col" className="pb-2 pr-4 font-medium">Source</th>
                  <th scope="col" className="pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.recentSubscribers.map((s) => (
                  <tr key={s.email} className="border-b border-zinc-800/50 last:border-0">
                    <td className="py-2 pr-4 text-zinc-200">{s.email}</td>
                    <td className="py-2 pr-4 text-zinc-500">{s.source || "footer"}</td>
                    <td className="py-2 text-zinc-500">
                      <span title={s.createdAt}>{timeAgo(s.createdAt, now)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.totals.subscribers > data.recentSubscribers.length && (
              <p className="mt-3 text-xs text-zinc-600">
                Showing the {data.recentSubscribers.length} most recent of{" "}
                {fmt(data.totals.subscribers)} — use CSV for the full list.
              </p>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  RefreshCw, Download, Copy, Check, Crosshair, Globe, Flame,
  DoorOpen, Link2, Radio, TrendingUp, Users, CalendarCheck,
} from "lucide-react";
import { pctOf } from "@/lib/admin/funnel";
import { judgeLatencyBudget } from "@/lib/ai/latency-budget";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface WarRoomData {
  generatedAt: string;
  range: string;
  campaign: string;
  kpis: {
    total: number; prevTotal: number; deltaPct: number | null; last7: number;
    booked: number; bookingRate: number; contactRate: number; completed: number;
    avgSessions: number;
  };
  series: { day: string; leads: number }[];
  statusCounts: Record<string, number>;
  geo: { country: string; n: number }[];
  geoTiers: { in: number; tier1: number; gcc: number; other: number; tier1Pct: number; gate: boolean | null };
  campaigns: { campaign: string; leads: number; booked: number; lastAt: string }[];
  sources: { pair: string; n: number }[];
  kinds: { paid: number; organic: number; referral: number; direct: number };
  doors: { content: string; n: number }[];
  landing: { path: string; n: number }[];
  recent: { id: string; name: string; status: string; createdAt: string; utmSource: string | null; utmCampaign: string | null; country: string | null }[];
  campaignList: string[];
  emailCourse: {
    total: number; active: number; last7: number;
    topSources: { key: string; count: number }[];
    topCampaigns: { key: string; count: number }[];
  } | null;
  listFunnel: {
    available: boolean;
    cohorts: {
      weekStart: string; weekLabel: string;
      subscribed: number; d3Opened: number; clicked: number; consulted: number; lead: number;
    }[];
  } | null;
  aiRoutes: {
    available: boolean;
    routes: {
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
      refs?: Record<string, number>;
    }[];
  } | null;
  aiChain: {
    checkedAt: string;
    models: {
      model: string;
      ok: boolean;
      reason: string;
      latencyMs: number;
      status?: number;
      detail?: string;
    }[];
    summary: { total: number; alive: number; dead: number; chainOk: boolean };
  } | null;
  credAudit: {
    checkedAt: string;
    credentials: {
      provider: string;
      ok: boolean;
      latencyMs: number;
      reason: string;
      status?: number;
      detail?: string;
    }[];
    summary: { total: number; ok: number; fail: number };
  } | null;
  cronRuns: {
    name: string;
    schedule: string;
    description: string;
    lastRunAt: string | null;
    lastOutcome: string | null;
    lastError: string | null;
    ageHours: number | null;
    alarm: boolean;
  }[];
  bakePending: {
    available: true;
    publishedEntries: number;
    corpusSlugs: number;
    pending: { slug: string; type: string }[];
    pendingCount: number;
  } | { available: false; reason: string } | null;
}

const RANGES = [
  { key: "7", label: "7d" },
  { key: "30", label: "30d" },
  { key: "90", label: "90d" },
  { key: "all", label: "All" },
];

const STATUS_COLOR: Record<string, string> = {
  NEW: "bg-blue-400", ACKNOWLEDGED: "bg-amber-400", SCHEDULED: "bg-violet-400",
  COMPLETED: "bg-emerald-400", CANCELLED: "bg-zinc-500",
};

/* ─── Small pieces ───────────────────────────────────────────────────────── */

function FunnelCell({ n, whole }: { n: number; whole: number }) {
  const pct = pctOf(n, whole);
  return (
    <td className="py-2 text-right text-zinc-300">
      {n}
      {pct !== null && <span className="ml-1 text-[0.65rem] text-zinc-600">{pct}%</span>}
    </td>
  );
}

function Card({ title, icon, action, children, className = "" }: {
  title: string; icon?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={`rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 ${className}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-medium uppercase tracking-wider text-zinc-500">
          {icon}{title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Kpi({ label, value, sub, delta }: {
  label: string; value: string | number; sub?: string; delta?: number | null;
}) {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-zinc-900/50 p-4">
      <p className="text-[0.65rem] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <div className="mt-1.5 flex items-baseline gap-2">
        <p className="text-2xl font-semibold tabular-nums text-zinc-100">{value}</p>
        {delta !== null && delta !== undefined && (
          <span className={`text-xs font-medium tabular-nums ${delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-zinc-500"}`}>
            {delta > 0 ? "+" : ""}{delta}%
          </span>
        )}
      </div>
      {sub && <p className="mt-0.5 text-[0.65rem] text-zinc-600">{sub}</p>}
    </div>
  );
}

function BarList({ rows, empty }: { rows: { label: string; n: number; hint?: string }[]; empty: string }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  if (rows.length === 0) return <p className="py-3 text-xs text-zinc-600">{empty}</p>;
  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3">
          <span className="w-32 shrink-0 truncate text-xs text-zinc-400" title={r.label}>{r.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-800/60">
            <div className="h-full rounded-full bg-amber-500/70" style={{ width: `${(r.n / max) * 100}%` }} />
          </div>
          <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-zinc-300">{r.n}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── UTM Link Builder (baked to the wave-2 doc conventions) ─────────────── */

const PLATFORMS = [
  { key: "yt-comment", label: "YT pinned comment", source: "youtube", medium: "comment" },
  { key: "ig-dm", label: "IG DM", source: "instagram", medium: "dm" },
  { key: "yt-desc", label: "YT description", source: "youtube", medium: "description" },
  { key: "ig-bio", label: "IG bio link", source: "instagram", medium: "bio" },
  { key: "wa", label: "WhatsApp broadcast", source: "whatsapp", medium: "broadcast" },
];
const GEOS = ["", "us", "uk", "ca", "au", "gcc", "intl"];

function LinkBuilder() {
  const [base, setBase] = useState("/consultations");
  const [platform, setPlatform] = useState(PLATFORMS[0].key);
  const [campaign, setCampaign] = useState("navratri-oct26");
  const [door, setDoor] = useState("");
  const [geo, setGeo] = useState("");
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    const p = PLATFORMS.find((x) => x.key === platform) ?? PLATFORMS[0];
    const params = new URLSearchParams();
    params.set("utm_source", p.source);
    params.set("utm_medium", p.medium);
    if (campaign.trim()) params.set("utm_campaign", campaign.trim());
    const content = [door && `door-${door}`, geo].filter(Boolean).join("-");
    if (content) params.set("utm_content", content);
    return `https://www.astrokalki.com${base}?${params.toString()}`;
  }, [base, platform, campaign, door, geo]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* clipboard unavailable */ }
  }

  const inputCls = "rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-xs text-zinc-200 focus:border-amber-500/40 focus:outline-none";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <select value={base} onChange={(e) => setBase(e.target.value)} className={inputCls} aria-label="Destination page">
          <option value="/consultations">/consultations</option>
          <option value="/archetypes">/archetypes</option>
        </select>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls} aria-label="Placement">
          {PLATFORMS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
        </select>
        <input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="campaign" className={`${inputCls} w-40`} aria-label="Campaign" />
        <select value={door} onChange={(e) => setDoor(e.target.value)} className={inputCls} aria-label="Door tag">
          <option value="">no door tag</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((d) => (
            <option key={d} value={String(d)}>door-{d}</option>
          ))}
        </select>
        <select value={geo} onChange={(e) => setGeo(e.target.value)} className={inputCls} aria-label="Geo tag">
          {GEOS.map((g) => <option key={g || "none"} value={g}>{g ? `geo: ${g}` : "no geo tag"}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-2">
        <code className="min-w-0 flex-1 truncate rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-[0.7rem] text-amber-200/80" title={url}>
          {url}
        </code>
        <button
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-500/20"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="text-[0.65rem] leading-relaxed text-zinc-600">
        Conventions per the wave-2 run sheet: YT comments <code>utm_medium=comment</code>, IG DMs <code>utm_medium=dm</code>,
        geo tags <code>utm_content=us|uk|ca|au|gcc|intl</code>. Door tags (<code>utm_content=door-N</code>) give per-night
        rollups in the Door board above — optional, additive to the doc.
      </p>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function WarRoomPage() {
  const [data, setData] = useState<WarRoomData | null>(null);
  const [err, setErr] = useState("");
  const [range, setRange] = useState("30");
  const [campaign, setCampaign] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [auto, setAuto] = useState(true);
  const [exported, setExported] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const r = await fetch(`/api/admin/warroom?range=${range}&campaign=${encodeURIComponent(campaign)}`);
      if (!r.ok) throw new Error(await r.text());
      setData(await r.json());
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message.slice(0, 300) : "Failed to load the war room.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range, campaign]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => load(true), 60_000);
    return () => clearInterval(t);
  }, [auto, load]);

  const k = data?.kpis;

  const geoRows = useMemo(() => {
    if (!data) return [];
    const t = data.geoTiers;
    const total = Math.max(1, data.kpis.total);
    return [
      { label: "🇮🇳 India", n: t.in },
      { label: "Tier-1 (US·UK·CA·AU)", n: t.tier1 },
      { label: "GCC", n: t.gcc },
      { label: "Rest of world", n: t.other },
    ].map((r) => ({ ...r, pct: Math.round((r.n / total) * 100) }));
  }, [data]);

  function exportCsv() {
    if (!data) return;
    const lines: string[] = [];
    lines.push(`KALKI War Room rollup,${data.generatedAt}`);
    lines.push(`window,${data.range} days,campaign,${data.campaign}`);
    lines.push("");
    lines.push("section,key,leads");
    lines.push(`kpis,total,${data.kpis.total}`);
    lines.push(`kpis,booked,${data.kpis.booked}`);
    lines.push(`kpis,bookingRate,${data.kpis.bookingRate}%`);
    lines.push("");
    lines.push("campaigns,campaign,leads,booked,lastAt");
    for (const c of data.campaigns) lines.push(`campaigns,${c.campaign},${c.leads},${c.booked},${c.lastAt}`);
    lines.push("");
    lines.push("doors,utm_content,leads");
    for (const d of data.doors) lines.push(`doors,${d.content},${d.n}`);
    lines.push("");
    lines.push("geo,country,leads");
    for (const g of data.geo) lines.push(`geo,${g.country},${g.n}`);
    lines.push("");
    lines.push("sources,source/medium,leads");
    for (const s of data.sources) lines.push(`sources,"${s.pair}",${s.n}`);
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `warroom-${data.campaign}-${data.range}d-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    setExported(true);
    setTimeout(() => setExported(false), 1600);
  }

  if (loading) {
    return <div className="flex items-center justify-center py-24 text-sm text-zinc-500">
      <Radio className="mr-2 h-4 w-4 animate-pulse text-amber-500" /> Warming up the war room…
    </div>;
  }

  const isEmpty = data && data.kpis.total === 0 && data.campaign === "all" && data.campaignList.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-zinc-100">
            <Crosshair className="h-6 w-6 text-amber-500" /> War Room
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Campaign intelligence · attribution rollups · the Tier-1 gate that decides Halloween
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-amber-500/40 focus:outline-none"
            aria-label="Campaign filter"
          >
            <option value="all">All campaigns</option>
            {(data?.campaignList ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex overflow-hidden rounded-lg border border-zinc-800">
            {RANGES.map((r) => (
              <button
                key={r.key}
                onClick={() => setRange(r.key)}
                className={`px-3 py-2 text-xs font-medium transition ${range === r.key ? "bg-amber-500/15 text-amber-300" : "text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300"}`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAuto((a) => !a)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${auto ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
            title="Auto-refresh every 60s"
          >
            <Radio className={`h-3.5 w-3.5 ${auto ? "animate-pulse" : ""}`} /> Live
          </button>
          <button onClick={() => load()} disabled={refreshing} className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-amber-500/30 hover:text-amber-300 disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-amber-500/30 hover:text-amber-300">
            {exported ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Download className="h-3.5 w-3.5" />} CSV
          </button>
        </div>
      </div>

      {err && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{err}</p>}

      {/* Empty state — no leads yet, campaign links ready to copy */}
      {isEmpty ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-dashed border-amber-500/25 bg-amber-500/[0.03] p-10 text-center">
            <Flame className="mx-auto h-8 w-8 text-amber-500/60" />
            <h2 className="mt-3 text-lg font-semibold text-zinc-200">The war room wakes with the first seeker.</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
              No attributed leads yet. The moment a consultation form lands with UTM tags, velocity,
              geo split and door rollups light up here. Until then — arm the funnel below.
            </p>
          </div>
          <Card title="Campaign URL Armory — copy, paste, launch" icon={<Link2 className="h-4 w-4 text-amber-500" />}>
            <LinkBuilder />
          </Card>
        </div>
      ) : (
        <>
          {/* KPI strip */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Kpi label="Leads (window)" value={k?.total ?? 0} delta={k?.deltaPct} sub={`prev ${k?.prevTotal ?? 0}`} />
            <Kpi label="Last 7 days" value={k?.last7 ?? 0} sub="rolling week" />
            <Kpi label="Booking rate" value={`${k?.bookingRate ?? 0}%`} sub={`${k?.booked ?? 0} scheduled/completed`} />
            <Kpi label="Contact rate" value={`${k?.contactRate ?? 0}%`} sub="moved past NEW" />
            <Kpi label="Avg sessions" value={k?.avgSessions ?? 0} sub="before submitting" />
            <Kpi label="Tier-1 share" value={`${data?.geoTiers.tier1Pct ?? 0}%`} sub="US·UK·CA·AU — gate ≥15%" />
          </div>

          {/* Velocity + Geo */}
          <div className="grid gap-4 xl:grid-cols-3">
            <Card title="Lead velocity" icon={<TrendingUp className="h-4 w-4 text-amber-500" />} className="xl:col-span-2">
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data?.series ?? []} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
                    <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "#71717a", fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)} tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                    <YAxis allowDecimals={false} tick={{ fill: "#71717a", fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "#a1a1aa" }}
                      cursor={{ fill: "rgba(245,158,11,0.06)" }}
                    />
                    <Bar dataKey="leads" fill="#f59e0b" radius={[3, 3, 0, 0]} maxBarSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Geo split — the Halloween gate" icon={<Globe className="h-4 w-4 text-amber-500" />}>
              <div className="space-y-3">
                {geoRows.map((r) => (
                  <div key={r.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">{r.label}</span>
                      <span className="tabular-nums text-zinc-300">{r.n} · {r.pct}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800/60">
                      <div className={`h-full rounded-full ${r.label.startsWith("🇮🇳") ? "bg-orange-500/70" : r.label.startsWith("Tier-1") ? "bg-emerald-500/70" : "bg-sky-500/60"}`} style={{ width: `${r.pct}%` }} />
                    </div>
                  </div>
                ))}
                <div className={`mt-3 rounded-lg border px-3 py-2.5 text-xs leading-relaxed ${(data?.geoTiers.gate ?? null) === true
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : (data?.geoTiers.gate ?? null) === false
                    ? "border-zinc-800 bg-zinc-900/40 text-zinc-400"
                    : "border-zinc-800 bg-zinc-900/40 text-zinc-500"}`}>
                  {(data?.geoTiers.gate ?? null) === true
                    ? "Tier-1 ≥15% at ≥20 leads — the two-geo build gate is OPEN. Re-run the playbook decision on Nov 5."
                    : (data?.geoTiers.gate ?? null) === false
                      ? `Tier-1 at ${data?.geoTiers.tier1Pct}% — below the 15% gate. India-first holds.`
                      : `Gate reads at ≥20 leads (now ${data?.kpis.total ?? 0}). Rule: Tier-1 ≥15% → two-geo; <5% → stay India-first.`}
                </div>
              </div>
            </Card>
          </div>

          {/* Campaigns + Sources */}
          <div className="grid gap-4 xl:grid-cols-3">
            {data && data.campaigns.length > 0 && (
              <Card title="Campaigns" icon={<Flame className="h-4 w-4 text-amber-500" />} className="xl:col-span-2">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-800 text-xs text-zinc-600">
                        <th className="pb-2 pr-4 font-medium">Campaign</th>
                        <th className="pb-2 pr-4 font-medium">Leads</th>
                        <th className="pb-2 pr-4 font-medium">Booked</th>
                        <th className="pb-2 pr-4 font-medium">Book %</th>
                        <th className="pb-2 font-medium">Last lead</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {data.campaigns.map((c) => (
                        <tr key={c.campaign} className="transition hover:bg-zinc-900/30">
                          <td className="py-2.5 pr-4">
                            {c.campaign === "(none)" ? <span className="text-zinc-600">(untagged)</span> : (
                              <button onClick={() => setCampaign(c.campaign)} className="font-mono text-xs text-amber-300 hover:text-amber-200">
                                {c.campaign}
                              </button>
                            )}
                          </td>
                          <td className="py-2.5 pr-4 tabular-nums text-zinc-200">{c.leads}</td>
                          <td className="py-2.5 pr-4 tabular-nums text-zinc-400">{c.booked}</td>
                          <td className="py-2.5 pr-4 tabular-nums text-zinc-400">{c.leads > 0 ? Math.round((c.booked / c.leads) * 100) : 0}%</td>
                          <td className="py-2.5 text-xs text-zinc-500">{new Date(c.lastAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
            <Card title="Source mix" icon={<Users className="h-4 w-4 text-amber-500" />} className={data && data.campaigns.length > 0 ? "" : "xl:col-span-2"}>
              <div className="mb-3 flex flex-wrap gap-2">
                {([["organic", "Organic"], ["referral", "Referral"], ["paid", "Paid"], ["direct", "Direct"]] as const).map(([key, label]) => (
                  <span key={key} className={`rounded-full border px-2.5 py-1 text-xs tabular-nums ${
                    key === "organic" ? "border-amber-500/40 text-amber-300"
                      : key === "paid" ? "border-emerald-500/40 text-emerald-300"
                      : key === "referral" ? "border-sky-500/40 text-sky-300"
                      : "border-zinc-700 text-zinc-400"}`}>
                    {label} {data?.kinds[key] ?? 0}
                  </span>
                ))}
              </div>
              <BarList rows={(data?.sources ?? []).map((s) => ({ label: s.pair, n: s.n }))} empty="No attributed sources yet." />
            </Card>
          </div>

          {/* Doors + Landing */}
          <div className="grid gap-4 xl:grid-cols-2">
            <Card title="Door board — utm_content rollup" icon={<DoorOpen className="h-4 w-4 text-amber-500" />}>
              <BarList rows={(data?.doors ?? []).map((d) => ({ label: d.content, n: d.n }))} empty="No door tags yet — tag pinned comments with utm_content=door-N to light this up." />
            </Card>
            <Card title="Top landing paths" icon={<Link2 className="h-4 w-4 text-amber-500" />}>
              <BarList rows={(data?.landing ?? []).map((l) => ({ label: l.path, n: l.n }))} empty="No landing paths recorded." />
            </Card>
          </div>

          {/* Recent leads */}
          <Card
            title="Recent leads"
            icon={<CalendarCheck className="h-4 w-4 text-amber-500" />}
            action={<Link href="/admin/consultations" className="text-xs text-amber-400 hover:text-amber-300">Open pipeline →</Link>}
          >
            {(data?.recent ?? []).length === 0 ? (
              <p className="py-2 text-xs text-zinc-600">No leads in this window.</p>
            ) : (
              <ul className="divide-y divide-zinc-800/50">
                {(data?.recent ?? []).map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-2 py-2.5 text-sm">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_COLOR[r.status] ?? "bg-zinc-500"}`} />
                    <span className="font-medium text-zinc-200">{r.name}</span>
                    <span className="text-xs text-zinc-600">{new Date(r.createdAt).toLocaleString()}</span>
                    <span className="ml-auto flex items-center gap-1.5 text-[0.65rem]">
                      {r.country && <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-zinc-400">{r.country}</span>}
                      {r.utmCampaign && <span className="rounded border border-amber-500/30 px-1.5 py-0.5 font-mono text-amber-300/80">{r.utmCampaign}</span>}
                      {r.utmSource && <span className="rounded border border-zinc-800 px-1.5 py-0.5 text-zinc-500">{r.utmSource}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Email course — capture layer health (all-time, not range-filtered) */}
          <Card
            title="Email course — The 10 Doors"
            icon={<Users className="h-4 w-4 text-amber-500" />}
            action={<Link href="/admin/subscribers" className="text-xs text-amber-400 hover:text-amber-300">Open list →</Link>}
          >
            {data?.emailCourse ? (
              <div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                    <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">Subscribers</p>
                    <p className="mt-1 text-xl font-semibold text-zinc-100">{data.emailCourse.total}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                    <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">Active</p>
                    <p className="mt-1 text-xl font-semibold text-emerald-400">{data.emailCourse.active}</p>
                  </div>
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
                    <p className="text-[0.65rem] uppercase tracking-wider text-zinc-500">Last 7d</p>
                    <p className="mt-1 text-xl font-semibold text-amber-400">+{data.emailCourse.last7}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {data.emailCourse.topSources.length === 0 ? (
                    <p className="text-xs text-zinc-600">No signups yet — /email-course is live and linked from consultations.</p>
                  ) : (
                    data.emailCourse.topSources.map((s) => (
                      <span key={s.key} className="rounded border border-zinc-800 px-1.5 py-0.5 text-[0.65rem] text-zinc-400">
                        {s.key} · {s.count}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <p className="py-2 text-xs text-zinc-600">Capture layer unavailable.</p>
            )}
          </Card>

          {/* List funnel — weekly cohort truth (Vol. 4 #3) */}
          <Card
            title="List funnel — what the list converts"
            icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
            action={<Link href="/admin/broadcast" className="text-xs text-amber-400 hover:text-amber-300">Compose →</Link>}
          >
            {data?.listFunnel && data.listFunnel.cohorts.some((c) => c.subscribed > 0) ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
                      <th className="pb-2 font-medium">Cohort</th>
                      <th className="pb-2 text-right font-medium">Joined</th>
                      <th className="pb-2 text-right font-medium">Door-3 open</th>
                      <th className="pb-2 text-right font-medium">Clicked</th>
                      <th className="pb-2 text-right font-medium">→ /consultations</th>
                      <th className="pb-2 text-right font-medium">Intake</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {[...data.listFunnel.cohorts].reverse().map((c, i, arr) => (
                      <tr key={c.weekStart}>
                        <td className="py-2 font-medium text-zinc-200">
                          {c.weekLabel}
                          {i === arr.length - 1 && <span className="ml-1.5 text-[0.6rem] text-zinc-600">in flight</span>}
                        </td>
                        <td className="py-2 text-right text-zinc-300">{c.subscribed}</td>
                        <FunnelCell n={c.d3Opened} whole={c.subscribed} />
                        <FunnelCell n={c.clicked} whole={c.subscribed} />
                        <FunnelCell n={c.consulted} whole={c.subscribed} />
                        <FunnelCell n={c.lead} whole={c.subscribed} />
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-[0.65rem] leading-relaxed text-zinc-600">
                  Opens/clicks are provider-webhook truth counted independently — a reader who blocks
                  pixels but taps links shows in click stages, not open stages. Intake = Consultation
                  row created after joining. Cohort = week the seeker joined the list (Mon UTC).
                </p>
              </div>
            ) : (
              <p className="py-2 text-xs text-zinc-600">No subscribers in the last six weeks — the funnel starts when the list does.</p>
            )}
          </Card>

          {/* AI layer — per-route observability (Vol. 4 #17) */}
          <Card
            title="AI layer — which route fails or drifts"
            icon={<Radio className="h-4 w-4 text-amber-500" />}
            action={<Link href="/ask" className="text-xs text-amber-400 hover:text-amber-300" target="_blank" rel="noopener noreferrer">/ask →</Link>}
          >
            {data?.aiRoutes && data.aiRoutes.routes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
                      <th className="pb-2 font-medium">Route</th>
                      <th className="pb-2 text-right font-medium">Calls</th>
                      <th className="pb-2 text-right font-medium">Ok</th>
                      <th className="pb-2 text-right font-medium">Limited</th>
                      <th className="pb-2 text-right font-medium">Errors</th>
                      <th className="pb-2 text-right font-medium">p50</th>
                      <th className="pb-2 text-right font-medium">p95</th>
                      <th className="pb-2 text-right font-medium">Budget</th>
                      <th className="pb-2 text-right font-medium">Last call</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {data.aiRoutes.routes.map((r) => {
                      const trouble = r.error > 0 || r.unconfigured > 0;
                      const drift = r.p95 > 0 && r.p95 >= 4 * Math.max(1, r.p50);
                      // Vol. 5 #5 — the latency budget, judged where the p95 lives:
                      // ask 12s, other AI routes 3s. amber = over budget (decide),
                      // rose = 2×+ over (the budget is dead).
                      return (
                        <tr key={r.event}>
                          <td className="py-2 font-medium text-zinc-200">
                            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ backgroundColor: trouble ? "#f43f5e" : drift ? "#f59e0b" : "#10b981" }} />
                            {r.event.replace(/^ai_/, "").replace(/_/g, "-")}
                            {r.refs && Object.keys(r.refs).length > 0 && (
                              // Vol. 5 #11 — the ask funnel: which surface sent the question
                              <span className="mt-0.5 block text-[0.65rem] font-normal text-zinc-500">
                                via {Object.entries(r.refs).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ")}
                              </span>
                            )}
                          </td>
                          <td className="py-2 text-right text-zinc-300">{r.calls}</td>
                          <td className="py-2 text-right text-zinc-300">{r.ok}</td>
                          <td className="py-2 text-right text-zinc-400">{r.limited}</td>
                          <td className={`py-2 text-right ${r.error > 0 ? "text-rose-400" : "text-zinc-400"}`}>{r.error}</td>
                          <td className="py-2 text-right text-zinc-400">{r.p50 ? `${r.p50}ms` : "—"}</td>
                          <td className={`py-2 text-right ${drift ? "text-amber-400" : "text-zinc-400"}`}>{r.p95 ? `${r.p95}ms` : "—"}</td>
                          <td className="py-2 text-right">
                            {r.p95 > 0 ? (() => {
                              const j = judgeLatencyBudget(r.event, r.p95);
                              return (
                                <span className={j.verdict === "breach" ? "text-rose-400" : j.verdict === "warn" ? "text-amber-400" : "text-zinc-500"}>
                                  {(r.p95 / 1000).toFixed(1)}s/{(j.budgetMs / 1000).toFixed(0)}s
                                </span>
                              );
                            })() : <span className="text-zinc-600">—</span>}
                          </td>
                          <td className="py-2 text-right text-zinc-500">{r.lastAt ? r.lastAt.slice(0, 16).replace("T", " ") : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <p className="mt-2 text-[0.65rem] leading-relaxed text-zinc-600">
                  Server-fired first-party events (Vol. 4 #17): every /api/ai/* call reports
                  latency_ms + outcome through the #18 dictionary gate. Dot: emerald = healthy,
                  amber = p95 ≥ 4× p50 (latency drift), rose = errors or unconfigured provider.
                  Budget (Vol. 5 #5): p95 against the route's latency budget — ask 12s, others 3s;
                  amber over budget, rose at 2×+. LLM-backed routes running over 3s on the free
                  chain is a cost signal to decide on, not an outage.
                  Limited = rate-limited (429) — a throttle working as designed, not a failure.
                </p>
              </div>
            ) : (
              <p className="py-2 text-xs text-zinc-600">
                {data?.aiRoutes && !data.aiRoutes.available
                  ? "Event store unavailable — AI telemetry is fail-open and never blocks routes."
                  : "No AI traffic in this window — the layer is quiet, not broken."}
              </p>
            )}
          </Card>

          {/* AI chain health — per-model probe verdict (Vol. 5 #1) */}
          <Card
            title="AI chain — which model rots"
            icon={<Radio className="h-4 w-4 text-amber-500" />}
          >
            {data?.aiChain ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
                      <th className="pb-2 font-medium">Model</th>
                      <th className="pb-2 text-right font-medium">Verdict</th>
                      <th className="pb-2 text-right font-medium">Latency</th>
                      <th className="pb-2 font-medium">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {data.aiChain.models.map((m) => (
                      <tr key={m.model}>
                        <td className="py-2 font-medium text-zinc-200">
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ backgroundColor: m.ok ? "#10b981" : "#f43f5e" }} />
                          {m.model}
                        </td>
                        <td className="py-2 text-right text-zinc-300">{m.reason}</td>
                        <td className="py-2 text-right text-zinc-400">{m.latencyMs ? `${m.latencyMs}ms` : "—"}</td>
                        <td className="py-2 text-zinc-500">{m.detail ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-[0.65rem] leading-relaxed text-zinc-600">
                  Last probe {data.aiChain.checkedAt.slice(0, 16).replace("T", " ")}Z · {data.aiChain.summary.alive}/{data.aiChain.summary.total} models answer the real-size /ask contract
                  {data.aiChain.summary.chainOk ? "" : " — CHAIN DOWN"}. Free tiers delist without notice (the
                  2026-09-08 incident): emerald = contract-honoring, rose = dead. Cron: 02:15 UTC daily.
                </p>
              </div>
            ) : (
              <p className="py-2 text-xs text-zinc-600">
                Never probed — the chain-health cron (02:15 UTC) stores its first verdict here, or run it now.
              </p>
            )}
          </Card>

          {/* Credential audit — per-provider verify verdict (Vol. 5 #2) */}
          <Card
            title="Credentials — which vault entry rots"
            icon={<Radio className="h-4 w-4 text-amber-500" />}
          >
            {data?.credAudit ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
                      <th className="pb-2 font-medium">Provider</th>
                      <th className="pb-2 text-right font-medium">Verdict</th>
                      <th className="pb-2 text-right font-medium">Latency</th>
                      <th className="pb-2 font-medium">Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {data.credAudit.credentials.map((c) => (
                      <tr key={c.provider}>
                        <td className="py-2 font-medium text-zinc-200">
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ backgroundColor: c.ok ? "#10b981" : "#f43f5e" }} />
                          {c.provider}
                        </td>
                        <td className="py-2 text-right text-zinc-300">{c.reason}</td>
                        <td className="py-2 text-right text-zinc-400">{c.latencyMs ? `${c.latencyMs}ms` : "—"}</td>
                        <td className="py-2 text-zinc-500">{c.detail ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-[0.65rem] leading-relaxed text-zinc-600">
                  Last audit {data.credAudit.checkedAt.slice(0, 16).replace("T", " ")}Z · {data.credAudit.summary.ok}/{data.credAudit.summary.total} provider credentials verify.
                  The 2026-09-08 lesson: a vault credential is a hope until pinged — server env only, daily at 02:10 UTC.
                </p>
              </div>
            ) : (
              <p className="py-2 text-xs text-zinc-600">
                Never audited — the cred-audit cron (02:10 UTC) stores its first verdict here.
              </p>
            )}
          </Card>

          {/* Cron outcome ledger — last run per registered cron (Vol. 5 #4) */}
          <Card
            title="Crons — which schedule went silent"
            icon={<Radio className="h-4 w-4 text-amber-500" />}
          >
            {data?.cronRuns && data.cronRuns.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[0.65rem] uppercase tracking-wider text-zinc-500">
                      <th className="pb-2 font-medium">Cron</th>
                      <th className="pb-2 font-medium">Schedule</th>
                      <th className="pb-2 text-right font-medium">Last run</th>
                      <th className="pb-2 text-right font-medium">Outcome</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {data.cronRuns.map((c) => (
                      <tr key={c.name}>
                        <td className="py-2 font-medium text-zinc-200">
                          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ backgroundColor: c.alarm ? "#f43f5e" : c.lastOutcome === "ok" ? "#10b981" : "#f59e0b" }} />
                          {c.name}
                        </td>
                        <td className="py-2 text-zinc-500">{c.schedule}</td>
                        <td className="py-2 text-right text-zinc-400">
                          {c.lastRunAt ? `${c.ageHours ?? "?"}h ago` : "never"}
                        </td>
                        <td className={`py-2 text-right ${c.lastOutcome === "error" ? "text-rose-400" : "text-zinc-300"}`}>
                          {c.lastOutcome ?? "—"}
                          {c.lastError ? ` · ${c.lastError.slice(0, 60)}` : ""}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-2 text-[0.65rem] leading-relaxed text-zinc-600">
                  One CronRun row per run (Vol. 5 #4) — duration, items, outcome. Rose = silent
                  &gt; 26h (a daily cron with 26h of silence is dead) or errored on the latest run;
                  amber = ran but not clean. The digest carries the same alarm.
                </p>
              </div>
            ) : (
              <p className="py-2 text-xs text-zinc-600">
                No runs recorded yet — the ledger fills as each cron fires.
              </p>
            )}
          </Card>

          {/* Bake pending — studio vs baked corpus (Vol. 5 #7) */}
          <Card
            title="Bake pending — studio vs corpus"
            icon={<Flame className="h-4 w-4 text-orange-500" />}
          >
            {data?.bakePending?.available ? (
              <div>
                <div className="flex items-baseline gap-6 mb-3">
                  <p className="text-sm text-zinc-400">
                    Published entries:{" "}
                    <span className="font-medium text-zinc-200">{data.bakePending.publishedEntries}</span>
                  </p>
                  <p className="text-sm text-zinc-400">
                    Baked corpus slugs:{" "}
                    <span className="font-medium text-zinc-200">{data.bakePending.corpusSlugs}</span>
                  </p>
                  <p className={`text-sm ${data.bakePending.pendingCount > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                    Pending bake: {data.bakePending.pendingCount}
                  </p>
                </div>
                {data.bakePending.pendingCount > 0 && (
                  <ul className="mb-3 space-y-1">
                    {data.bakePending.pending.map((p) => (
                      <li key={p.slug} className="text-xs text-zinc-400">
                        <span className="text-amber-400">●</span> {p.slug}{" "}
                        <span className="text-zinc-600">({p.type})</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-[0.65rem] leading-relaxed text-zinc-600">
                  Published ContentEntry slugs missing from the baked FolioChunk corpus —
                  retrieval and /ask cannot see them until the bake runs. One command:
                  <code className="ml-1 text-zinc-500">bash scripts/bake-corpus.sh</code>
                </p>
              </div>
            ) : (
              <p className="py-2 text-xs text-zinc-600">
                {data?.bakePending && !data.bakePending.available
                  ? `Unknown — ${data.bakePending.reason}`
                  : "Unknown — either world (studio DB or baked corpus) was unreadable."}
              </p>
            )}
          </Card>

          {/* Link armory */}
          <Card title="Campaign URL Armory" icon={<Link2 className="h-4 w-4 text-amber-500" />}>
            <LinkBuilder />
          </Card>
        </>
      )}
    </div>
  );
}

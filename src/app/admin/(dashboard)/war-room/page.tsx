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

          {/* Link armory */}
          <Card title="Campaign URL Armory" icon={<Link2 className="h-4 w-4 text-amber-500" />}>
            <LinkBuilder />
          </Card>
        </>
      )}
    </div>
  );
}

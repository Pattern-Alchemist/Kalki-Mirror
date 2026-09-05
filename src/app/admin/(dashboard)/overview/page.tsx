"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { CampaignPulse } from "./pulse-client";
import { ConsultationFunnel } from "./funnel-client";
import { ThrottleCard } from "./throttle-card";

const TIER_CONFIG: Record<string, { label: string; color: string; element: string }> = {
  prithvi: { label: "Prithvi", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", element: "Earth" },
  jal: { label: "Jal", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", element: "Water" },
  agni: { label: "Agni", color: "bg-orange-500/10 text-orange-400 border-orange-500/20", element: "Fire" },
  akash: { label: "Akash", color: "bg-violet-500/10 text-violet-400 border-violet-500/20", element: "Sky" },
};

const QUICK_ACTIONS = [
  { label: "Golden Keys", href: "/admin/keys", icon: "\u{1F511}", desc: "Manage invite codes" },
  { label: "Content Studio", href: "/admin/content", icon: "\u{1F4D6}", desc: "Editorial pipeline" },
  { label: "Audit Log", href: "/admin/audit", icon: "\u{1F4CB}", desc: "Immutable action log" },
  { label: "Consultations", href: "/admin/consultations", icon: "\u{1F4AC}", desc: "User consultations" },
];

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  const colors: Record<string, string> = { amber: "border-amber-500/20 text-amber-400", emerald: "border-emerald-500/20 text-emerald-400", blue: "border-blue-500/20 text-blue-400", violet: "border-violet-500/20 text-violet-400", rose: "border-rose-500/20 text-rose-400" };
  const c = colors[accent || "amber"] || colors.amber;
  return (
    <div className={`rounded-xl border ${c} bg-zinc-900/50 p-5`}>
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

// Explicit contract for /api/admin/stats. The previous
// Awaited<ReturnType<typeof fetchStats>> typing referenced the const
// before declaration, collapsing to `never` and poisoning every property
// access below (the 20 'never' type errors this fixes).
interface OverviewStats {
  members: {
    total: number;
    new: number;
    activeStreaks: number;
    tierDistribution: { tier: string; count: number }[];
  };
  patterns: { resolved: number; recognized: number };
  consultations: { pending: number };
  keys: { active: number; total: number; redeemed: number; redemptionRate: number };
  content: { drafts: number; inReview: number };
}

export default function OverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [err, setErr] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/stats");
      if (!r.ok) throw new Error(await r.text());
      setStats(await r.json());
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to load");
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (err) return <div className="text-center py-20"><p className="text-red-400">{err}</p><button onClick={fetchStats} className="mt-4 px-4 py-2 bg-amber-500 text-black rounded-lg text-sm font-medium hover:bg-amber-400">Retry</button></div>;
  if (!stats) return <div className="text-center py-20 text-zinc-500">Loading overview...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Archivist Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">Live operational metrics for Kalki Mirror</p>
      </div>

      <CampaignPulse />

      <ConsultationFunnel />

      <ThrottleCard />

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Members</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Members" value={stats.members.total} sub={`${stats.members.new} new this week`} accent="amber" />
          <StatCard label="Active Streaks" value={stats.members.activeStreaks} sub="practicing today" accent="emerald" />
          <StatCard label="Patterns Resolved" value={`${stats.patterns.resolved}/${stats.patterns.recognized}`} sub="integrated / recognized" accent="blue" />
          <StatCard label="Pending Consultations" value={stats.consultations.pending} sub="awaiting response" accent="rose" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {QUICK_ACTIONS.map(a => (
            <Link key={a.href} href={a.href} className="group rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 transition-colors hover:border-amber-500/30 hover:bg-zinc-900/60">
              <span className="text-2xl">{a.icon}</span>
              <p className="mt-3 text-sm font-medium text-zinc-200 group-hover:text-amber-400">{a.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{a.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Tier Breakdown</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(stats.members.tierDistribution || []).map(t => {
            const cfg = TIER_CONFIG[t.tier] || TIER_CONFIG.prithvi;
            const pct = stats.members.total > 0 ? Math.round((t.count / stats.members.total) * 100) : 0;
            return (
              <div key={t.tier} className={`rounded-xl border ${cfg.color} p-5`}>
                <div className="flex items-center justify-between">
                  <div><p className="text-xs font-medium uppercase tracking-wider opacity-70">{cfg.element}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{t.count}</p></div>
                  <span className="text-3xl font-bold opacity-30">{pct}%</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-black/30"><div className="h-full rounded-full bg-current opacity-60" style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Keys & Content</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Golden Keys (Active)" value={stats.keys.active} sub={`${stats.keys.total} total generated`} accent="amber" />
          <StatCard label="Redemption Rate" value={`${stats.keys.redemptionRate}%`} sub={`${stats.keys.redeemed} redeemed`} accent="violet" />
          <StatCard label="Draft Content" value={stats.content.drafts} sub="awaiting editorial review" accent="blue" />
          <StatCard label="In Review" value={stats.content.inReview} sub="pending publisher approval" accent="emerald" />
        </div>
      </section>
    </div>
  );
}

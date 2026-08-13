import { getOverviewStats } from "./actions";
import { QuickActions } from "@/components/admin/quick-actions";
import { DashboardCharts } from "./chart-client";

const TIER_CONFIG: Record<string, { label: string; color: string; element: string }> = {
  prithvi: { label: "Prithvi", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", element: "Earth" },
  jal: { label: "Jal", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", element: "Water" },
  agni: { label: "Agni", color: "bg-orange-500/10 text-orange-400 border-orange-500/20", element: "Fire" },
  akash: { label: "Akash", color: "bg-violet-500/10 text-violet-400 border-violet-500/20", element: "Sky" },
};

function StatCard({ label, value, sub, accent = "amber" }: { label: string; value: string | number; sub?: string; accent?: string }) {
  const colors: Record<string, string> = {
    amber: "border-amber-500/20 text-amber-400",
    emerald: "border-emerald-500/20 text-emerald-400",
    blue: "border-blue-500/20 text-blue-400",
    violet: "border-violet-500/20 text-violet-400",
    rose: "border-rose-500/20 text-rose-400",
  };
  const c = colors[accent] || colors.amber;

  return (
    <div className={`rounded-xl border ${c} bg-zinc-900/50 p-5`}>  
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-100">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-500">{sub}</p>}
    </div>
  );
}

export default async function OverviewPage() {
  const stats = await getOverviewStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Archivist Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Live operational metrics for Kalki Mirror
        </p>
      </div>

      {/* Member stats */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Members</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Members" value={stats.members.total} sub={`${stats.members.new} new this week`} accent="amber" />
          <StatCard label="Active Streaks" value={stats.members.activeStreaks} sub="practicing today" accent="emerald" />
          <StatCard label="Patterns Resolved" value={`${stats.patterns.resolved}/${stats.patterns.recognized}`} sub="integrated / recognized" accent="blue" />
          <StatCard label="Pending Consultations" value={stats.consultations.pending} sub="awaiting response" accent="rose" />
        </div>
      </section>

      <QuickActions />

      {/* A9: Dashboard charts */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Analytics</h2>
        <DashboardCharts
          weeklySignups={JSON.parse(JSON.stringify(stats.charts.weeklySignups))}
          tierDistribution={stats.members.tierDistribution}
          consultStatuses={stats.consultations.statusDistribution}
        />
      </section>

      {/* Tier distribution */}
      <section className="space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Tier Breakdown</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.members.tierDistribution.map((t) => {
            const cfg = TIER_CONFIG[t.tier] || TIER_CONFIG.prithvi;
            const pct = stats.members.total > 0 ? Math.round((t.count / stats.members.total) * 100) : 0;
            return (
              <div key={t.tier} className={`rounded-xl border ${cfg.color} p-5`}>  
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider opacity-70">{cfg.element}</p>
                    <p className="mt-1 text-2xl font-semibold tabular-nums">{t.count}</p>
                  </div>
                  <span className="text-3xl font-bold opacity-30">{pct}%</span>
                </div>
                <div className="mt-3 h-1.5 w-full rounded-full bg-black/30">
                  <div className="h-full rounded-full bg-current opacity-60" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Golden Keys & Content */}
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

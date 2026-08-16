"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#f59e0b", "#3b82f6", "#f97316", "#8b5cf6", "#10b981", "#ef4444"];

// A9: Dashboard charts
export function DashboardCharts({
  weeklySignups,
  tierDistribution,
  consultStatuses,
}: {
  weeklySignups: { week: string; count: number }[];
  tierDistribution: { tier: string; count: number }[];
  consultStatuses: { status: string; count: number }[];
}) {
  // Aggregate weekly signups by week start
  const weekMap = new Map<string, number>();
  for (const s of weeklySignups) {
    const d = new Date(s.week);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().slice(0, 10);
    weekMap.set(key, (weekMap.get(key) || 0) + s.count);
  }
  const signupData = Array.from(weekMap.entries()).map(([week, count]) => ({
    week: week.slice(5), // MM-DD
    count,
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Signup Trends */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Signup Trends (12 weeks)
        </h2>
        {signupData.length === 0 ? (
          <p className="text-sm text-zinc-600">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={signupData}>
              <XAxis
                dataKey="week"
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={{ stroke: '#27272a' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#f4f4f5',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Tier Distribution Pie */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Tier Distribution
        </h2>
        {tierDistribution.length === 0 ? (
          <p className="text-sm text-zinc-600">No members yet.</p>
        ) : (
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={140} height={140}>
              <PieChart>
                <Pie
                  data={tierDistribution}
                  dataKey="count"
                  nameKey="tier"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={65}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {tierDistribution.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {tierDistribution.map((t, i) => (
                <div key={t.tier} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <span className="text-zinc-400 capitalize">{t.tier}</span>
                  <span className="ml-auto tabular-nums text-zinc-200 font-medium">{t.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Consultation Status */}
      {consultStatuses.length > 0 && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
            Consultation Pipeline
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={consultStatuses} layout="vertical">
              <XAxis
                type="number"
                tick={{ fill: '#71717a', fontSize: 10 }}
                axisLine={{ stroke: '#27272a' }}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                dataKey="status"
                type="category"
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '8px',
                  color: '#f4f4f5',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
      )}
    </div>
  );
}

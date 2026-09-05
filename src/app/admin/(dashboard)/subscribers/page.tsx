"use client";

import { useEffect, useMemo, useState } from "react";
import { getSubscribers, type SubscriberRow } from "./actions";
import { EngagementPanel } from "./engagement-panel";

/* ─── Constants ───────────────────────────────────────────────────────────── */

const CAMPAIGN_COLOR: Record<string, string> = {
  "navratri-oct26": "bg-violet-500/10 text-violet-400 border-violet-500/30",
  "guhya-halloween-oct26": "bg-orange-500/10 text-orange-400 border-orange-500/30",
  "doors-email-course": "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  "aug26-launch": "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

function chipClass(campaign: string | null): string {
  if (!campaign) return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
  return CAMPAIGN_COLOR[campaign] ?? "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
}

function timeAgo(iso: string | Date): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/* ─── Page ────────────────────────────────────────────────────────────────── */

export default function SubscribersPage() {
  const [rows, setRows] = useState<SubscriberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let alive = true;
    getSubscribers()
      .then((r) => {
        if (alive) setRows(r);
      })
      .catch((e: unknown) => {
        if (alive) setError(e instanceof Error ? e.message : "Failed to load");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.email.toLowerCase().includes(q) ||
        (r.utmSource ?? "").toLowerCase().includes(q) ||
        (r.utmCampaign ?? "").toLowerCase().includes(q) ||
        (r.country ?? "").toLowerCase().includes(q),
    );
  }, [rows, query]);

  const stats = useMemo(() => {
    const active = rows.filter((r) => r.status === "active").length;
    const week = rows.filter(
      (r) => Date.now() - new Date(r.createdAt).getTime() < 7 * 86_400_000,
    ).length;
    const campaigns = new Set(rows.map((r) => r.utmCampaign).filter(Boolean)).size;
    return { total: rows.length, active, week, campaigns };
  }, [rows]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Email Subscribers</h1>
          <p className="mt-1 text-sm text-zinc-500">
            The 10 Doors nurture list — capture layer for the pre-consult funnel.
          </p>
        </div>
        <a
          href="/api/admin/subscribers/export"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
        >
          Export CSV
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Last 7 days", value: stats.week },
          { label: "Campaigns", value: stats.campaigns },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-100">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Engagement analytics (Tier 2 #10) — rollup + Doors 1–5 non-opener segment */}
      <EngagementPanel />

      {/* Search */}
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search email, source, campaign, country…"
        className="w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none"
      />

      {/* Table */}
      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-800 p-10 text-center">
          <p className="text-sm text-zinc-500">
            No subscribers yet. The capture page is live at{" "}
            <code className="text-zinc-400">/email-course</code> — link it from the
            wave content and the list fills itself.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source chip</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Landing path</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40">
                  <td className="px-4 py-3 text-zinc-200">{r.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs ${
                        r.status === "active"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs ${chipClass(r.utmCampaign)}`}>
                      {[r.utmSource, r.utmMedium].filter(Boolean).join(" · ") || "direct"}
                      {r.utmCampaign ? ` · ${r.utmCampaign}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{r.country ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                    {r.landingPath ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{timeAgo(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

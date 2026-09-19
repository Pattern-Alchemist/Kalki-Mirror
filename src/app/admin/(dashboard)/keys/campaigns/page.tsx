"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAdminSWR } from "@/components/admin/use-admin-swr";

// =============================================================
// VOL. 2 #12 — Campaign Analytics Page
// -------------------------------------------------------------
// Shows per-campaign metrics: minted / redeemed / pending / revenue /
// conversion rate. Joins InviteCode.campaign → Consultation.redeemedCode
// → Consultation.paymentState (Vol. 6 #11 bridge).
// =============================================================

interface CampaignRow {
  campaign: string;
  minted: number;
  active: number;
  redeemed: number;
  pending: number;
  revenue: number;
  conversionRate: number;
}

interface CampaignsResponse {
  campaigns: CampaignRow[];
  totals: {
    campaigns: number;
    minted: number;
    redeemed: number;
    revenue: number;
  };
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  const colors: Record<string, string> = {
    amber: "border-amber-500/20 text-[var(--aw-cyan)]",
    emerald: "border-emerald-500/20 text-emerald-400",
    violet: "border-violet-500/20 text-violet-400",
    blue: "border-blue-500/20 text-blue-400",
  };
  return (
    <div className={`rounded-xl border ${colors[accent] || colors.amber} bg-[var(--aw-glass-1)] p-5`}>
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-[var(--aw-text)]">{value}</p>
    </div>
  );
}

export default function CampaignsPage() {
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);
  const { data, loading, error } = useAdminSWR<CampaignsResponse>({
    key: 'admin-campaigns',
    fetcher: async () => {
      const r = await fetch('/api/admin/campaigns');
      if (!r.ok) throw new Error('Failed to load campaigns');
      return r.json();
    },
    refreshInterval: 60_000,
    revalidateOnFocus: true,
  });

  const campaigns = data?.campaigns ?? [];
  const totals = data?.totals;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--aw-text)]">Campaign Analytics</h1>
          <p className="mt-1 text-sm text-[var(--aw-text-2)]">
            Attribution from mint → redeem → revenue per campaign. Joined via the Vol. 6 #11 <code className="rounded bg-[var(--aw-glass-1)] px-1 font-mono text-[var(--aw-cyan)]">redeemedCode</code> bridge.
          </p>
        </div>
        <Link
          href="/admin/keys"
          className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-1.5 text-xs font-medium text-[var(--aw-text-2)] transition hover:text-[var(--aw-text)]"
        >
          ← Keys
        </Link>
      </div>

      {loading && !data && <p className="text-sm text-[var(--aw-text-2)]">Loading campaigns…</p>}
      {error && <p className="text-red-400 text-sm">{error.message}</p>}

      {/* Totals strip */}
      {totals && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Campaigns" value={totals.campaigns} accent="amber" />
          <StatCard label="Keys Minted" value={totals.minted} accent="blue" />
          <StatCard label="Keys Redeemed" value={totals.redeemed} accent="violet" />
          <StatCard label="Paid Consultations" value={totals.revenue} accent="emerald" />
        </div>
      )}

      {/* Empty state */}
      {!loading && campaigns.length === 0 && (
        <div className="aw-card text-center py-12">
          <p className="text-sm text-[var(--aw-text-2)]">
            No campaigns yet. Mint keys with a campaign tag on the <Link href="/admin/keys" className="text-[var(--aw-cyan)] hover:text-amber-300">Keys page</Link> to start attribution tracking.
          </p>
        </div>
      )}

      {/* Campaigns table */}
      {campaigns.length > 0 && (
        <div className="overflow-x-auto aw-table">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]">
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Campaign</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Minted</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Active</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Redeemed</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Pending</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Paid</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)] text-right">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {campaigns.map(c => (
                <tr
                  key={c.campaign}
                  className="transition hover:bg-[var(--aw-glass-1)]/30 cursor-pointer"
                  onClick={() => setExpandedCampaign(prev => prev === c.campaign ? null : c.campaign)}
                >
                  <td className="px-4 py-3">
                    <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-[var(--aw-cyan)]/80">
                      {c.campaign}
                    </span>
                    {expandedCampaign === c.campaign && (
                      <div className="mt-2 text-[10px] text-[var(--aw-text-3)]">
                        <Link
                          href={`/admin/keys?campaign=${encodeURIComponent(c.campaign)}`}
                          onClick={e => e.stopPropagation()}
                          className="text-[var(--aw-cyan)] hover:text-amber-300"
                        >
                          View keys in this campaign →
                        </Link>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--aw-text)]">{c.minted}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-400">{c.active}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--aw-text)]">{c.redeemed}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-[var(--aw-text-2)]">{c.pending}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-emerald-400">{c.revenue}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      c.conversionRate >= 50 ? 'bg-emerald-500/10 text-emerald-400' :
                      c.conversionRate >= 20 ? 'bg-amber-500/10 text-amber-300' :
                      'bg-zinc-700/40 text-[var(--aw-text-2)]'
                    }`}>
                      {c.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

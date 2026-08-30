"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crosshair, ArrowRight } from "lucide-react";

/**
 * Campaign Pulse — compact war-room readout for the Overview page.
 * Pulls the 7-day window from /api/admin/warroom and refreshes every 60s.
 * Fully fail-silent: any error simply hides the strip.
 */

interface PulseData {
  kpis: { total: number; deltaPct: number | null; last7: number; bookingRate: number };
  campaigns: { campaign: string; leads: number }[];
  sources: { pair: string; n: number }[];
  geo: { country: string; n: number }[];
}

export function CampaignPulse() {
  const [d, setD] = useState<PulseData | null>(null);
  const [dead, setDead] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const r = await fetch("/api/admin/warroom?range=7");
        if (!r.ok) throw new Error();
        const j = (await r.json()) as PulseData;
        if (alive) { setD(j); setDead(false); }
      } catch {
        if (alive) setDead(true);
      }
    };
    load();
    const t = setInterval(load, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  if (dead || !d) return null;

  const topCampaign = d.campaigns[0];
  const topSource = d.sources[0];
  const topGeo = d.geo[0];

  const chips: { label: string; value: string }[] = [
    { label: "7d leads", value: String(d.kpis.last7) },
    ...(topCampaign && topCampaign.campaign !== "(none)"
      ? [{ label: "top campaign", value: topCampaign.campaign }]
      : []),
    ...(topSource ? [{ label: "top source", value: topSource.pair }] : []),
    ...(topGeo ? [{ label: "top geo", value: topGeo.country === "??" ? "unknown" : topGeo.country }] : []),
    { label: "booking rate", value: `${d.kpis.bookingRate}%` },
  ];

  return (
    <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.06] to-transparent p-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">Campaign pulse</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {chips.map((c) => (
            <div key={c.label} className="flex items-baseline gap-1.5">
              <span className="text-[0.65rem] uppercase tracking-wide text-zinc-600">{c.label}</span>
              <span className="max-w-[16rem] truncate text-sm font-semibold tabular-nums text-zinc-100" title={c.value}>{c.value}</span>
            </div>
          ))}
        </div>
        <Link
          href="/admin/war-room"
          className="ml-auto flex items-center gap-1 text-xs font-medium text-amber-400 transition hover:text-amber-300"
        >
          Open War Room <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

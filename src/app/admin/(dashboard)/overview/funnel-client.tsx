"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Filter, ArrowRight } from "lucide-react";

/**
 * Consultation Funnel — "The one funnel that matters" (Admin OS v2, Ch 7.2)
 *
 * Five stages on the Overview page, straight from data sources the site
 * owns: visitors → wizard started → submitted → triaged → booked.
 * The highlighted number is the blueprint's "single number": the
 * wizard-start → submit conversion, i.e. whether /consultations converts.
 *
 * Fail-silent like CampaignPulse: a dead endpoint hides the widget; a dead
 * event store only dims the top-of-funnel stages to "—".
 */

interface FunnelStage {
  key: string;
  label: string;
  definition: string;
  question: string;
  value: number | null;
  stepPct: number | null;
}

interface FunnelData {
  generatedAt: string;
  range: number;
  eventsAvailable: boolean;
  wizardSubmittedEvents: number | null;
  stages: FunnelStage[];
}

const RANGES = [7, 30, 90] as const;

export function ConsultationFunnel() {
  const [d, setD] = useState<FunnelData | null>(null);
  const [dead, setDead] = useState(false);
  const [range, setRange] = useState<number>(30);

  const load = useCallback(async (r: number) => {
    try {
      const res = await fetch(`/api/admin/funnel?range=${r}`);
      if (!res.ok) throw new Error();
      const j = (await res.json()) as FunnelData;
      setD(j);
      setDead(false);
    } catch {
      setDead(true);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    load(range);
    const t = setInterval(() => { if (alive) load(range); }, 60_000);
    return () => { alive = false; clearInterval(t); };
  }, [load, range]);

  if (dead) return null;
  if (!d) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Consultation funnel</p>
        <p className="mt-2 text-sm text-zinc-600">Loading…</p>
      </div>
    );
  }

  // Bar widths are relative to the first stage that carries a real value.
  const base = (d.stages.find((s) => s.value !== null && s.value > 0)?.value ?? 1) as number;
  const pageConversion = d.stages[2]?.stepPct ?? null;

  return (
    <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/[0.06] to-transparent p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
            The one funnel that matters
          </span>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium transition ${
                range === r
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
        <Link
          href="/admin/consultations"
          className="ml-auto flex items-center gap-1 text-xs font-medium text-amber-400 transition hover:text-amber-300"
        >
          Open pipeline <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Headline — the blueprint's single number */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-4xl font-semibold tabular-nums text-zinc-100">
          {pageConversion === null ? "—" : `${pageConversion}%`}
        </span>
        <span className="text-xs text-zinc-500">
          wizard → submit · whether /consultations converts
        </span>
        {!d.eventsAvailable && (
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[0.65rem] text-zinc-500">
            event store unavailable — top stages dimmed
          </span>
        )}
      </div>

      {/* Stage bars */}
      <div className="mt-4 space-y-2.5">
        {d.stages.map((s) => {
          const dimmed = s.value === null;
          const width = s.value === null || base === 0 ? 0 : Math.max((s.value / base) * 100, 1.5);
          return (
            <div key={s.key} className="group grid grid-cols-[9.5rem_1fr] items-center gap-3 sm:grid-cols-[11rem_1fr]">
              <div className="min-w-0">
                <p className={`truncate text-xs font-medium ${dimmed ? "text-zinc-600" : "text-zinc-300"}`}>
                  {s.label}
                </p>
                <p className="truncate text-[0.65rem] text-zinc-600" title={`${s.definition} — answers: ${s.question}`}>
                  {s.question}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 flex-1 overflow-hidden rounded-md bg-zinc-900/70">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-amber-500/40 to-amber-500/15"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className={`w-14 shrink-0 text-right text-sm font-semibold tabular-nums ${dimmed ? "text-zinc-600" : "text-zinc-100"}`}>
                  {s.value === null ? "—" : s.value.toLocaleString()}
                </span>
                <span
                  className={`w-14 shrink-0 text-right text-[0.65rem] tabular-nums ${
                    s.stepPct === null ? "text-zinc-700" : "text-amber-300/80"
                  }`}
                  title={s.stepPct === null ? "" : `${s.stepPct}% of the previous stage`}
                >
                  {s.stepPct === null ? "" : `↘ ${s.stepPct}%`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer links */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-zinc-800/60 pt-3 text-[0.65rem] text-zinc-600">
        <span>{d.wizardSubmittedEvents ?? "—"} wizard_submitted events in window (tracker cross-check)</span>
        <Link href="/admin/analytics" className="text-zinc-500 transition hover:text-amber-300">
          Analytics
        </Link>
        <Link href="/admin/war-room" className="text-zinc-500 transition hover:text-amber-300">
          War Room
        </Link>
      </div>
    </div>
  );
}

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

interface RollupRow {
  key: string;
  label: string;
  submitted: number;
  triaged: number;
  booked: number;
}

interface DoorsRow extends RollupRow {
  day: string;
}

interface AttributionData {
  campaigns: RollupRow[];
  doors: DoorsRow[];
}

interface FunnelData {
  generatedAt: string;
  range: number;
  eventsAvailable: boolean;
  wizardSubmittedEvents: number | null;
  stages: FunnelStage[];
  attribution?: AttributionData;
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
      <div className="rounded-xl border border-[var(--aw-border-2)] bg-transparent/40 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Consultation funnel</p>
        <p className="mt-2 text-sm text-[var(--aw-text-3)]">Loading…</p>
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
          <Filter className="h-4 w-4 text-[var(--aw-cyan)]" />
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
                  ? "border-amber-500/40 bg-[rgba(0,240,255,0.08)] text-amber-300"
                  : "border-[var(--aw-border-2)] text-[var(--aw-text-2)] hover:text-[var(--aw-text-2)]"
              }`}
            >
              {r}d
            </button>
          ))}
        </div>
        <Link
          href="/admin/consultations"
          className="ml-auto flex items-center gap-1 text-xs font-medium text-[var(--aw-cyan)] transition hover:text-amber-300"
        >
          Open pipeline <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Headline — the blueprint's single number */}
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-4xl font-semibold tabular-nums text-[var(--aw-text)]">
          {pageConversion === null ? "—" : `${pageConversion}%`}
        </span>
        <span className="text-xs text-[var(--aw-text-2)]">
          wizard → submit · whether /consultations converts
        </span>
        {!d.eventsAvailable && (
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[0.65rem] text-[var(--aw-text-2)]">
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
                <p className={`truncate text-xs font-medium ${dimmed ? "text-[var(--aw-text-3)]" : "text-[var(--aw-text-2)]"}`}>
                  {s.label}
                </p>
                <p className="truncate text-[0.65rem] text-[var(--aw-text-3)]" title={`${s.definition} — answers: ${s.question}`}>
                  {s.question}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-5 flex-1 overflow-hidden rounded-md bg-[var(--aw-glass-1)]/70">
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-amber-500/40 to-amber-500/15"
                    style={{ width: `${width}%` }}
                  />
                </div>
                <span className={`w-14 shrink-0 text-right text-sm font-semibold tabular-nums ${dimmed ? "text-[var(--aw-text-3)]" : "text-[var(--aw-text)]"}`}>
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

      {/* Vol. 2 #4 — attribution: top campaigns + the Doors day board */}
      {d.attribution && (d.attribution.campaigns.length > 0 || d.attribution.doors.length > 0) && (
        <div className="mt-4 space-y-3 border-t border-[var(--aw-border-2)]/60 pt-3">
          {d.attribution.campaigns.length > 0 && (
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--aw-text-2)]">
                Where leads came from · utm campaigns in window
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {d.attribution.campaigns.slice(0, 6).map((c) => (
                  <span
                    key={c.key}
                    title={`${c.label} — ${c.submitted} submitted · ${c.triaged} triaged · ${c.booked} booked`}
                    className="rounded-full border border-[var(--aw-border-2)] bg-transparent/60 px-2.5 py-1 text-[0.65rem] text-[var(--aw-text-2)]"
                  >
                    {c.label}
                    <span className="ml-1.5 font-semibold tabular-nums text-amber-300/90">{c.submitted}</span>
                    {c.booked > 0 && <span className="ml-1 text-emerald-400/80">· {c.booked} booked</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
          {d.attribution.doors.length > 0 && (
            <div>
              <p className="text-[0.65rem] font-medium uppercase tracking-wider text-[var(--aw-text-2)]">
                The 10 Doors · email day → wizard submissions (utm_content)
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {d.attribution.doors.map((door) => (
                  <span
                    key={door.key}
                    title={`${door.submitted} submitted · ${door.triaged} triaged · ${door.booked} booked`}
                    className={`rounded-full border px-2.5 py-1 text-[0.65rem] ${
                      door.submitted > 0
                        ? "border-[var(--aw-border-2)] bg-amber-500/[0.07] text-amber-200/90"
                        : "border-[var(--aw-border-2)] text-[var(--aw-text-3)]"
                    }`}
                  >
                    {door.label}
                    <span className="ml-1.5 font-semibold tabular-nums">{door.submitted}</span>
                    {door.booked > 0 && <span className="ml-1 text-emerald-400/80">· {door.booked} booked</span>}
                  </span>
                ))}
              </div>
              <p className="mt-1 text-[0.6rem] text-[var(--aw-text-3)]">
                Attribution end-to-end: email CTA (utm_content=day-N) → wizard → Consultation row → this board.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Footer links */}
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 border-t border-[var(--aw-border-2)]/60 pt-3 text-[0.65rem] text-[var(--aw-text-3)]">
        <span>{d.wizardSubmittedEvents ?? "—"} wizard_submitted events in window (tracker cross-check)</span>
        <Link href="/admin/analytics" className="text-[var(--aw-text-2)] transition hover:text-amber-300">
          Analytics
        </Link>
        <Link href="/admin/war-room" className="text-[var(--aw-text-2)] transition hover:text-amber-300">
          War Room
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { getScheduledContent } from "./actions";

// =============================================================
// VOL. 2 #13 — Content Schedule Calendar
// -------------------------------------------------------------
// A 7-day calendar grid showing scheduled + recently published
// content. The founder queues Sunday's letter on Monday and the
// calendar shows when each entry will go live.
//
// Color codes by entry type:
//   · practice    — emerald
//   · archetype   — violet
//   · pattern     — amber
//   · research    — blue
//   · codex       — cyan
//   · letters     — rose
// =============================================================

interface ScheduledEntry {
  id: string;
  type: string;
  slug: string;
  title: string;
  status: string;
  publishedAt: Date | null;
}

const TYPE_COLOR: Record<string, string> = {
  practice: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  archetype: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  pattern: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  research: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  codex: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  letters: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
};

function formatDayHeader(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function CalendarView() {
  const [entries, setEntries] = useState<ScheduledEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Load on mount
  useMemo(() => {
    getScheduledContent()
      .then(rows => setEntries(rows as ScheduledEntry[]))
      .catch(e => setErr(e instanceof Error ? e.message : 'Failed to load schedule'))
      .finally(() => setLoading(false));
  }, []);

  // Build 7-day grid starting today
  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return d;
    });
  }, []);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, ScheduledEntry[]>();
    for (const d of days) {
      map.set(d.toDateString(), []);
    }
    for (const e of entries) {
      if (!e.publishedAt) continue;
      const key = e.publishedAt.toDateString();
      if (map.has(key)) {
        map.get(key)!.push(e);
      }
    }
    return map;
  }, [entries, days]);

  const now = new Date();

  return (
    <section className="aw-card">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--aw-text-2)]">
          📅 Schedule — Next 7 Days
        </h2>
        <span className="text-xs text-[var(--aw-text-3)]">
          Vol. 2 #13 — queued content + recent publishes
        </span>
      </div>

      {loading && <p className="mt-2 text-sm text-[var(--aw-text-2)]">Loading schedule…</p>}
      {err && <p className="mt-2 text-red-400 text-sm">{err}</p>}

      {!loading && !err && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {days.map(d => {
            const dayEntries = entriesByDay.get(d.toDateString()) ?? [];
            const isToday = sameDay(d, now);
            const isPast = d < now && !isToday;
            return (
              <div
                key={d.toISOString()}
                className={`min-h-[120px] rounded-lg border p-2 ${
                  isToday
                    ? 'border-[var(--aw-cyan)]/60 bg-[rgba(0,240,255,0.04)]'
                    : isPast
                    ? 'border-[var(--aw-border-2)]/40 opacity-60'
                    : 'border-[var(--aw-border-2)]/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--aw-text-3)]">
                    {formatDayHeader(d)}
                  </p>
                  {isToday && <span className="h-1.5 w-1.5 rounded-full bg-[var(--aw-cyan)]" />}
                </div>
                <div className="mt-1.5 space-y-1">
                  {dayEntries.length === 0 ? (
                    <p className="text-[9px] text-[var(--aw-text-3)] py-1">—</p>
                  ) : (
                    dayEntries.map(e => (
                      <div
                        key={e.id}
                        className={`rounded border px-1.5 py-1 text-[10px] leading-tight ${TYPE_COLOR[e.type] ?? 'bg-zinc-800 text-[var(--aw-text-2)] border-zinc-700'}`}
                        title={`${e.type} — ${e.title}`}
                      >
                        <p className="truncate font-medium">{e.title}</p>
                        {e.publishedAt && (
                          <p className="text-[9px] opacity-70">
                            {e.publishedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && entries.length === 0 && (
        <p className="mt-3 text-xs text-[var(--aw-text-3)]">
          No scheduled content in the next 7 days. Set a future <code className="rounded bg-[var(--aw-glass-1)] px-1 font-mono text-[var(--aw-cyan)]">publishedAt</code> on a draft to queue it here.
        </p>
      )}
    </section>
  );
}

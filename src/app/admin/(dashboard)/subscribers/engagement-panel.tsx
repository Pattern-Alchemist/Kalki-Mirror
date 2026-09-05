"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import {
  getEngagement,
  resendDoorToNonOpeners,
  type EngagementSnapshot,
} from "./actions";

/* ─── Engagement panel (Tier 2 #10) ────────────────────────────────────────
   Per-subscriber engagement rollup + the Doors 1–5 non-opener segment
   with a one-click admin re-send. Loads after the main list so the
   capture view never waits on the analytics join. */

function timeAgo(iso: string | null): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function EngagementPanel() {
  const [data, setData] = useState<EngagementSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyDoor, setBusyDoor] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const load = useCallback(() => {
    getEngagement()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load engagement"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resend = (door: number) => {
    if (
      !window.confirm(
        `Re-send Door ${door} to ${data?.nonOpeners[String(door)]?.length ?? 0} non-opener(s)? Each gets one fresh email.`,
      )
    )
      return;
    setBusyDoor(door);
    setResult(null);
    startTransition(async () => {
      try {
        const r = await resendDoorToNonOpeners(door);
        setResult(`Door ${door}: ${r.sent} sent, ${r.failed} failed (of ${r.total} targeted).`);
        load();
      } catch (e: unknown) {
        setResult(e instanceof Error ? e.message : "Re-send failed");
      } finally {
        setBusyDoor(null);
      }
    });
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
        Engagement analytics: {error}
      </div>
    );
  }

  if (!data) {
    return <p className="text-sm text-zinc-500">Loading engagement analytics…</p>;
  }

  const doors = ["1", "2", "3", "4", "5"].filter((d) => (data.nonOpeners[d]?.length ?? 0) > 0);

  return (
    <div className="space-y-4">
      {/* Totals */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Sends", value: data.totals.sends },
          { label: "Delivered", value: data.totals.delivered },
          { label: "Open rate", value: data.totals.openRate === null ? "—" : `${data.totals.openRate}%` },
          { label: "Click rate", value: data.totals.clickRate === null ? "—" : `${data.totals.clickRate}%` },
          { label: "Bounced", value: data.totals.bounced },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-xs uppercase tracking-wider text-zinc-500">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-zinc-100">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Non-opener segment + re-send */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-zinc-200">Doors 1–5 non-openers</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Active subscribers who received an early Door but never opened it — the re-engagement segment.
            </p>
          </div>
          {result && <p className="text-xs text-emerald-400">{result}</p>}
        </div>
        {doors.length === 0 ? (
          <p className="mt-3 text-xs text-zinc-600">
            No non-opener data yet — this fills as the daily sender dispatches Doors and Resend reports opens.
          </p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {doors.map((d) => {
              const count = data.nonOpeners[d]?.length ?? 0;
              const n = Number(d);
              return (
                <button
                  key={d}
                  onClick={() => resend(n)}
                  disabled={(busyDoor === n && pending) || pending}
                  className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 transition hover:border-amber-400 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busyDoor === n && pending ? "Sending…" : `Door ${d} · ${count} → re-send`}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Per-subscriber engagement table */}
      {data.rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Sent</th>
                <th className="px-4 py-3">Delivered</th>
                <th className="px-4 py-3">Opened</th>
                <th className="px-4 py-3">Clicked</th>
                <th className="px-4 py-3">Last event</th>
              </tr>
            </thead>
            <tbody>
              {data.rows
                .filter((r) => r.sent > 0)
                .map((r) => (
                  <tr key={r.email} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-900/40">
                    <td className="px-4 py-3 text-zinc-200">{r.email}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.sent}</td>
                    <td className="px-4 py-3 text-zinc-300">{r.delivered}</td>
                    <td className="px-4 py-3">
                      <span className={r.opened > 0 ? "text-emerald-400" : "text-zinc-500"}>{r.opened}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={r.clicked > 0 ? "text-emerald-400" : "text-zinc-500"}>{r.clicked}</span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{timeAgo(r.lastEventAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

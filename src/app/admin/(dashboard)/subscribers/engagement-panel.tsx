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
    return <p className="text-sm text-[var(--aw-text-2)]">Loading engagement analytics…</p>;
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
          <div key={s.label} className="aw-card">
            <p className="text-xs uppercase tracking-wider text-[var(--aw-text-2)]">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--aw-text)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Vol. 3 #8 — per-URL click report */}
      <div className="aw-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--aw-text)]">Clicked URLs (CTR report)</h2>
            <p className="mt-0.5 text-xs text-[var(--aw-text-2)]">
              Where delivered attention actually lands — click rollup by target URL across all send kinds.
            </p>
          </div>
        </div>
        {data.topUrls.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--aw-text-3)]">
            No click events yet — this fills as Resend reports clicks from the webhook.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-[var(--aw-border-2)]">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--aw-border-2)] text-xs uppercase tracking-wider text-[var(--aw-text-2)]">
                  <th scope="col" className="px-4 py-2.5">URL</th>
                  <th scope="col" className="px-4 py-2.5">Clicks</th>
                  <th scope="col" className="px-4 py-2.5">Share of clicks</th>
                  <th scope="col" className="px-4 py-2.5">Last click</th>
                </tr>
              </thead>
              <tbody>
                {data.topUrls.map((u) => (
                  <tr key={u.url} className="border-b border-[var(--aw-border-2)]/60 last:border-0 hover:bg-[var(--aw-glass-1)]/40">
                    <td className="max-w-[380px] truncate px-4 py-2.5 font-mono text-xs text-[var(--aw-text-2)]" title={u.url}>
                      {u.url}
                    </td>
                    <td className="px-4 py-2.5 text-[var(--aw-text)]">{u.clicks}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-emerald-400">{u.sharePct}%</span>
                    </td>
                    <td className="px-4 py-2.5 text-[var(--aw-text-2)]">{timeAgo(u.lastClickAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Non-opener segment + re-send */}
      <div className="aw-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[var(--aw-text)]">Doors 1–5 non-openers</h2>
            <p className="mt-0.5 text-xs text-[var(--aw-text-2)]">
              Active subscribers who received an early Door but never opened it — the re-engagement segment.
            </p>
          </div>
          {result && <p className="text-xs text-emerald-400">{result}</p>}
        </div>
        {doors.length === 0 ? (
          <p className="mt-3 text-xs text-[var(--aw-text-3)]">
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
                  className="rounded-full border border-[var(--aw-border-2)] bg-[rgba(0,240,255,0.08)] px-3 py-1.5 text-xs text-amber-300 transition hover:border-amber-400 hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="overflow-x-auto aw-table">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--aw-border-2)] text-xs uppercase tracking-wider text-[var(--aw-text-2)]">
                <th scope="col" className="px-4 py-3">Email</th>
                <th scope="col" className="px-4 py-3">Sent</th>
                <th scope="col" className="px-4 py-3">Delivered</th>
                <th scope="col" className="px-4 py-3">Opened</th>
                <th scope="col" className="px-4 py-3">Clicked</th>
                <th scope="col" className="px-4 py-3">Last event</th>
              </tr>
            </thead>
            <tbody>
              {data.rows
                .filter((r) => r.sent > 0)
                .map((r) => (
                  <tr key={r.email} className="border-b border-[var(--aw-border-2)]/60 last:border-0 hover:bg-[var(--aw-glass-1)]/40">
                    <td className="px-4 py-3 text-[var(--aw-text)]">{r.email}</td>
                    <td className="px-4 py-3 text-[var(--aw-text-2)]">{r.sent}</td>
                    <td className="px-4 py-3 text-[var(--aw-text-2)]">{r.delivered}</td>
                    <td className="px-4 py-3">
                      <span className={r.opened > 0 ? "text-emerald-400" : "text-[var(--aw-text-2)]"}>{r.opened}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={r.clicked > 0 ? "text-emerald-400" : "text-[var(--aw-text-2)]"}>{r.clicked}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--aw-text-2)]">{timeAgo(r.lastEventAt)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

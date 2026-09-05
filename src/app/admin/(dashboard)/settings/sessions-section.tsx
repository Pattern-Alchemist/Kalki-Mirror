"use client";

import { useCallback, useEffect, useState } from "react";
import { Monitor, Smartphone, Tablet, LogOut, Loader2 } from "lucide-react";

/**
 * ACTIVE SESSIONS — Vol. 2 #11
 *
 * "Your active sessions" read model for Settings: every live device
 * (label, IP, last seen), which one is this device, and one-tap revocation
 * — single device or all others. Revocations are audit-logged server-side;
 * this component just renders the truth the API returns.
 *
 * Fail-silent like the rest of Settings: a dead endpoint hides the section,
 * never breaks the page.
 */

interface SessionRow {
  id: string;
  device: string;
  kind: "desktop" | "mobile" | "tablet" | "unknown";
  ip: string | null;
  lastSeen: string;
  createdAt: string;
  current: boolean;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function DeviceIcon({ kind }: { kind: SessionRow["kind"] }) {
  const cls = "h-4 w-4 shrink-0 text-zinc-500";
  if (kind === "mobile") return <Smartphone className={cls} />;
  if (kind === "tablet") return <Tablet className={cls} />;
  return <Monitor className={cls} />;
}

export function SessionsSection() {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/sessions");
      if (!res.ok) throw new Error();
      const j = (await res.json()) as { sessions: SessionRow[] };
      setSessions(j.sessions);
    } catch {
      setSessions(null);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function revoke(payload: { id?: string; others?: boolean }, confirmMsg: string) {
    if (!window.confirm(confirmMsg)) return;
    setBusyId(payload.id ?? "others");
    setNotice(null);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setNotice(payload.others ? "All other devices signed out." : "Device signed out.");
      await load();
    } catch {
      setNotice("Revocation failed — try again.");
    } finally {
      setBusyId(null);
    }
  }

  if (sessions === null) return null; // dead endpoint → hide section entirely

  const others = sessions.filter((s) => !s.current).length;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Active Sessions</h2>
        {others > 0 && (
          <button
            onClick={() =>
              revoke(
                { others: true },
                `Sign out all ${others} other device${others === 1 ? "" : "s"}? Your current session stays active.`,
              )
            }
            disabled={busyId !== null}
            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:border-red-500/50 hover:text-red-300 disabled:opacity-50"
          >
            {busyId === "others" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
            Sign out other devices ({others})
          </button>
        )}
      </div>

      {notice && <p className="text-xs text-amber-400">{notice}</p>}

      {sessions.length === 0 ? (
        <p className="text-xs text-zinc-600">No tracked sessions yet — this list fills in as you use the console.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-zinc-950 px-3 py-2.5"
            >
              <DeviceIcon kind={s.kind} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
                  <span className="truncate">{s.device}</span>
                  {s.current && (
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-medium text-emerald-400">
                      This device
                    </span>
                  )}
                </p>
                <p className="truncate text-[0.65rem] text-zinc-600" title={s.ip ?? undefined}>
                  {s.ip ?? "ip hidden"} · seen {timeAgo(s.lastSeen)} · started {timeAgo(s.createdAt)}
                </p>
              </div>
              {!s.current && (
                <button
                  onClick={() => revoke({ id: s.id }, `Sign out ${s.device}?`)}
                  disabled={busyId !== null}
                  className="rounded-lg border border-zinc-800 px-2.5 py-1 text-[0.65rem] font-medium text-zinc-400 transition hover:border-red-500/40 hover:text-red-400 disabled:opacity-50"
                >
                  {busyId === s.id ? "…" : "Revoke"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[0.65rem] leading-relaxed text-zinc-600">
        Sessions expire after 12 hours; at most 3 devices stay signed in at once (oldest is evicted). Revocations take
        effect on the device&apos;s next request and are recorded in the audit log.
      </p>
    </section>
  );
}

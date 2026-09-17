"use client";

import { useEffect, useState } from "react";
import { Gauge } from "lucide-react";

/**
 * THROTTLE CARD — Vol. 2 #14 (rate-limit observability)
 *
 * 429s per serverless instance in the last minute, broken down by surface.
 * Reads the public /api/health snapshot — no auth round-trip, no extra
 * endpoint. Honest scope label: the counter is per-instance, so treat it
 * as a floor, not a global total.
 *
 * Fail-silent: hides itself when /api/health is unreachable.
 */

interface Snapshot {
  lastMinute: number;
  byPrefix: Record<string, number>;
  samples: number;
  scope: "instance";
}

export function ThrottleCard() {
  const [s, setS] = useState<Snapshot | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("/api/health")
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => {
          if (alive && j?.rateLimit429) setS(j.rateLimit429 as Snapshot);
        })
        .catch(() => {});
    load();
    const t = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!s) return null;

  const surfaces = Object.entries(s.byPrefix);
  const hot = s.lastMinute >= 20; // sustained 429s = a limiter is doing real work

  return (
    <div className="rounded-xl border border-[var(--aw-border-2)] bg-transparent/40 p-5">
      <div className="flex items-center gap-2">
        <Gauge className={`h-4 w-4 ${hot ? "text-red-400" : "text-[var(--aw-text-2)]"}`} />
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--aw-text-2)]">Throttling</span>
        <span className="ml-auto rounded-full border border-[var(--aw-border-2)] px-2 py-0.5 text-[0.6rem] text-[var(--aw-text-3)]">
          per instance
        </span>
      </div>
      <div className="mt-3 flex items-baseline gap-x-3">
        <span className={`text-3xl font-semibold tabular-nums ${hot ? "text-red-300" : "text-[var(--aw-text)]"}`}>
          {s.lastMinute}
        </span>
        <span className="text-xs text-[var(--aw-text-2)]">429s in the last minute</span>
      </div>
      {surfaces.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {surfaces.map(([prefix, n]) => (
            <span key={prefix} className="rounded-full border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]/60 px-2.5 py-0.5 text-[0.65rem] text-[var(--aw-text-2)]">
              {prefix}
              <span className="ml-1.5 font-semibold tabular-nums text-[var(--aw-text)]">{n}</span>
            </span>
          ))}
        </div>
      )}
      <p className="mt-2 text-[0.6rem] text-[var(--aw-text-3)]">
        backend already surfaced on /health · sustained 429s = tightening limiter or an abusive client
      </p>
    </div>
  );
}

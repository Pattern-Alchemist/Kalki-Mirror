// =============================================================
// KALKI — drill verdict ledger (Vol. 6 #3)
// -------------------------------------------------------------
// The drills (page-weight, turso-failover, chain-probe) now run
// themselves — a weekly GitHub workflow fires them and reports
// verdicts here. A drill that needs a human, a sandbox and a
// memory is a ritual, not a guard; this module is how the verdicts
// reach the war-room and the founder's inbox.
//
// Storage: OpsState rows keyed `drill:<name>` (JSON StoredDrill).
// Staleness doctrine: a drill silent > 8 days is treated as FAILED
// — silence is the one verdict a guard must never be allowed.
// Digest: quiet on green+fresh; one alert line otherwise. Fail-soft
// everywhere (a transient OpsState read dims a line, never the run).
// =============================================================

import { db } from "@/lib/db";

export const DRILL_OPS_PREFIX = "drill:";

export const DRILLS = ["page-weight", "turso-failover", "chain-probe", "production-sweep"] as const;
export type DrillName = (typeof DRILLS)[number];

export const DRILL_NAMES: readonly string[] = DRILLS;

/** A drill silent longer than this reads as failed in the digest. */
export const DRILL_STALE_MS = 8 * 24 * 3600 * 1000;

export interface StoredDrill {
  name: string;
  verdict: "pass" | "fail";
  at: string; // ISO timestamp of the drill run
  source: string; // "gh" | "local" | "cron"
  details?: string;
}

export function isDrillName(name: unknown): name is DrillName {
  return typeof name === "string" && (DRILL_NAMES as readonly string[]).includes(name);
}

export function isDrillVerdict(v: unknown): v is "pass" | "fail" {
  return v === "pass" || v === "fail";
}

/** Strict shape check — a malformed verdict is a bug, not data. */
export function parseStoredDrill(value: string | null | undefined): StoredDrill | null {
  if (!value) return null;
  try {
    const obj = JSON.parse(value) as Partial<StoredDrill>;
    if (
      isDrillName(obj.name) &&
      isDrillVerdict(obj.verdict) &&
      typeof obj.at === "string" &&
      !Number.isNaN(Date.parse(obj.at)) &&
      typeof obj.source === "string"
    ) {
      return {
        name: obj.name,
        verdict: obj.verdict,
        at: obj.at,
        source: obj.source,
        details: typeof obj.details === "string" ? obj.details : undefined,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** A drill is stale when it has no verdict, its verdict is unparseable,
 *  or its last run is older than the staleness window. */
export function isDrillStale(
  stored: StoredDrill | null | undefined,
  now: Date,
  staleMs: number = DRILL_STALE_MS,
): boolean {
  if (!stored) return true;
  return now.getTime() - Date.parse(stored.at) > staleMs;
}

/** Digest line: quiet on green+fresh; one alert line otherwise. */
export function drillsDigestLine(
  states: Record<string, StoredDrill | null>,
  now: Date,
): string {
  const problems: string[] = [];
  for (const name of DRILLS) {
    const s = states[name];
    if (!s) {
      problems.push(`${name}: never reported`);
    } else if (s.verdict === "fail") {
      problems.push(`${name}: FAILED ${s.at.slice(0, 10)}${s.details ? ` (${s.details.slice(0, 80)})` : ""}`);
    } else if (isDrillStale(s, now)) {
      problems.push(`${name}: stale (last pass ${s.at.slice(0, 10)}, > 8d)`);
    }
  }
  if (problems.length === 0) {
    const fresh = DRILLS.map((n) => states[n])
      .filter((s): s is StoredDrill => !!s)
      .map((s) => s.at.slice(0, 10));
    return `DRILLS: all green (${DRILLS.join(" · ")}, latest ${fresh.sort().at(-1) ?? "?"})`;
  }
  return `DRILLS ALERT: ${problems.join(" · ")}`;
}

/** Persist one verdict (upsert, the drill-status route's write path). */
export async function storeDrillVerdict(input: {
  name: DrillName;
  verdict: "pass" | "fail";
  source: string;
  details?: string;
  at?: Date;
}): Promise<StoredDrill> {
  const stored: StoredDrill = {
    name: input.name,
    verdict: input.verdict,
    at: (input.at ?? new Date()).toISOString(),
    source: input.source,
    details: input.details,
  };
  await db.opsState.upsert({
    where: { key: `${DRILL_OPS_PREFIX}${input.name}` },
    update: { value: JSON.stringify(stored) },
    create: { key: `${DRILL_OPS_PREFIX}${input.name}`, value: JSON.stringify(stored) },
  });
  return stored;
}

export interface DrillPanelRow extends StoredDrill {
  stale: boolean;
  ageHours: number;
}

/** War-room panel data: every known drill verdict + staleness flags. */
export async function readDrillPanel(now: Date = new Date()): Promise<DrillPanelRow[]> {
  const rows = await db.opsState.findMany({
    where: { key: { startsWith: DRILL_OPS_PREFIX } },
  });
  const out: DrillPanelRow[] = [];
  for (const row of rows) {
    const s = parseStoredDrill(row.value);
    if (!s) continue;
    out.push({
      ...s,
      stale: isDrillStale(s, now),
      ageHours: Math.round((now.getTime() - Date.parse(s.at)) / 3600000),
    });
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

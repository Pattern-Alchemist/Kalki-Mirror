/* ═════════════════════════════════════════════════════════════
   CRON OUTCOME LEDGER — Vol. 5 #4
   -------------------------------------------------------------
   Four crons ran daily blind (indexnow, course-send, daily-
   digest, cleanup): no record of duration, items touched, or
   whether they ran at all — a silently dead cron was discovered
   by its symptoms. Every cron route now wraps its body in
   withCronLedger: one CronRun row per run, written soft-fail
   (the ledger must never break the cron it observes).

   REGISTERED_CRONS is the schedule contract mirrored from
   vercel.json; the digest alarms when any registered cron has
   no run in > 26h (a daily cron with 26h of silence is dead).
   ═════════════════════════════════════════════════════════════ */

import { db } from "@/lib/db";

const CRON_RUN_DDL = [
  `CREATE TABLE IF NOT EXISTS "CronRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "items" INTEGER,
    "outcome" TEXT NOT NULL,
    "error" TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS "CronRun_name_startedAt_idx" ON "CronRun"("name","startedAt")`,
];

let ensuredTable: Promise<void> | null = null;

/**
 * Self-healing migration: the remote store gets the CronRun table on first
 * ledger write (server env holds the working token; the founder-vault copy
 * may be stale — the 2026-09-08 lesson). Dev/file stores skip — their table
 * comes from db push / the test provision. Soft-fail: an unexecutable DDL
 * just means the row write below fails soft too.
 */
async function ensureCronRunTable(): Promise<void> {
  if (!ensuredTable) {
    ensuredTable = (async () => {
      const url = process.env.TURSO_DATABASE_URL;
      const token = process.env.TURSO_AUTH_TOKEN;
      if (!url || !token || !/^(libsql|https):\/\//.test(url)) return;
      const { createClient } = await import("@libsql/client");
      const client = createClient({ url, authToken: token });
      for (const ddl of CRON_RUN_DDL) {
        await client.execute(ddl);
      }
    })();
  }
  await ensuredTable;
}

export type CronName =
  | "indexnow"
  | "cred-audit"
  | "chain-health"
  | "daily-digest"
  | "cleanup"
  | "course-send"
  | "testimonial-followup"
  | "prewarm-ask"
  | "gsc-indexing";

export const CRON_LEDGER_MAX_AGE_H = 26;

/** vercel.json mirrored — a registered cron with no row in 26h is an alarm. */
export const REGISTERED_CRONS: Record<CronName, { schedule: string; description: string }> = {
  "indexnow": { schedule: "0 2 * * *", description: "IndexNow ping of changed URLs" },
  "cred-audit": { schedule: "10 2 * * *", description: "Provider credential verify pings (Vol. 5 #2)" },
  "chain-health": { schedule: "15 2 * * *", description: "OpenRouter chain probe (Vol. 5 #1)" },
  "daily-digest": { schedule: "30 2 * * *", description: "Founder ops digest email" },
  "cleanup": { schedule: "45 3 * * *", description: "TTL cleanup (cache, sessions, events)" },
  "course-send": { schedule: "30 14 * * *", description: "Email course door deliveries" },
  "testimonial-followup": { schedule: "25 2 * * *", description: "t+14d testimonial ask after COMPLETED consultations (Vol. 5 #14)" },
  "prewarm-ask": { schedule: "20 2 * * *", description: "Pre-warm the ask-cache for the top-10 corpus queries (Vol. 5 #5)" },
  "gsc-indexing": { schedule: "40 2 * * *", description: "GSC indexing queue: sitemap diff + submit when OAuth lands (Vol. 5 #12)" },
};

export interface CronRunRow {
  name: string;
  startedAt: Date;
  durationMs: number;
  items: number | null;
  outcome: string;
  error: string | null;
}

export interface CronLedgerResult<T> {
  result: T;
  runId: string | null;
}

/**
 * Wrap a cron body: time it, record the outcome, never let the ledger
 * throw into the cron. `fn` may return { items } (plus anything else) so
 * the row can say HOW MUCH work the run did.
 */
export async function withCronLedger<T extends { items?: number }>(
  name: CronName,
  fn: () => Promise<T>
): Promise<CronLedgerResult<T>> {
  const startedAt = new Date();
  let outcome: "ok" | "error" = "ok";
  let error: string | null = null;
  try {
    const result = await fn();
    await appendRow({
      name,
      startedAt,
      durationMs: Date.now() - startedAt.getTime(),
      items: typeof result.items === "number" ? result.items : null,
      outcome: "ok",
      error: null,
    });
    return { result, runId: null };
  } catch (err) {
    outcome = "error";
    error = (err instanceof Error ? err.message : String(err)).slice(0, 300);
    await appendRow({
      name,
      startedAt,
      durationMs: Date.now() - startedAt.getTime(),
      items: null,
      outcome,
      error,
    });
    throw err; // the cron's own error contract is unchanged — the ledger only observes
  }
}

/** Soft-fail row append — a broken ledger never breaks the cron. */
async function appendRow(row: CronRunRow): Promise<void> {
  try {
    await ensureCronRunTable();
    await db.cronRun.create({ data: row });
  } catch (err) {
    console.error(`[cron-ledger] write failed for ${row.name}:`, err);
  }
}

export interface CronRunStatus {
  name: string;
  schedule: string;
  description: string;
  lastRunAt: Date | null;
  lastOutcome: string | null;
  lastError: string | null;
  ageHours: number | null;
  /** true when no run in > CRON_LEDGER_MAX_AGE_H (or never run) */
  alarm: boolean;
}

/** Latest run per registered cron + the missed-cron alarm verdict. */
export async function cronRunStatuses(now: Date = new Date()): Promise<CronRunStatus[]> {
  const names = Object.keys(REGISTERED_CRONS) as CronName[];
  const latest = await db.cronRun.groupBy({
    by: ["name"],
    where: { name: { in: names } },
    _max: { startedAt: true },
  });
  const latestByName = new Map(latest.map((r) => [r.name, r._max.startedAt]));
  const statuses: CronRunStatus[] = [];
  for (const name of names) {
    const last = latestByName.get(name) ?? null;
    const ageHours = last ? Math.max(0, (now.getTime() - last.getTime()) / 3_600_000) : null;
    statuses.push({
      name,
      schedule: REGISTERED_CRONS[name].schedule,
      description: REGISTERED_CRONS[name].description,
      lastRunAt: last,
      ageHours: ageHours === null ? null : Math.round(ageHours * 10) / 10,
      alarm: ageHours === null || ageHours > CRON_LEDGER_MAX_AGE_H,
      lastOutcome: null,
      lastError: null,
    });
  }
  // outcomes for the latest runs (second query — bounded by 6 names)
  const recent = await db.cronRun.findMany({
    where: { name: { in: names } },
    orderBy: { startedAt: "desc" },
    take: 60,
  });
  for (const s of statuses) {
    const run = recent.find((r) => r.name === s.name);
    if (run) {
      s.lastOutcome = run.outcome;
      s.lastError = run.error;
    }
  }
  return statuses;
}

/** The one-line digest verdict. Empty = all registered crons are fresh. */
export function cronLedgerDigestLine(statuses: CronRunStatus[]): string {
  const alarming = statuses.filter((s) => s.alarm);
  if (alarming.length === 0) return "";
  return `CRONS: ${alarming.length}/${statuses.length} silent > ${CRON_LEDGER_MAX_AGE_H}h — ${alarming
    .map((s) => (s.lastRunAt ? `${s.name} (${Math.round(s.ageHours ?? 0)}h)` : `${s.name} (never)`))
    .join(", ")}`;
}

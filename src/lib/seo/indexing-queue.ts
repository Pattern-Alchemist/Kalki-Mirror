/* ═══════════════════════════════════════════════════════════════════════════
   KALKI — GSC indexing queue, OAuth-ready (Vol. 5 #12)
   ---------------------------------------------------------------------------
   GSC OAuth is a founder-gated carry-over. The moment the token lands,
   "which URLs need indexing attention" must be a PANEL, not a research
   project — this module removes the post-OAuth cliff:

     · The queue: IndexingRequest rows, one per sitemap URL, discovered by
       diffing the LIVE sitemap (allSitemapUrls — the sitemap module is the
       single source of truth, same seam IndexNow pings) against the rows
       already known. A URL never seen → PENDING/new. A known URL whose
       SITE_LASTMOD epoch advanced → PENDING/changed (the epoch is global,
       so a content change rolls the whole site — honest, and bounded by
       the runner's daily cap). A URL that left the map → REMOVED.
     · The runner: with GSC_ACCESS_TOKEN absent, it is an HONEST no-op
       (rows stay PENDING, the panel shows "oauth pending" — the carry-over
       keeps its founder-gated status). With the token present it submits
       urlNotifications:publish (type URL_UPDATED) up to the daily cap and
       records SUBMITTED / FAILED per URL. Nothing is fake: the no-op says
       noop, the lit path makes the real Google call.
     · DDL self-heals on the remote store (the CronRun pattern) so the
       first run after deploy creates the table without a migration drill.

   Pure halves (planIndexingDiff, credentialGate) are exported for vitest.
   ═══════════════════════════════════════════════════════════════════════════ */

import { db } from "@/lib/db";

// ─── Self-healing DDL (the CronRun pattern) ────────────────────────────────

const INDEXING_DDL = [
  `CREATE TABLE IF NOT EXISTS "IndexingRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'PENDING',
    "reason" TEXT NOT NULL DEFAULT 'new',
    "lastmodEpoch" TEXT,
    "submittedAt" DATETIME,
    "error" TEXT,
    "discoveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "IndexingRequest_url_key" ON "IndexingRequest"("url")`,
  `CREATE INDEX IF NOT EXISTS "IndexingRequest_state_idx" ON "IndexingRequest"("state")`,
];

let ensuredTable: Promise<void> | null = null;

async function ensureIndexingTable(): Promise<void> {
  if (!ensuredTable) {
    ensuredTable = (async () => {
      const url = process.env.TURSO_DATABASE_URL;
      const token = process.env.TURSO_AUTH_TOKEN;
      if (!url || !token || !/^(libsql|https):\/\//.test(url)) return;
      const { createClient } = await import("@libsql/client");
      const client = createClient({ url, authToken: token });
      for (const ddl of INDEXING_DDL) await client.execute(ddl);
    })();
  }
  await ensuredTable;
}

// ─── Pure diff planner ─────────────────────────────────────────────────────

export interface DiffKnown {
  url: string;
  state: string;
  lastmodEpoch: string | null;
}

export interface DiffPlan {
  /** never-seen URLs → insert as PENDING/new */
  inserts: Array<{ url: string; reason: "new" }>;
  /** known URLs whose epoch advanced (or that were REMOVED and returned) → flip to PENDING/changed */
  changes: Array<{ url: string; reason: "changed" }>;
  /** URLs present in the map no longer → mark REMOVED */
  removals: Array<{ url: string }>;
  /** known, active, up-to-date URLs → untouched */
  unchanged: number;
}

export function planIndexingDiff(
  current: ReadonlyArray<{ url: string; epoch: string }>,
  known: readonly DiffKnown[],
): DiffPlan {
  const knownByUrl = new Map(known.map((k) => [k.url, k]));
  const currentByUrl = new Map(current.map((c) => [c.url, c.epoch]));
  const plan: DiffPlan = { inserts: [], changes: [], removals: [], unchanged: 0 };
  for (const { url, epoch } of current) {
    const k = knownByUrl.get(url);
    if (!k) {
      plan.inserts.push({ url, reason: "new" });
    } else if (k.state === "REMOVED") {
      // returned to the map — re-queue
      plan.changes.push({ url, reason: "changed" });
    } else if (k.lastmodEpoch !== epoch) {
      plan.changes.push({ url, reason: "changed" });
    } else {
      plan.unchanged += 1;
    }
  }
  for (const k of known) {
    if (k.state !== "REMOVED" && !currentByUrl.has(k.url)) {
      plan.removals.push({ url: k.url });
    }
  }
  return plan;
}

// ─── Credential gate (pure) ────────────────────────────────────────────────

export interface CredentialGate {
  mode: "live" | "noop";
  reason: string;
}

/** The OAuth-ready seam: GSC_ACCESS_TOKEN present → live; absent → honest noop. */
export function credentialGate(
  env: { GSC_ACCESS_TOKEN?: string | null | undefined } | Record<string, string | undefined>,
): CredentialGate {
  const raw = (env as Record<string, string | null | undefined>).GSC_ACCESS_TOKEN;
  const token = typeof raw === "string" ? raw.trim() : "";
  if (!token) {
    return { mode: "noop", reason: "oauth_pending — set GSC_ACCESS_TOKEN to light the runner" };
  }
  return { mode: "live", reason: "GSC_ACCESS_TOKEN present" };
}

// ─── Submission (the lit path) ─────────────────────────────────────────────

const GSC_PUBLISH_URL = "https://indexing.googleapis.com/v3/urlNotifications:publish";
/** URL Inspection API quota is 2k/day; stay an order of magnitude under it. */
export const INDEXING_DAILY_CAP = 100;

export interface SubmissionOutcome {
  ok: boolean;
  error?: string;
}

async function submitToGsc(
  url: string,
  token: string,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmissionOutcome> {
  try {
    const res = await fetchImpl(GSC_PUBLISH_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, type: "URL_UPDATED" }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return { ok: true };
    const body = await res.text().catch(() => "");
    return { ok: false, error: `HTTP ${res.status}: ${body.slice(0, 120)}` };
  } catch (err) {
    return { ok: false, error: (err instanceof Error ? err.message : String(err)).slice(0, 160) };
  }
}

// ─── The runner ────────────────────────────────────────────────────────────

export interface SyncResult {
  mode: "live" | "noop";
  gateReason: string;
  discovered: number;
  inserted: number;
  changed: number;
  removed: number;
  unchanged: number;
  submitted: number;
  failed: number;
  failedSamples: Array<{ url: string; error: string }>;
}

/** Diff the live sitemap against the queue and apply the plan. */
export async function syncIndexingQueue(): Promise<{
  inserted: number;
  changed: number;
  removed: number;
  unchanged: number;
  discovered: number;
}> {
  await ensureIndexingTable();
  const [{ SITE_LASTMOD }, { allSitemapUrls }] = await Promise.all([
    import("@/lib/canonical"),
    import("@/lib/seo/indexnow"),
  ]);
  const epoch = SITE_LASTMOD;
  const urls = await allSitemapUrls();
  const current = urls.map((url) => ({ url, epoch }));
  const known = await db.indexingRequest.findMany({
    select: { url: true, state: true, lastmodEpoch: true },
  });
  const plan = planIndexingDiff(current, known);

  for (const { url, reason } of plan.inserts) {
    await db.indexingRequest.create({ data: { url, state: "PENDING", reason, lastmodEpoch: epoch } });
  }
  for (const { url, reason } of plan.changes) {
    await db.indexingRequest.update({
      where: { url },
      data: { state: "PENDING", reason, lastmodEpoch: epoch, error: null },
    });
  }
  for (const { url } of plan.removals) {
    await db.indexingRequest.updateMany({ where: { url }, data: { state: "REMOVED" } });
  }
  return {
    inserted: plan.inserts.length,
    changed: plan.changes.length,
    removed: plan.removals.length,
    unchanged: plan.unchanged,
    discovered: urls.length,
  };
}

/**
 * Submit PENDING rows to GSC (live mode) or report the honest no-op.
 * `cap` bounds the daily submission (URL Inspection quota is 2k/day;
 * INDEXING_DAILY_CAP stays an order of magnitude under it).
 */
export async function runIndexingSubmission(
  opts: { cap?: number; env?: { GSC_ACCESS_TOKEN?: string | null }; fetchImpl?: typeof fetch } = {},
): Promise<SyncResult> {
  const cap = opts.cap ?? INDEXING_DAILY_CAP;
  const gate = credentialGate(opts.env ?? process.env);

  const sync = await syncIndexingQueue();

  const base: SyncResult = {
    mode: gate.mode,
    gateReason: gate.reason,
    ...sync,
    submitted: 0,
    failed: 0,
    failedSamples: [],
  };
  if (gate.mode === "noop") return base;

  const envRecord = (opts.env ?? process.env) as Record<string, string | null | undefined>;
  const token = String(envRecord.GSC_ACCESS_TOKEN).trim();
  const pending = await db.indexingRequest.findMany({
    where: { state: "PENDING" },
    orderBy: { discoveredAt: "asc" },
    take: cap,
    select: { url: true },
  });
  for (const { url } of pending) {
    const outcome = await submitToGsc(url, token, opts.fetchImpl);
    if (outcome.ok) {
      await db.indexingRequest.update({
        where: { url },
        data: { state: "SUBMITTED", submittedAt: new Date(), error: null },
      });
      base.submitted += 1;
    } else {
      await db.indexingRequest.update({
        where: { url },
        data: { state: "FAILED", error: outcome.error?.slice(0, 200) },
      });
      base.failed += 1;
      if (base.failedSamples.length < 5) base.failedSamples.push({ url, error: outcome.error ?? "?" });
    }
  }
  return base;
}

// ─── War-room read model ───────────────────────────────────────────────────

export interface IndexingPanel {
  available: boolean;
  oauthPending: boolean;
  counts: { pending: number; submitted: number; failed: number; removed: number };
  /** oldest-first pending tail — the attention list */
  pendingSample: Array<{ url: string; reason: string; discoveredAt: string }>;
}

export async function readIndexingPanel(): Promise<IndexingPanel> {
  const gate = credentialGate(process.env);
  const [pending, submitted, failed, removed] = await Promise.all([
    db.indexingRequest.count({ where: { state: "PENDING" } }),
    db.indexingRequest.count({ where: { state: "SUBMITTED" } }),
    db.indexingRequest.count({ where: { state: "FAILED" } }),
    db.indexingRequest.count({ where: { state: "REMOVED" } }),
  ]);
  const sample = await db.indexingRequest.findMany({
    where: { state: "PENDING" },
    orderBy: { discoveredAt: "asc" },
    take: 5,
    select: { url: true, reason: true, discoveredAt: true },
  });
  return {
    available: true,
    oauthPending: gate.mode === "noop",
    counts: { pending, submitted, failed, removed },
    pendingSample: sample.map((r) => ({
      url: r.url,
      reason: r.reason,
      discoveredAt: r.discoveredAt.toISOString(),
    })),
  };
}

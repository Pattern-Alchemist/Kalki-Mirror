/* ═════════════════════════════════════════════════════════════
   CREDENTIAL ROTATION AUDIT — Vol. 5 #2
   -------------------------------------------------------------
   The founder-vault incident (2026-09-08): the vaulted Turso
   token failed auth byte-exact — rotated server-side — while
   production ran happy on Vercel's copy. A vault credential is
   a hope until pinged. This module pings the SERVER's own
   credentials against each provider's cheapest verify endpoint
   and records last-verified-at + verdict per credential.

   Probed (server env only — never vault copies):
     · Turso       → POST /v2/pipeline  SELECT 1
     · OpenRouter  → GET  /api/v1/auth/key
     · Resend      → GET  /domains
     · Cloudinary  → GET  /v1_1/<cloud>/ping

   Pure and injectable: every probe takes a fetcher so vitest
   runs the verdict matrix without network access. Never throws.
   ═════════════════════════════════════════════════════════════ */

export const CRED_AUDIT_OPS_KEY = "cred_audit";

/** A credential unverified for longer than this is an alert, not an asset. */
export const CRED_AUDIT_MAX_AGE_H = 24 * 30; // 30 days

export type CredProvider = "turso" | "openrouter" | "resend" | "cloudinary";

export interface CredVerdict {
  provider: CredProvider;
  ok: boolean;
  latencyMs: number;
  /** unconfigured | http_error | probe_error | ok | auth_rejected */
  reason: "ok" | "unconfigured" | "auth_rejected" | "http_error" | "probe_error";
  status?: number;
  detail?: string;
}

export interface CredAuditReport {
  checkedAt: string;
  credentials: CredVerdict[];
  summary: { total: number; ok: number; fail: number };
}

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

function timeoutSignal(ms: number): AbortSignal | undefined {
  try {
    return AbortSignal.timeout(ms);
  } catch {
    return undefined;
  }
}

async function runProbe(
  provider: CredProvider,
  fn: () => Promise<CredVerdict>
): Promise<CredVerdict> {
  const started = Date.now();
  try {
    const v = await fn();
    return { ...v, latencyMs: v.latencyMs || Date.now() - started };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTimeout = msg.includes("timeout") || msg.includes("Timeout") || msg.includes("abort");
    return { provider, ok: false, latencyMs: Date.now() - started, reason: "probe_error", detail: msg.slice(0, 120) };
  }
}

/** libsql://host/db → https://host (the Turso HTTP pipeline endpoint). */
export function tursoHttpBase(url: string | undefined): string | null {
  if (!url) return null;
  const m = /^libsql:\/\/([^/?#]+)/.exec(url.trim());
  return m ? `https://${m[1]}` : null;
}

export function probeTurso(opts: { url?: string; token?: string; fetchImpl?: FetchLike } = {}): Promise<CredVerdict> {
  return runProbe("turso", async () => {
    const url = opts.url ?? process.env.TURSO_DATABASE_URL;
    const token = opts.token ?? process.env.TURSO_AUTH_TOKEN;
    const base = tursoHttpBase(url);
    if (!base || !token) {
      return { provider: "turso" as const, ok: false, latencyMs: 0, reason: "unconfigured" as const, detail: "TURSO_DATABASE_URL/TURSO_AUTH_TOKEN missing" };
    }
    const doFetch = opts.fetchImpl ?? fetch;
    const res = await doFetch(`${base}/v2/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ requests: [{ type: "execute", stmt: { sql: "SELECT 1" } }] }),
      signal: timeoutSignal(10_000),
    } as RequestInit);
    if (res.status === 401) {
      return { provider: "turso" as const, ok: false, latencyMs: 0, reason: "auth_rejected" as const, status: 401, detail: "token rejected — rotated server-side?" };
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { provider: "turso" as const, ok: false, latencyMs: 0, reason: "http_error" as const, status: res.status, detail: body.slice(0, 100) };
    }
    const data = (await res.json().catch(() => null)) as { results?: unknown[] } | null;
    if (!data?.results || !Array.isArray(data.results)) {
      return { provider: "turso" as const, ok: false, latencyMs: 0, reason: "http_error" as const, status: res.status, detail: "malformed pipeline response" };
    }
    return { provider: "turso" as const, ok: true, latencyMs: 0, reason: "ok" as const, status: res.status };
  });
}

export function probeOpenRouter(opts: { apiKey?: string; fetchImpl?: FetchLike } = {}): Promise<CredVerdict> {
  return runProbe("openrouter", async () => {
    const key = opts.apiKey ?? process.env.OPENROUTER_API_KEY;
    if (!key) {
      return { provider: "openrouter" as const, ok: false, latencyMs: 0, reason: "unconfigured" as const, detail: "OPENROUTER_API_KEY missing" };
    }
    const doFetch = opts.fetchImpl ?? fetch;
    const res = await doFetch("https://openrouter.ai/api/v1/auth/key", {
      headers: { Authorization: `Bearer ${key}` },
      signal: timeoutSignal(10_000),
    } as RequestInit);
    if (res.status === 401) {
      return { provider: "openrouter" as const, ok: false, latencyMs: 0, reason: "auth_rejected" as const, status: 401, detail: "key rejected" };
    }
    if (!res.ok) {
      return { provider: "openrouter" as const, ok: false, latencyMs: 0, reason: "http_error" as const, status: res.status, detail: `HTTP ${res.status}` };
    }
    return { provider: "openrouter" as const, ok: true, latencyMs: 0, reason: "ok" as const, status: res.status };
  });
}

export function probeResend(opts: { apiKey?: string; fetchImpl?: FetchLike } = {}): Promise<CredVerdict> {
  return runProbe("resend", async () => {
    const key = opts.apiKey ?? process.env.RESEND_API_KEY;
    if (!key) {
      return { provider: "resend" as const, ok: false, latencyMs: 0, reason: "unconfigured" as const, detail: "RESEND_API_KEY missing" };
    }
    const doFetch = opts.fetchImpl ?? fetch;
    const res = await doFetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${key}` },
      signal: timeoutSignal(10_000),
    } as RequestInit);
    if (res.status === 401 || res.status === 403) {
      return { provider: "resend" as const, ok: false, latencyMs: 0, reason: "auth_rejected" as const, status: res.status, detail: "key rejected" };
    }
    if (!res.ok) {
      return { provider: "resend" as const, ok: false, latencyMs: 0, reason: "http_error" as const, status: res.status, detail: `HTTP ${res.status}` };
    }
    return { provider: "resend" as const, ok: true, latencyMs: 0, reason: "ok" as const, status: res.status };
  });
}

export function probeCloudinary(opts: { cloudName?: string; apiKey?: string; apiSecret?: string; fetchImpl?: FetchLike } = {}): Promise<CredVerdict> {
  return runProbe("cloudinary", async () => {
    const cloud = opts.cloudName ?? process.env.CLOUDINARY_CLOUD_NAME;
    const key = opts.apiKey ?? process.env.CLOUDINARY_API_KEY;
    const secret = opts.apiSecret ?? process.env.CLOUDINARY_API_SECRET;
    if (!cloud || !key || !secret) {
      return { provider: "cloudinary" as const, ok: false, latencyMs: 0, reason: "unconfigured" as const, detail: "CLOUDINARY_* missing" };
    }
    const doFetch = opts.fetchImpl ?? fetch;
    const auth = Buffer.from(`${key}:${secret}`).toString("base64");
    const res = await doFetch(`https://api.cloudinary.com/v1_1/${cloud}/ping`, {
      headers: { Authorization: `Basic ${auth}` },
      signal: timeoutSignal(10_000),
    } as RequestInit);
    if (res.status === 401) {
      return { provider: "cloudinary" as const, ok: false, latencyMs: 0, reason: "auth_rejected" as const, status: 401, detail: "key/secret rejected" };
    }
    if (!res.ok) {
      return { provider: "cloudinary" as const, ok: false, latencyMs: 0, reason: "http_error" as const, status: res.status, detail: `HTTP ${res.status}` };
    }
    return { provider: "cloudinary" as const, ok: true, latencyMs: 0, reason: "ok" as const, status: res.status };
  });
}

/** Probe all four provider credentials (server env), in parallel. */
export async function auditCredentials(opts: { fetchImpl?: FetchLike } = {}): Promise<CredAuditReport> {
  const credentials = await Promise.all([
    probeTurso({ fetchImpl: opts.fetchImpl }),
    probeOpenRouter({ fetchImpl: opts.fetchImpl }),
    probeResend({ fetchImpl: opts.fetchImpl }),
    probeCloudinary({ fetchImpl: opts.fetchImpl }),
  ]);
  const ok = credentials.filter((c) => c.ok).length;
  return {
    checkedAt: new Date().toISOString(),
    credentials,
    summary: { total: credentials.length, ok, fail: credentials.length - ok },
  };
}

/* ── OpsState interop ──────────────────────────────────────────────────── */

export function parseStoredCredAudit(raw: string | null | undefined): CredAuditReport | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as CredAuditReport;
    if (!obj || typeof obj !== "object" || !Array.isArray(obj.credentials) || !obj.summary) return null;
    return obj;
  } catch {
    return null;
  }
}

export function credAuditAgeHours(report: CredAuditReport | null, now: Date = new Date()): number {
  if (!report || typeof report.checkedAt !== "string") return Infinity;
  const t = Date.parse(report.checkedAt);
  if (Number.isNaN(t)) return Infinity;
  return Math.max(0, (now.getTime() - t) / 3_600_000);
}

/** Empty string = healthy + fresh. Anything else is an alert line. */
export function credAuditDigestLine(report: CredAuditReport | null, now: Date = new Date()): string {
  if (!report) return "CREDENTIALS: never audited — run /api/cron/cred-audit";
  const age = credAuditAgeHours(report, now);
  if (age > CRED_AUDIT_MAX_AGE_H) {
    return `CREDENTIALS: last audit ${Math.round(age)}h ago (> ${CRED_AUDIT_MAX_AGE_H}h) — audit cron may be dead`;
  }
  const dead = report.credentials.filter((c) => !c.ok);
  if (dead.length > 0) {
    return `CREDENTIALS: ${dead.length}/${report.summary.total} failing — ${dead
      .map((d) => `${d.provider}(${d.reason})`)
      .join(", ")}`;
  }
  return "";
}

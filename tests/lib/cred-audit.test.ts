import { describe, it, expect } from "vitest";
import {
  tursoHttpBase,
  probeTurso,
  probeOpenRouter,
  probeResend,
  probeCloudinary,
  auditCredentials,
  parseStoredCredAudit,
  credAuditAgeHours,
  credAuditDigestLine,
  CRED_AUDIT_MAX_AGE_H,
  type FetchLike,
} from "@/lib/ops/cred-audit";

/* ══════════════════════════════════════════════════════════════
   Vol. 5 #2 — credential rotation audit.
   The 2026-09-08 incident: the founder-vault Turso token was
   rotated server-side and NOBODY noticed until a manual probe.
   These tests pin the verdict matrix for every provider probe —
   200, auth-rejected, unconfigured, malformed, thrown — with
   zero network.
   ══════════════════════════════════════════════════════════════ */

function fakeFetch(status: number, body: unknown, latencyMs = 3): FetchLike {
  return async () => {
    await new Promise((r) => setTimeout(r, latencyMs));
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => JSON.stringify(body),
      json: async () => body,
    } as unknown as Response;
  };
}

describe("tursoHttpBase", () => {
  it("converts libsql:// to the https pipeline endpoint", () => {
    expect(tursoHttpBase("libsql://kalki-mirror-foo.turso.io/db")).toBe("https://kalki-mirror-foo.turso.io");
  });
  it("returns null for missing or non-libsql URLs", () => {
    expect(tursoHttpBase(undefined)).toBeNull();
    expect(tursoHttpBase("postgres://x")).toBeNull();
  });
});

describe("probeTurso (verdict matrix)", () => {
  it("200 pipeline response → ok", async () => {
    const v = await probeTurso({
      url: "libsql://db.turso.io/x",
      token: "tok",
      fetchImpl: fakeFetch(200, { results: [{ type: "ok" }] }),
    });
    expect(v).toMatchObject({ provider: "turso", ok: true, reason: "ok" });
  });

  it("401 → auth_rejected with the rotation hint (the founder-vault incident)", async () => {
    const v = await probeTurso({ url: "libsql://db.turso.io/x", token: "tok", fetchImpl: fakeFetch(401, { error: "Unauthorized" }) });
    expect(v).toMatchObject({ provider: "turso", ok: false, reason: "auth_rejected", status: 401 });
    expect(v.detail).toContain("rotated");
  });

  it("missing url or token → unconfigured", async () => {
    const v = await probeTurso({ url: undefined, token: undefined, fetchImpl: fakeFetch(200, {}) });
    expect(v).toMatchObject({ provider: "turso", ok: false, reason: "unconfigured" });
  });

  it("200 but malformed body → http_error, never a throw", async () => {
    const v = await probeTurso({ url: "libsql://db.turso.io/x", token: "tok", fetchImpl: fakeFetch(200, { nope: true }) });
    expect(v).toMatchObject({ provider: "turso", ok: false, reason: "http_error" });
  });
});

describe("probeOpenRouter / probeResend / probeCloudinary", () => {
  it("openrouter: 200 → ok; 401 → auth_rejected", async () => {
    expect(await probeOpenRouter({ apiKey: "k", fetchImpl: fakeFetch(200, { data: {} }) })).toMatchObject({ ok: true, reason: "ok" });
    expect(await probeOpenRouter({ apiKey: "k", fetchImpl: fakeFetch(401, {}) })).toMatchObject({ ok: false, reason: "auth_rejected" });
    expect(await probeOpenRouter({ fetchImpl: fakeFetch(200, {}) })).toMatchObject({ ok: false, reason: "unconfigured" });
  });

  it("resend: 200 → ok; 401/403 → auth_rejected", async () => {
    expect(await probeResend({ apiKey: "k", fetchImpl: fakeFetch(200, { data: [] }) })).toMatchObject({ ok: true, reason: "ok" });
    expect(await probeResend({ apiKey: "k", fetchImpl: fakeFetch(403, {}) })).toMatchObject({ ok: false, reason: "auth_rejected" });
    expect(await probeResend({ fetchImpl: fakeFetch(200, {}) })).toMatchObject({ ok: false, reason: "unconfigured" });
  });

  it("cloudinary: 200 ping → ok; 401 → auth_rejected; missing env → unconfigured", async () => {
    expect(await probeCloudinary({ cloudName: "c", apiKey: "k", apiSecret: "s", fetchImpl: fakeFetch(200, { status: "ok" }) })).toMatchObject({ ok: true, reason: "ok" });
    expect(await probeCloudinary({ cloudName: "c", apiKey: "k", apiSecret: "s", fetchImpl: fakeFetch(401, {}) })).toMatchObject({ ok: false, reason: "auth_rejected" });
    expect(await probeCloudinary({ cloudName: "c", fetchImpl: fakeFetch(200, {}) })).toMatchObject({ ok: false, reason: "unconfigured" });
  });

  it("network throw → probe_error verdict, never a throw", async () => {
    const v = await probeResend({ apiKey: "k", fetchImpl: (async () => { throw new Error("connection refused"); }) as unknown as FetchLike });
    expect(v).toMatchObject({ ok: false, reason: "probe_error" });
  });
});

describe("auditCredentials (aggregation)", () => {
  const SAVED: Record<string, string | undefined> = {};
  const KEYS = ["TURSO_DATABASE_URL", "TURSO_AUTH_TOKEN", "OPENROUTER_API_KEY", "RESEND_API_KEY", "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];

  function withTestEnv(): void {
    for (const k of KEYS) {
      SAVED[k] = process.env[k];
      delete process.env[k];
    }
    process.env.TURSO_DATABASE_URL = "libsql://db.turso.io/x";
    process.env.TURSO_AUTH_TOKEN = "tok";
    process.env.OPENROUTER_API_KEY = "sk-or-test";
    process.env.RESEND_API_KEY = "re_test";
    process.env.CLOUDINARY_CLOUD_NAME = "cloud";
    process.env.CLOUDINARY_API_KEY = "k";
    process.env.CLOUDINARY_API_SECRET = "s";
  }

  function restoreEnv(): void {
    for (const k of KEYS) {
      if (SAVED[k] === undefined) delete process.env[k];
      else process.env[k] = SAVED[k];
    }
  }

  it("probes all four providers and aggregates ok/fail", async () => {
    withTestEnv();
    try {
      const report = await auditCredentials({
        fetchImpl: (url) => {
          const u = String(url);
          if (u.includes("turso.io")) return fakeFetch(200, { results: [] })();
          if (u.includes("openrouter")) return fakeFetch(200, { data: {} })();
          if (u.includes("resend")) return fakeFetch(401, {})();
          return fakeFetch(200, { status: "ok" })();
        },
      });
      expect(report.credentials).toHaveLength(4);
      expect(report.summary).toEqual({ total: 4, ok: 3, fail: 1 });
      expect(report.credentials.find((c) => c.provider === "resend")?.ok).toBe(false);
    } finally {
      restoreEnv();
    }
  });
});

describe("OpsState round trip (store → parse → digest line)", () => {
  const good = {
    checkedAt: new Date().toISOString(),
    credentials: [
      { provider: "turso", ok: true, latencyMs: 40, reason: "ok", status: 200 },
      { provider: "resend", ok: false, latencyMs: 60, reason: "auth_rejected", status: 401, detail: "key rejected" },
    ],
    summary: { total: 2, ok: 1, fail: 1 },
  };

  it("parse round-trips and rejects corrupt values", () => {
    expect(parseStoredCredAudit(JSON.stringify(good))).toEqual(good);
    expect(parseStoredCredAudit(null)).toBeNull();
    expect(parseStoredCredAudit("nope")).toBeNull();
    expect(parseStoredCredAudit('{"credentials":5}')).toBeNull();
  });

  it("all ok + fresh → digest stays quiet", () => {
    const allOk = { ...good, credentials: [good.credentials[0]], summary: { total: 1, ok: 1, fail: 0 } };
    expect(credAuditDigestLine(allOk)).toBe("");
  });

  it("any failing credential → alert names provider + reason", () => {
    const line = credAuditDigestLine(good);
    expect(line).toContain("1/2");
    expect(line).toContain("resend(auth_rejected)");
  });

  it("stale audit (> 30d) → alert even when green", () => {
    const stale = { ...good, checkedAt: new Date(Date.now() - (CRED_AUDIT_MAX_AGE_H + 5) * 3_600_000).toISOString() };
    expect(credAuditDigestLine(stale)).toContain("audit cron may be dead");
  });

  it("never audited → prompt to run the cron", () => {
    expect(credAuditDigestLine(null)).toContain("never audited");
    expect(credAuditAgeHours(null)).toBe(Infinity);
  });
});

describe("parseCloudinaryUrl + compound-url probe (production env shape)", () => {
  it("parses the compound cloudinary:// credential", async () => {
    const { parseCloudinaryUrl } = await import("@/lib/ops/cred-audit");
    expect(parseCloudinaryUrl("cloudinary://588419685486859:-tMNFptmkXUtCk@b9oo5abp")).toEqual({
      key: "588419685486859",
      secret: "-tMNFptmkXUtCk",
      cloud: "b9oo5abp",
    });
    expect(parseCloudinaryUrl(undefined)).toBeNull();
    expect(parseCloudinaryUrl("not-a-url")).toBeNull();
  });

  it("probeCloudinary falls back to CLOUDINARY_URL when discrete vars are absent", async () => {
    const saved = process.env.CLOUDINARY_URL;
    const savedK = [process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET];
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;
    process.env.CLOUDINARY_URL = "cloudinary://k@s:test@mycloud";
    try {
      const v = await probeCloudinary({ fetchImpl: fakeFetch(200, { status: "ok" }) });
      expect(v).toMatchObject({ provider: "cloudinary", ok: true, reason: "ok" });
    } finally {
      if (saved === undefined) delete process.env.CLOUDINARY_URL;
      else process.env.CLOUDINARY_URL = saved;
      const names = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
      savedK.forEach((val, i) => {
        if (val === undefined) delete process.env[names[i]];
        else process.env[names[i]] = val;
      });
    }
  });
});

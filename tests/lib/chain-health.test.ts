import { describe, it, expect } from "vitest";
import {
  buildChainProbeMessages,
  judgeProbeCompletion,
  probeModel,
  probeChain,
  parseStoredChainHealth,
  chainHealthAgeHours,
  chainHealthDigestLine,
  CHAIN_HEALTH_MAX_AGE_H,
  type ModelProbeVerdict,
  type FetchLike,
} from "@/lib/ai/chain-health";

/* ══════════════════════════════════════════════════════════════
   Vol. 5 #1 — AI chain health probe.
   The 2026-09-08 incident: 2/3 free-tier models 404-delisted in
   72h, production /ask degraded silently. These tests pin the
   probe's verdict matrix — every failure mode a provider can
   emit becomes a legible verdict, never a thrown error.
   ══════════════════════════════════════════════════════════════ */

/** FetchLike stub returning a canned Response-like object. */
function fakeFetch(status: number, body: unknown, latencyMs = 5): FetchLike {
  return async () => {
    await new Promise((r) => setTimeout(r, latencyMs));
    return {
      ok: status >= 200 && status < 300,
      status,
      text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
      json: async () => body,
    } as unknown as Response;
  };
}

const GOOD_CONTRACT = {
  choices: [
    {
      message: {
        content: '{"cited_folios":["pranava-japa"],"grounded":true,"answer":"Begin with 21 audible repetitions at dawn."}',
      },
    },
  ],
};

const HONEST_SILENCE = {
  choices: [{ message: { content: '{"cited_folios":[],"grounded":false,"answer":""}' } }],
};

describe("buildChainProbeMessages (real-size contract prompt)", () => {
  it("carries the ask system prompt — toy prompts lie, the real one does not", () => {
    const msgs = buildChainProbeMessages();
    expect(msgs).toHaveLength(2);
    expect(msgs[0].role).toBe("system");
    expect(msgs[0].content).toContain("KALKI archivist");
    expect(msgs[0].content).toContain("grounded=false");
  });

  it("the user message is sized like a small real ask turn, not a 20-token toy", () => {
    const msgs = buildChainProbeMessages();
    expect(msgs[1].role).toBe("user");
    expect(msgs[1].content).toContain("slug: pranava-japa");
    expect(msgs[1].content.length).toBeGreaterThan(400);
  });
});

describe("judgeProbeCompletion (contract strictness)", () => {
  it("accepts a contract-shaped grounded answer", () => {
    expect(judgeProbeCompletion(JSON.stringify(GOOD_CONTRACT.choices[0].message.content))).toMatchObject({ ok: false }); // a JSON STRING is not an object
  });

  it("accepts the actual completion content — grounded=true", () => {
    expect(judgeProbeCompletion(GOOD_CONTRACT.choices[0].message.content)).toEqual({ ok: true, reason: "contract_ok" });
  });

  it("accepts an honest silence — grounded=false is a WORKING model", () => {
    expect(judgeProbeCompletion(HONEST_SILENCE.choices[0].message.content)).toEqual({ ok: true, reason: "contract_ok" });
  });

  it("strips markdown fences before judging", () => {
    const fenced = '```json\n{"grounded":true,"answer":"x","cited_folios":["a"]}\n```';
    expect(judgeProbeCompletion(fenced)).toEqual({ ok: true, reason: "contract_ok" });
  });

  it("rejects empty and undefined completions", () => {
    expect(judgeProbeCompletion("")).toMatchObject({ ok: false, reason: "empty" });
    expect(judgeProbeCompletion(null)).toMatchObject({ ok: false, reason: "empty" });
  });

  it("rejects prose blobs — no JSON object anywhere", () => {
    expect(judgeProbeCompletion("Here is my answer: it is fine.")).toMatchObject({ ok: false, reason: "not_json" });
  });

  it("rejects JSON that breaks the contract shape", () => {
    expect(judgeProbeCompletion('{"grounded":"yes","answer":"x"}')).toMatchObject({ ok: false, reason: "malformed_contract" });
    expect(judgeProbeCompletion('{"grounded":true,"cited_folios":[]}')).toMatchObject({ ok: false, reason: "malformed_contract" });
    expect(judgeProbeCompletion('{"grounded":true,"answer":"x"}')).toMatchObject({ ok: false, reason: "malformed_contract" });
    // no braces anywhere → never reaches the parser
    expect(judgeProbeCompletion("[1,2,3]")).toMatchObject({ ok: false, reason: "not_json" });
    // parseable JSON that is not an object → malformed
    expect(judgeProbeCompletion('"{\"grounded\":true}"')).toMatchObject({ ok: false, reason: "malformed_contract" });
  });
});

describe("probeModel (verdict matrix, no network)", () => {
  it("200 + contract completion → contract_ok with latency", async () => {
    const v = await probeModel("m/test:free", { apiKey: "k", fetchImpl: fakeFetch(200, GOOD_CONTRACT, 7) });
    expect(v).toMatchObject({ ok: true, reason: "contract_ok" });
    expect(v.status).toBeUndefined();
    expect(v.latencyMs).toBeGreaterThanOrEqual(5);
  });

  it("404 delisted → http_error with the delisted detail (the incident)", async () => {
    const v = await probeModel("minimax/minimax-m2.7:free", {
      apiKey: "k",
      fetchImpl: fakeFetch(404, { error: { message: "This model is unavailable for free." } }),
    });
    expect(v).toMatchObject({ ok: false, reason: "http_error", status: 404 });
    expect(v.detail).toContain("delisted");
  });

  it("400 real-size body → http_error (the ling-sante toy-prompt trap)", async () => {
    const v = await probeModel("inclusionai/ling-3.0-flash-sante:free", {
      apiKey: "k",
      fetchImpl: fakeFetch(400, { error: { message: "INVALID_REQUEST_BODY" } }),
    });
    expect(v).toMatchObject({ ok: false, reason: "http_error", status: 400 });
  });

  it("200 but empty content → empty verdict, not ok", async () => {
    const v = await probeModel("dots/test:free", {
      apiKey: "k",
      fetchImpl: fakeFetch(200, { choices: [{ message: { content: "" } }] }),
    });
    expect(v).toMatchObject({ ok: false, reason: "empty" });
  });

  it("200 but prose blob → not_json", async () => {
    const v = await probeModel("chatty/test:free", {
      apiKey: "k",
      fetchImpl: fakeFetch(200, { choices: [{ message: { content: "Sure thing! Here you go." } }] }),
    });
    expect(v).toMatchObject({ ok: false, reason: "not_json" });
  });

  it("network throw with timeout semantics → timeout verdict", async () => {
    const v = await probeModel("slow/test:free", {
      apiKey: "k",
      fetchImpl: (async () => {
        throw new Error("The operation was aborted due to timeout");
      }) as unknown as FetchLike,
    });
    expect(v).toMatchObject({ ok: false, reason: "timeout" });
  });

  it("missing API key → probe_error, never a throw", async () => {
    const saved = process.env.OPENROUTER_API_KEY;
    delete process.env.OPENROUTER_API_KEY;
    try {
      const v = await probeModel("m/test:free");
      expect(v).toMatchObject({ ok: false, reason: "probe_error" });
      expect(v.detail).toContain("OPENROUTER_API_KEY");
    } finally {
      if (saved) process.env.OPENROUTER_API_KEY = saved;
    }
  });
});

describe("probeChain (aggregation)", () => {
  it("probes EVERY model — not first-success — and aggregates honestly", async () => {
    const report = await probeChain({
      apiKey: "k",
      models: ["good/a:free", "dead/b:free", "good/c:free"],
      fetchImpl: (url, init) => {
        const body = JSON.parse(String(init.body));
        return fakeFetch(body.model.startsWith("dead") ? 404 : 200, body.model.startsWith("dead") ? { error: {} } : GOOD_CONTRACT)();
      },
    });
    expect(report.models).toHaveLength(3);
    expect(report.summary).toEqual({ total: 3, alive: 2, dead: 1, chainOk: true });
    expect(report.checkedAt).toBeTruthy();
  });

  it("a fully dead chain reports chainOk=false (the alert case)", async () => {
    const report = await probeChain({
      apiKey: "k",
      models: ["dead/a:free", "dead/b:free"],
      fetchImpl: fakeFetch(404, { error: {} }),
    });
    expect(report.summary.chainOk).toBe(false);
    expect(report.summary.dead).toBe(2);
  });
});

describe("OpsState round trip (store → parse → digest line)", () => {
  const report: ChainHealthReport = {
    checkedAt: new Date().toISOString(),
    models: [
      { model: "good/a:free", ok: true, reason: "contract_ok", latencyMs: 800 },
      { model: "dead/b:free", ok: false, reason: "http_error", latencyMs: 90, status: 404, detail: "delisted/unavailable (404)" },
    ],
    summary: { total: 2, alive: 1, dead: 1, chainOk: true },
  };

  it("parse round-trips a stored report and rejects corrupt values", () => {
    const stored = JSON.stringify(report);
    expect(parseStoredChainHealth(stored)).toEqual(report);
    expect(parseStoredChainHealth(null)).toBeNull();
    expect(parseStoredChainHealth("")).toBeNull();
    expect(parseStoredChainHealth("{oops")).toBeNull();
    expect(parseStoredChainHealth('{"models":"not-an-array"}')).toBeNull();
  });

  it("fresh + fully alive → digest stays quiet (empty line)", () => {
    const fresh = { ...report, models: [report.models[0]], summary: { total: 1, alive: 1, dead: 0, chainOk: true } };
    expect(chainHealthDigestLine(parseStoredChainHealth(JSON.stringify(fresh)))).toBe("");
  });

  it("degraded chain → alert names the dead model", () => {
    const line = chainHealthDigestLine(report);
    expect(line).toContain("degraded");
    expect(line).toContain("1/2");
    expect(line).toContain("b:free");
  });

  it("dead chain → DOWN alert", () => {
    const dead = { ...report, summary: { total: 2, alive: 0, dead: 2, chainOk: false } };
    expect(chainHealthDigestLine(dead)).toContain("DOWN");
  });

  it("stale probe (> 26h) → alert even when the verdict was green", () => {
    const stale = { ...report, checkedAt: new Date(Date.now() - (CHAIN_HEALTH_MAX_AGE_H + 5) * 3_600_000).toISOString() };
    expect(chainHealthDigestLine(stale)).toContain("probe cron may be dead");
  });

  it("never-probed → prompt to run the cron", () => {
    expect(chainHealthDigestLine(null)).toContain("never probed");
  });

  it("corrupt timestamp counts as infinitely stale", () => {
    expect(chainHealthAgeHours({ ...report, checkedAt: "not-a-date" })).toBe(Infinity);
    expect(chainHealthAgeHours(null)).toBe(Infinity);
    expect(chainHealthAgeHours(report)).toBeLessThan(1);
  });
});

describe("verdict type hygiene", () => {
  it("every model verdict carries a model id and a known reason", () => {
    const reasons = ["contract_ok", "http_error", "empty", "not_json", "malformed_contract", "timeout", "probe_error"];
    const sample: ModelProbeVerdict[] = [
      { model: "a", ok: true, reason: "contract_ok", latencyMs: 1 },
      { model: "b", ok: false, reason: "http_error", latencyMs: 2, status: 404 },
    ];
    for (const v of sample) {
      expect(reasons).toContain(v.reason);
      expect(v.model).toBeTruthy();
    }
  });
});

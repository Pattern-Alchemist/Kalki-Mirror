import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type Client } from "@libsql/client";
import {
  libsqlSlidingWindow,
  rateLimitBackend,
  _libsqlState,
  RATE_LIMIT_TABLE_DDL,
} from "@/lib/rate-limit";

/* ══════════════════════════════════════════════════════════════
   Vol. 5 #3 — distributed rate-limit backend.
   The memory backend resets on cold start and never shares state,
   so the "5 req/min" promise was per-instance fiction. These
   tests exercise the REAL libSQL sliding-window SQL path against
   an in-memory client — identical statements, zero mocks.
   ══════════════════════════════════════════════════════════════ */

let client: Client;

beforeAll(async () => {
  client = createClient({ url: ":memory:" });
  for (const ddl of RATE_LIMIT_TABLE_DDL) await client.execute(ddl);
});

afterAll(() => {
  client.close();
});

describe("libsqlSlidingWindow (real SQL path, :memory: client)", () => {
  it("admits requests up to max within the window, then limits", async () => {
    const cfg = { key: "ip-a", max: 3, window: 60, prefix: "ai" };
    for (let i = 0; i < 3; i++) {
      const r = await libsqlSlidingWindow(client, cfg);
      expect(r.limited).toBe(false);
    }
    const r4 = await libsqlSlidingWindow(client, cfg);
    expect(r4.limited).toBe(true);
    expect(r4.remaining).toBe(0);
    // the window resets no earlier than the first hit + window
    expect(r4.reset).toBeGreaterThan(Date.now());
  });

  it("windows roll over — old hits are pruned, not counted", async () => {
    const key = "ip-b";
    // seed a hit 2 minutes ago (outside any 60s window)
    await client.execute({
      sql: 'INSERT INTO "RateLimitHit" ("key","ts") VALUES (?, ?)',
      args: ["ai:ip-b", Date.now() - 120_000],
    });
    const r = await libsqlSlidingWindow(client, { key, max: 1, window: 60, prefix: "ai" });
    expect(r.limited).toBe(false); // the stale hit was pruned before counting
    expect(r.remaining).toBe(0); // this call consumed the one allowed slot
  });

  it("keys are isolated — prefix + key namespace the window", async () => {
    await libsqlSlidingWindow(client, { key: "shared", max: 1, window: 60, prefix: "ask" });
    const otherPrefix = await libsqlSlidingWindow(client, { key: "shared", max: 1, window: 60, prefix: "init" });
    const otherKey = await libsqlSlidingWindow(client, { key: "other", max: 1, window: 60, prefix: "ask" });
    expect(otherPrefix.limited).toBe(false);
    expect(otherKey.limited).toBe(false);
  });

  it("counts hits across instances — a row inserted by another process counts", async () => {
    // simulate a sibling instance writing directly to the shared store
    await client.execute({
      sql: 'INSERT INTO "RateLimitHit" ("key","ts") VALUES (?, ?)',
      args: ["ai:sibling", Date.now()],
    });
    const r = await libsqlSlidingWindow(client, { key: "sibling", max: 1, window: 60, prefix: "ai" });
    expect(r.limited).toBe(true); // the sibling's hit is visible → shared state proven
  });
});

describe("backend selection honesty", () => {
  it("without remote TURSO/Upstash/KV vars the backend label is honest", () => {
    const backend = rateLimitBackend();
    expect(["upstash", "vercel-kv", "turso", "memory"]).toContain(backend);
    // in the vitest env TURSO vars point at a remote libsql URL only when the
    // sandbox exports them; either way the label must be a truthful one
    if (process.env.TURSO_DATABASE_URL && /^(libsql|https):\/\//.test(process.env.TURSO_DATABASE_URL)) {
      expect(["turso", "upstash", "vercel-kv"]).toContain(backend);
    } else {
      expect(backend).toBe("memory");
    }
  });

  it("the circuit breaker starts closed", () => {
    expect(_libsqlState.dead).toBe(false);
  });
});

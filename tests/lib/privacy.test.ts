import { beforeAll, describe, expect, it } from "vitest";
import {
  signActionToken,
  verifyActionToken,
  redactUser,
  DELETE_ACTION,
  EXPORT_ACTION,
  DEFAULT_TTL_MS,
} from "@/lib/privacy";

/* ══════════════════════════════════════════════════════════════
   Vol. 3 #12 — privacy action tokens. The account-deletion
   endpoint is destructive and irreversible; its only armour is
   this token scheme. Tamper, expiry, wrong-user, wrong-action
   and replay must ALL fail closed.
   ══════════════════════════════════════════════════════════════ */

beforeAll(() => {
  process.env.DATA_TOKEN_SECRET = "test-secret-for-vitest-only";
});

describe("signActionToken / verifyActionToken — round trip", () => {
  it("verifies a freshly minted token and returns remaining TTL", () => {
    const tok = signActionToken("user_123", DELETE_ACTION, DEFAULT_TTL_MS, 1_000_000);
    const remaining = verifyActionToken(tok, DELETE_ACTION, "user_123", 1_000_500);
    expect(remaining).not.toBeNull();
    expect(remaining! > 0).toBe(true);
    expect(remaining!).toBeLessThanOrEqual(DEFAULT_TTL_MS);
  });

  it("survives JSON round-trips (forms carry it as a string)", () => {
    const tok = signActionToken("user_abc", EXPORT_ACTION);
    const copy = JSON.parse(JSON.stringify(tok)) as string;
    expect(verifyActionToken(copy, EXPORT_ACTION, "user_abc")).not.toBeNull();
  });
});

describe("verifyActionToken — fail-closed paths", () => {
  it("rejects a tampered payload", () => {
    const tok = signActionToken("user_123", DELETE_ACTION);
    const [body] = tok.split(".");
    // Re-sign body's base64 for a different user with the ORIGINAL sig.
    const tampered = `${tok.replace(body, "wrong-body")}`;
    expect(verifyActionToken(tampered, DELETE_ACTION, "user_123")).toBeNull();
  });

  it("rejects a different user (cross-user replay)", () => {
    const tok = signActionToken("user_123", DELETE_ACTION);
    expect(verifyActionToken(tok, DELETE_ACTION, "user_999")).toBeNull();
  });

  it("rejects a different action (cross-action replay)", () => {
    const tok = signActionToken("user_123", DELETE_ACTION);
    expect(verifyActionToken(tok, EXPORT_ACTION, "user_123")).toBeNull();
  });

  it("rejects expired tokens", () => {
    const tok = signActionToken("user_123", DELETE_ACTION, 1000, 5_000_000);
    expect(verifyActionToken(tok, DELETE_ACTION, "user_123", 5_002_000)).toBeNull();
  });

  it("rejects garbage, empty strings, and wrong shapes", () => {
    expect(verifyActionToken(null, DELETE_ACTION, "u")).toBeNull();
    expect(verifyActionToken(42, DELETE_ACTION, "u")).toBeNull();
    expect(verifyActionToken("", DELETE_ACTION, "u")).toBeNull();
    expect(verifyActionToken("no-dot-here", DELETE_ACTION, "u")).toBeNull();
    expect(verifyActionToken("aaa.bbb", DELETE_ACTION, "u")).toBeNull();
    expect(verifyActionToken("x.y|z|1.sig", DELETE_ACTION, "u")).toBeNull();
  });

  it("rejects when the secret is missing (no silent open door)", () => {
    const saved = process.env.DATA_TOKEN_SECRET;
    const savedAuth = process.env.NEXTAUTH_SECRET;
    delete process.env.DATA_TOKEN_SECRET;
    delete process.env.NEXTAUTH_SECRET;
    try {
      const tok = "any.token";
      expect(verifyActionToken(tok, DELETE_ACTION, "u")).toBeNull();
      expect(() => signActionToken("u", DELETE_ACTION)).toThrow(/secret/);
    } finally {
      if (saved) process.env.DATA_TOKEN_SECRET = saved;
      if (savedAuth) process.env.NEXTAUTH_SECRET = savedAuth;
    }
  });
});

describe("redactUser", () => {
  it("strips credential material, keeps everything else", () => {
    const row = {
      id: "u1",
      email: "seeker@example.com",
      passwordHash: "bcrypt-digest",
      twoFactorSecret: "totp-secret",
      twoFactorBackupCodes: '["code1","code2"]',
      tier: "jal",
      birthDate: new Date("1994-08-11T00:00:00.000Z"),
    };
    const out = redactUser(row) as Record<string, unknown>;
    expect(out.passwordHash).toBeUndefined();
    expect(out.twoFactorSecret).toBeUndefined();
    expect(out.twoFactorBackupCodes).toBeUndefined();
    expect(out.email).toBe("seeker@example.com");
    expect(out.tier).toBe("jal");
    expect(out.birthDate).toBeInstanceOf(Date);
  });

  it("passes through rows that never had credential columns", () => {
    const row = { id: "u2", email: "a@b.c" };
    expect(redactUser(row)).toEqual(row);
  });
});

// =============================================================
// KALKI — AUDIO NARRATION TRUTH tests (Vol. 4 #12)
// -------------------------------------------------------------
// The registry↔data↔files triangle: every narration row points at a
// real breath pattern / door, its file is ACTUALLY COMMITTED under
// public/ (an audio link that 404s is a broken promise to a seeker
// mid-practice), and every bake script has a committed counterpart.
// The Door 1 email carries the listen line; Door 2 must not.
// =============================================================
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  breathNarrations,
  doorNarrations,
  getBreathNarration,
  getDoorNarration,
  doorNarrationAbsoluteUrl,
} from "@/lib/data/audio-narrations";
import { breathPatterns } from "@/lib/data/breath-patterns";
import { buildDoorDay } from "@/lib/emails/course-content";
import {
  allNarrationScripts,
  breathNarrationScripts,
  doorNarrationScripts,
} from "../../scripts/breathwork-narrations.mjs";

describe("breath narrations ↔ pattern data", () => {
  it("every narration row points at a REAL breath pattern slug", () => {
    const slugs = new Set(breathPatterns.map((p) => p.slug));
    for (const n of breathNarrations) {
      expect(slugs.has(n.slug), `${n.slug} is not a breath pattern`).toBe(true);
    }
  });

  it("no duplicate narration rows", () => {
    const slugs = breathNarrations.map((n) => n.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("the pilot set is exactly the four entry patterns", () => {
    expect(breathNarrations.map((n) => n.slug).sort()).toEqual([
      "bhramari",
      "nadi-shuddhi-basic",
      "nadi-shuddhi-with-retention",
      "ujjayi-pranayama",
    ]);
  });
});

describe("narration files are COMMITTED (an audio link that 404s is a broken promise)", () => {
  it("every breath narration file exists under public/", () => {
    for (const n of breathNarrations) {
      const p = join("public", n.url);
      expect(existsSync(p), `${p} missing — bake it: node scripts/bake-breathwork-audio.mjs --only ${n.slug}`).toBe(true);
      expect(statSync(p).size).toBeGreaterThan(50_000); // a real narration, not a stub
    }
  });

  it("every door narration file exists under public/", () => {
    for (const day of Object.keys(doorNarrations)) {
      const n = doorNarrations[Number(day)];
      const p = join("public", n.url);
      expect(existsSync(p), `${p} missing`).toBe(true);
      expect(statSync(p).size).toBeGreaterThan(50_000);
    }
  });

  it("URLs are clean static paths (no CDN, no query)", () => {
    for (const n of [...breathNarrations, ...Object.values(doorNarrations)]) {
      expect(n.url).toMatch(/^\/audio\/[a-z0-9-/]+\.mp3$/);
    }
  });

  it("durations are honest (60–120s band for the pilot scripts)", () => {
    for (const n of [...breathNarrations, ...Object.values(doorNarrations)]) {
      expect(n.durationSec).toBeGreaterThan(60);
      expect(n.durationSec).toBeLessThan(120);
    }
  });
});

describe("bake scripts ↔ committed audio (the pipeline contract)", () => {
  it("every bake script has a committed file", () => {
    for (const s of allNarrationScripts) {
      expect(existsSync(join(s.outFile)), `${s.outFile} never baked`).toBe(true);
    }
  });

  it("every committed breath narration has a script (no orphan files)", () => {
    for (const n of breathNarrations) {
      expect(breathNarrationScripts.some((s) => s.slug === n.slug)).toBe(true);
    }
  });

  it("every script fits ONE TTS request (≤1024 chars — the hard API limit)", () => {
    for (const s of allNarrationScripts) {
      expect(
        s.script.length,
        `${s.slug} is ${s.script.length} chars — shrink it, never chunk blind`
      ).toBeLessThanOrEqual(1024);
    }
  });

  it("the pilot scope is 4 breath patterns + 1 Door sample (roadmap #12)", () => {
    expect(breathNarrationScripts).toHaveLength(4);
    expect(doorNarrationScripts).toHaveLength(1);
    expect(doorNarrationScripts[0].slug).toBe("door-01");
  });
});

describe("registry getters", () => {
  it("getBreathNarration returns undefined for unnarrated patterns", () => {
    expect(getBreathNarration("sitali")).toBeUndefined(); // real pattern, not in pilot
    expect(getBreathNarration("nonexistent")).toBeUndefined();
    expect(getBreathNarration("bhramari")).toBeDefined();
  });

  it("getDoorNarration: day 1 yes, day 2 not yet (pilot)", () => {
    expect(getDoorNarration(1)).toBeDefined();
    expect(getDoorNarration(2)).toBeUndefined();
  });

  it("doorNarrationAbsoluteUrl joins the site origin", () => {
    expect(doorNarrationAbsoluteUrl(1, "https://www.astrokalki.com")).toBe(
      "https://www.astrokalki.com/audio/doors/door-01.mp3"
    );
    expect(doorNarrationAbsoluteUrl(3, "https://www.astrokalki.com")).toBeUndefined();
  });
});

describe("Door 1 email carries the listen line (Door 2 must not)", () => {
  const email = "seeker@example.com";

  it("Door 1 html links the narrated edition", () => {
    const door = buildDoorDay(1, email);
    expect(door).not.toBeNull();
    expect(door!.html).toContain("Prefer to listen?");
    expect(door!.html).toContain("/audio/doors/door-01.mp3");
    expect(door!.text).toContain("/audio/doors/door-01.mp3");
  });

  it("Door 2 has no listen line (no narration baked yet)", () => {
    const door = buildDoorDay(2, email);
    expect(door).not.toBeNull();
    expect(door!.html).not.toContain("Prefer to listen?");
    expect(door!.text).not.toContain("Narrated edition");
  });
});

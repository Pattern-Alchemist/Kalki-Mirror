// =============================================================
// KALKI — AUDIO NARRATION TRUTH tests (Vol. 4 #12 pilot → Vol. 5 #9 full)
// -------------------------------------------------------------
// The registry↔data↔files triangle: every narration row points at a
// real breath pattern / door, its file is ACTUALLY COMMITTED under
// public/ (an audio link that 404s is a broken promise to a seeker
// mid-practice), and every bake script has a committed counterpart.
// Vol. 5 #9: the scope pins moved from the 4+1 pilot to the FULL
// corpus — 12 patterns + 10 Doors, every door email carries the
// listen line, every file committed.
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

  it("the set is exactly the twelve breath patterns (Vol. 5 #9: fully voiced)", () => {
    expect(breathNarrations.map((n) => n.slug).sort()).toEqual(breathPatterns.map((p) => p.slug).sort());
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

  it("the scope is the FULL corpus: 12 breath patterns + 10 Doors (Vol. 5 #9)", () => {
    expect(breathNarrationScripts).toHaveLength(12);
    expect(doorNarrationScripts).toHaveLength(10);
    expect(doorNarrationScripts.map((s) => s.slug)).toEqual(
      Array.from({ length: 10 }, (_, i) => `door-${String(i + 1).padStart(2, "0")}`)
    );
  });
});

describe("registry getters", () => {
  it("getBreathNarration covers every real pattern; unknown slugs stay undefined", () => {
    for (const p of breathPatterns) {
      expect(getBreathNarration(p.slug), `${p.slug} must be narrated`).toBeDefined();
    }
    expect(getBreathNarration("nonexistent")).toBeUndefined();
  });

  it("getDoorNarration: every day 1–10 yes, day 11 undefined", () => {
    for (let day = 1; day <= 10; day += 1) {
      expect(getDoorNarration(day), `door ${day} must be narrated`).toBeDefined();
    }
    expect(getDoorNarration(11)).toBeUndefined();
  });

  it("doorNarrationAbsoluteUrl joins the site origin", () => {
    expect(doorNarrationAbsoluteUrl(1, "https://www.astrokalki.com")).toBe(
      "https://www.astrokalki.com/audio/doors/door-01.mp3"
    );
    expect(doorNarrationAbsoluteUrl(3, "https://www.astrokalki.com")).toBe(
      "https://www.astrokalki.com/audio/doors/door-03.mp3"
    );
    expect(doorNarrationAbsoluteUrl(11, "https://www.astrokalki.com")).toBeUndefined();
  });
});

describe("every Door email carries the listen line (Vol. 5 #9)", () => {
  const email = "seeker@example.com";

  it("Door 1 html links the narrated edition", () => {
    const door = buildDoorDay(1, email);
    expect(door).not.toBeNull();
    expect(door!.html).toContain("Prefer to listen?");
    expect(door!.html).toContain("/audio/doors/door-01.mp3");
    expect(door!.text).toContain("/audio/doors/door-01.mp3");
  });

  it("Doors 2–10 now carry the listen line too", () => {
    for (let day = 2; day <= 10; day += 1) {
      const door = buildDoorDay(day, email);
      expect(door).not.toBeNull();
      expect(door!.html, `door ${day} missing listen line`).toContain("Prefer to listen?");
      expect(door!.html).toContain(`/audio/doors/door-${String(day).padStart(2, "0")}.mp3`);
    }
  });
});

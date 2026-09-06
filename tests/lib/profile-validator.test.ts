import { describe, expect, it } from "vitest";
import {
  parseBirthProfile,
  isValidTimeZone,
  type BirthProfileInput,
} from "@/lib/validators/profile";

/* ══════════════════════════════════════════════════════════════
   Vol. 3 #11 — birth-profile validation. This is the single
   gate between the seeker's form and the User row that feeds
   the transit engine + Brahma-muhūrta pulse. Garbage in the
   natal fields poisons every downstream computation silently.
   ══════════════════════════════════════════════════════════════ */

const PAST_DATE = "1994-08-11";

describe("parseBirthProfile — empty/untouched semantics", () => {
  it("accepts a fully empty profile (all nulls = cleared)", () => {
    const r = parseBirthProfile({});
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data).toEqual({
        birthDate: null,
        birthPlace: null,
        latitude: null,
        longitude: null,
        timezone: null,
        natalMoonLng: null,
      });
    }
  });

  it("treats empty strings as cleared fields", () => {
    const r = parseBirthProfile({
      birthDate: "",
      birthPlace: "   ",
      latitude: "",
      longitude: null,
      timezone: undefined,
      natalMoonLng: "",
    });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.birthDate).toBeNull();
      expect(r.data.birthPlace).toBeNull();
    }
  });
});

describe("parseBirthProfile — happy path", () => {
  it("parses a complete valid profile (numbers as strings included)", () => {
    const input: BirthProfileInput = {
      birthDate: PAST_DATE,
      birthPlace: "  Varanasi, Uttar Pradesh  ",
      latitude: "25.3176",
      longitude: -82.9739,
      timezone: "Asia/Kolkata",
      natalMoonLng: "137.42",
    };
    const r = parseBirthProfile(input);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.birthDate).toBeInstanceOf(Date);
      expect(r.data.birthDate?.getUTCFullYear()).toBe(1994);
      expect(r.data.birthPlace).toBe("Varanasi, Uttar Pradesh");
      expect(r.data.latitude).toBeCloseTo(25.3176);
      expect(r.data.longitude).toBeCloseTo(-82.9739);
      expect(r.data.timezone).toBe("Asia/Kolkata");
      expect(r.data.natalMoonLng).toBeCloseTo(137.42);
    }
  });
});

describe("parseBirthProfile — rejection paths", () => {
  it("rejects future birth dates", () => {
    const future = new Date(Date.now() + 365 * 24 * 3600 * 1000)
      .toISOString()
      .slice(0, 10);
    const r = parseBirthProfile({ birthDate: future });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.birthDate).toMatch(/past/i);
  });

  it("rejects dates before 1900", () => {
    const r = parseBirthProfile({ birthDate: "1899-12-31" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.birthDate).toMatch(/1900/);
  });

  it("rejects unparseable dates", () => {
    const r = parseBirthProfile({ birthDate: "not-a-date" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.birthDate).toBeTruthy();
  });

  it("rejects out-of-range latitude and longitude", () => {
    const r = parseBirthProfile({ latitude: 91, longitude: -181 });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.latitude).toMatch(/between -90 and 90/);
      expect(r.errors.longitude).toMatch(/between -180 and 180/);
    }
  });

  it("rejects out-of-range natal Moon longitude", () => {
    const r = parseBirthProfile({ natalMoonLng: 361 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.natalMoonLng).toMatch(/between 0 and 360/);
  });

  it("rejects non-numeric garbage in numeric fields", () => {
    const r = parseBirthProfile({ latitude: "north-ish", natalMoonLng: "moon" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.latitude).toMatch(/number/i);
      expect(r.errors.natalMoonLng).toMatch(/number/i);
    }
  });

  it("rejects unknown IANA timezones", () => {
    const r = parseBirthProfile({ timezone: "Asia/Kolkatta" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.timezone).toMatch(/IANA/);
  });

  it("rejects overlong birth place", () => {
    const r = parseBirthProfile({ birthPlace: "x".repeat(201) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.birthPlace).toMatch(/200 characters/);
  });

  it("collects multiple field errors at once", () => {
    const r = parseBirthProfile({ latitude: 999, timezone: "Mars/Olympus" });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(["latitude", "timezone"]);
    }
  });
});

describe("isValidTimeZone", () => {
  it("accepts real zones", () => {
    expect(isValidTimeZone("Asia/Kolkata")).toBe(true);
    expect(isValidTimeZone("UTC")).toBe(true);
    expect(isValidTimeZone("America/New_York")).toBe(true);
  });

  it("rejects invented zones", () => {
    expect(isValidTimeZone("Asia/Kolkatta")).toBe(false);
    expect(isValidTimeZone("Mars/Olympus")).toBe(false);
    expect(isValidTimeZone("")).toBe(false);
  });
});

/**
 * TESTIMONIAL INTAKE — Vol. 4 #5 tests.
 *
 * The seeker-facing form is the first non-archivist write path into the
 * Testimonial table. The validator is the only gate, so these tests pin
 * every rule it enforces: length bounds, the consent hard-gate, the spam
 * guards (link floods, shouting), and the resolution-preset formatter.
 */
import { describe, it, expect } from "vitest";
import {
  validateTestimonial,
  formatResolutionContext,
  QUOTE_MIN,
  QUOTE_MAX,
} from "@/lib/validators/testimonial";

const base = {
  quote: "The pattern work showed me the loop I had been running for years, and the practice gave me a way out of it.",
  displayName: "Ananya M.",
  context: "Pattern Consultation",
  location: "Mumbai",
  consent: true,
};

describe("validateTestimonial — the happy path", () => {
  it("accepts a real testimony with consent and trims the fields", () => {
    const r = validateTestimonial({ ...base, quote: `  ${base.quote}  ` });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.quote.startsWith("The pattern")).toBe(true);
      expect(r.data.displayName).toBe("Ananya M.");
      expect(r.data.location).toBe("Mumbai");
    }
  });

  it("accepts minimal input — only the quote and consent are mandatory", () => {
    const r = validateTestimonial({ quote: base.quote, consent: true });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.displayName).toBe("");
      expect(r.data.context).toBe("");
      expect(r.data.location).toBe("");
    }
  });
});

describe("validateTestimonial — the consent hard-gate", () => {
  it("rejects missing consent, false consent, and truthy impostors", () => {
    for (const consent of [undefined, false, "yes", 1]) {
      const r = validateTestimonial({ ...base, consent });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.consent).toBeTruthy();
    }
  });
});

describe("validateTestimonial — quote bounds", () => {
  it("enforces the 40-character floor and the 800-character ceiling", () => {
    expect(QUOTE_MIN).toBe(40);
    expect(QUOTE_MAX).toBe(800);
    expect(validateTestimonial({ ...base, quote: "Grateful." }).ok).toBe(false);
    expect(
      validateTestimonial({ ...base, quote: "x".repeat(801) }).ok,
    ).toBe(false);
    expect(validateTestimonial({ ...base, quote: "x".repeat(800) }).ok).toBe(true);
  });

  it("counts trimmed length, not raw length", () => {
    const r = validateTestimonial({ ...base, quote: `${"x".repeat(45)}${" ".repeat(30)}` });
    expect(r.ok).toBe(true);
  });
});

describe("validateTestimonial — spam guards", () => {
  it("rejects link floods (>3 URLs)", () => {
    const spam = `${base.quote.slice(0, 60)} https://a.com https://b.com https://c.com https://d.com`;
    const r = validateTestimonial({ ...base, quote: spam });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.quote).toBeTruthy();
  });

  it("rejects shouting (nearly all caps with a meaningful sample)", () => {
    const shout = "THIS PRACTICE CHANGED EVERYTHING FOR ME AND I MEAN EVERY SINGLE PART OF IT TRULY";
    const r = validateTestimonial({ ...base, quote: shout });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.quote).toContain("caps");
  });

  it("does not flag a normal sentence that happens to contain capitals", () => {
    expect(validateTestimonial({ ...base }).ok).toBe(true);
  });
});

describe("validateTestimonial — field caps", () => {
  it("caps display name at 40, context at 80, location at 60", () => {
    const r = validateTestimonial({
      ...base,
      displayName: "x".repeat(41),
      context: "x".repeat(81),
      location: "x".repeat(61),
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.errors.displayName).toBeTruthy();
      expect(r.errors.context).toBeTruthy();
      expect(r.errors.location).toBeTruthy();
    }
  });
});

describe("formatResolutionContext", () => {
  it("turns a resolved pattern into a one-line context preset", () => {
    expect(formatResolutionContext({ patternName: "THE RESCUER", daysToResolve: 34 })).toBe(
      "Integrated THE RESCUER in 34 days",
    );
  });
});

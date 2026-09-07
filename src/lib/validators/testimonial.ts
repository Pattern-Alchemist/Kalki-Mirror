/* =============================================================
   KALKI — TESTIMONIAL INTAKE VALIDATOR (Vol. 4 #5)
   Pure, test-pinned validation for the seeker-facing testimony
   form on /profile. The Testimonial model is archivist-owned
   (PENDING → APPROVED on the admin board); the seeker's path
   writes a PENDING row only, with consent captured explicitly.
   This validator is the single gate every self-intake passes.
   ============================================================= */

export interface TestimonialInput {
  quote?: unknown;
  displayName?: unknown;
  context?: unknown;
  location?: unknown;
  consent?: unknown;
}

export interface TestimonialData {
  quote: string;
  displayName: string;
  context: string;
  location: string;
}

export type TestimonialResult =
  | { ok: true; data: TestimonialData }
  | { ok: false; errors: Record<string, string> };

export const QUOTE_MIN = 40;
export const QUOTE_MAX = 800;

function asTrimmed(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function countUrls(s: string): number {
  return (s.match(/https?:\/\/[^\s]+/gi) ?? []).length;
}

/** >60% uppercase across a meaningful sample reads as shouting, not testimony. */
function isShouting(s: string): boolean {
  const letters = s.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 20) return false;
  const uppers = letters.replace(/[^A-Z]/g, "").length;
  return uppers / letters.length > 0.6;
}

export function validateTestimonial(input: TestimonialInput): TestimonialResult {
  const errors: Record<string, string> = {};

  const quote = asTrimmed(input.quote);
  if (quote.length < QUOTE_MIN) {
    errors.quote = `A few more words, please — at least ${QUOTE_MIN} characters (currently ${quote.length}).`;
  } else if (quote.length > QUOTE_MAX) {
    errors.quote = `Keep it under ${QUOTE_MAX} characters (currently ${quote.length}) — the board renders short testimonies best.`;
  } else if (countUrls(quote) > 3) {
    errors.quote = "Too many links for a testimony — write the words, drop the addresses.";
  } else if (isShouting(quote)) {
    errors.quote = "Nearly all caps — the archivist will read it as shouting. Lower the volume.";
  }

  const displayName = asTrimmed(input.displayName);
  if (displayName.length > 40) {
    errors.displayName = "Display name: 40 characters at most (\"Ananya M.\" is plenty).";
  }

  const context = asTrimmed(input.context);
  if (context.length > 80) {
    errors.context = "Context: 80 characters at most — what you did, not your life story.";
  }

  const location = asTrimmed(input.location);
  if (location.length > 60) {
    errors.location = "Location: 60 characters at most (\"Mumbai\" or \"Austin, TX\").";
  }

  if (input.consent !== true) {
    errors.consent = "Consent is required — nothing is published without your explicit yes.";
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: { quote, displayName, context, location },
  };
}

/** Preset context line for a resolved pattern — the highest-testimony moment, in words. */
export function formatResolutionContext(p: { patternName: string; daysToResolve: number }): string {
  return `Integrated ${p.patternName} in ${p.daysToResolve} days`;
}

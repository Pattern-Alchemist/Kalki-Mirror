/* =============================================================
   KALKI — BIRTH-PROFILE VALIDATOR (Vol. 3 #11)
   Pure, test-pinned validation for the member birth profile.
   The User model carries birthDate / birthPlace / latitude /
   longitude / timezone / natalMoonLng — these feed the transit
   engine and the Brahma-muhūrta pulse. There is NO admin surface
   for them (the member is the only source of truth), so this
   validator is the single gate every write passes through.
   ============================================================= */

export interface BirthProfileInput {
  birthDate?: unknown;
  birthPlace?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  timezone?: unknown;
  natalMoonLng?: unknown;
}

export interface BirthProfileData {
  birthDate: Date | null;
  birthPlace: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  natalMoonLng: number | null;
}

export type BirthProfileResult =
  | { ok: true; data: BirthProfileData }
  | { ok: false; errors: Record<string, string> };

const BIRTH_PLACE_MAX = 200;
const TIMEZONE_MAX = 64;
const MIN_BIRTH_YEAR = 1900;

/** IANA timezone check — Intl throws on unknown zones. */
export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Numeric field: accepts number or finite numeric string, range-checked. */
function parseNumber(
  value: unknown,
  min: number,
  max: number,
  label: string
): { value: number | null; error?: string } {
  if (value === undefined || value === null || value === "") return { value: null };
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) return { value: null, error: `${label} must be a number.` };
  if (n < min || n > max)
    return { value: null, error: `${label} must be between ${min} and ${max}.` };
  return { value: n };
}

function parseString(
  value: unknown,
  max: number,
  label: string
): { value: string | null; error?: string } {
  if (value === undefined || value === null || value === "") return { value: null };
  if (typeof value !== "string") return { value: null, error: `${label} must be text.` };
  const trimmed = value.trim();
  if (trimmed.length === 0) return { value: null };
  if (trimmed.length > max)
    return { value: null, error: `${label} must be at most ${max} characters.` };
  return { value: trimmed };
}

export function parseBirthProfile(input: BirthProfileInput): BirthProfileResult {
  const errors: Record<string, string> = {};

  // ── birthDate: ISO-ish parse, past-only, 1900 floor ──
  let birthDate: Date | null = null;
  if (input.birthDate !== undefined && input.birthDate !== null && input.birthDate !== "") {
    if (typeof input.birthDate !== "string") {
      errors.birthDate = "Birth date must be a date string.";
    } else {
      const d = new Date(input.birthDate.trim());
      if (Number.isNaN(d.getTime())) {
        errors.birthDate = "Birth date is not a valid date.";
      } else {
        const today = new Date();
        if (d.getTime() >= today.getTime()) {
          errors.birthDate = "Birth date must be in the past.";
        } else if (d.getUTCFullYear() < MIN_BIRTH_YEAR) {
          errors.birthDate = `Birth date cannot be before ${MIN_BIRTH_YEAR}.`;
        } else {
          birthDate = d;
        }
      }
    }
  }

  const place = parseString(input.birthPlace, BIRTH_PLACE_MAX, "Birth place");
  if (place.error) errors.birthPlace = place.error;

  const lat = parseNumber(input.latitude, -90, 90, "Latitude");
  if (lat.error) errors.latitude = lat.error;

  const lon = parseNumber(input.longitude, -180, 180, "Longitude");
  if (lon.error) errors.longitude = lon.error;

  const moon = parseNumber(input.natalMoonLng, 0, 360, "Natal Moon longitude");
  if (moon.error) errors.natalMoonLng = moon.error;

  // ── timezone: string, bounded, must be a known IANA zone ──
  let timezone: string | null = null;
  const tzRaw = parseString(input.timezone, TIMEZONE_MAX, "Timezone");
  if (tzRaw.error) {
    errors.timezone = tzRaw.error;
  } else if (tzRaw.value !== null) {
    if (!isValidTimeZone(tzRaw.value)) {
      errors.timezone = "Timezone must be a valid IANA zone (e.g. Asia/Kolkata).";
    } else {
      timezone = tzRaw.value;
    }
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: {
      birthDate,
      birthPlace: place.value,
      latitude: lat.value,
      longitude: lon.value,
      timezone,
      natalMoonLng: moon.value,
    },
  };
}

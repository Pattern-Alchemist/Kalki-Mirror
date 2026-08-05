/**
 * SWISS EPHEMERIS TRANSIT ENGINE
 * 
 * Mathematically tethered to the actual cosmos.
 * Calculates Vedic planetary positions, current transits,
 * and identifies karmic friction points.
 * 
 * Uses Swiss Ephemeris (swisseph) — the same library used by
 * professional astrological software worldwide.
 */

import sweph from 'swisseph';

// Vedic planetary IDs in Swiss Ephemeris
const SE_SUN = 0;
const SE_MOON = 1;
const SE_MARS = 4;
const SE_MERCURY = 2;
const SE_JUPITER = 5;
const SE_VENUS = 3;
const SE_SATURN = 6;
const SE_RAHU = 10;  // Mean Node
const SE_KETU = 11;  // Mean Node (opposite)

const VEDIC_PLANETS = [
  { id: SE_SUN, name: 'Surya', sanskrit: 'सूर्य' },
  { id: SE_MOON, name: 'Chandra', sanskrit: 'चन्द्र' },
  { id: SE_MARS, name: 'Mangala', sanskrit: 'मंगल' },
  { id: SE_MERCURY, name: 'Budha', sanskrit: 'बुध' },
  { id: SE_JUPITER, name: 'Guru', sanskrit: 'गुरु' },
  { id: SE_VENUS, name: 'Shukra', sanskrit: 'शुक्र' },
  { id: SE_SATURN, name: 'Shani', sanskrit: 'शनि' },
  { id: SE_RAHU, name: 'Rahu', sanskrit: 'राहु' },
] as const;

export interface PlanetaryPosition {
  planet: string;
  sanskrit: string;
  longitude: number;     // 0-360 degrees
  nakshatra: string;     // Current nakshatra
  nakshatraPada: number; // 1-4
  retrograde: boolean;
}

export interface TransitGeometry {
  timestamp: string;
  positions: PlanetaryPosition[];
  frictions: TransitFriction[];
}

export interface TransitFriction {
  type: 'conjunction' | 'opposition' | 'square' | 'trine';
  planet1: string;
  planet2: string;
  orb: number;           // degrees of separation from exact aspect
  severity: 'critical' | 'moderate' | 'subtle';
  psychologicalFriction: string;
  prescribedMicroSadhana: string;
}

/**
 * Convert a JavaScript Date to Julian Day Number.
 */
function toJD(date: Date): number {
  return sweph.swe_julday(
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

/**
 * Normalize longitude to 0-360 degrees.
 */
function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Get angular distance between two longitudes.
 */
function angularDistance(lon1: number, lon2: number): number {
  const diff = Math.abs(normalizeDeg(lon1) - normalizeDeg(lon2));
  return diff > 180 ? 360 - diff : diff;
}

/**
 * 27 Nakshatras with their lords.
 */
const NAKSHATRAS = [
  'Ashvini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

/**
 * Determine the nakshatra and pada from a longitude.
 */
function getNakshatra(longitude: number): { name: string; pada: number } {
  const normalizedLong = normalizeDeg(longitude);
  const totalNakshatras = 360 / 27; // 13.333... degrees per nakshatra
  const index = Math.floor(normalizedLong / totalNakshatras);
  const remainder = normalizedLong - index * totalNakshatras;
  const pada = Math.floor(remainder / (totalNakshatras / 4)) + 1;
  return {
    name: NAKSHATRAS[index] || 'Ashvini',
    pada: Math.min(pada, 4),
  };
}

/**
 * Calculate current planetary positions.
 */
export function calculateCurrentPositions(date?: Date): PlanetaryPosition[] {
  const dt = date ?? new Date();
  const jd = toJD(dt);

  // Set ephemeris path (empty = bundled data)
  try { sweph.swe_set_ephe_path(''); } catch { /* */ }

  return VEDIC_PLANETS.map(p => {
    const result = sweph.swe_calc_ut(jd, p.id, 0);
    const longitude = result.longitude || 0;
    const retrograde = (result.flags || 0) & 256 ? true : false; // SEFLG_RETROGRADE = 256
    const { name, pada } = getNakshatra(longitude);

    return {
      planet: p.name,
      sanskrit: p.sanskrit,
      longitude: Math.round(longitude * 100) / 100,
      nakshatra: name,
      nakshatraPada: pada,
      retrograde,
    };
  });
}

/**
 * Identify karmic friction points from transits.
 * Focuses on Saturn (Shani) aspects — the primary karmic indicator.
 */
export function identifyFrictions(
  natalMoonLongitude: number,
  date?: Date
): TransitFriction[] {
  const positions = calculateCurrentPositions(date);
  const frictions: TransitFriction[] = [];

  // Find Saturn's current position
  const saturn = positions.find(p => p.planet === 'Shani');
  if (!saturn) return frictions;

  // Saturn-Moon aspects (the primary karmic friction)
  const saturnMoonDist = angularDistance(saturn.longitude, natalMoonLongitude);
  
  // Sade Sati zones: Saturn within 45° of natal Moon
  if (saturnMoonDist <= 45) {
    const severity = saturnMoonDist <= 10 ? 'critical' : saturnMoonDist <= 25 ? 'moderate' : 'subtle';
    frictions.push({
      type: saturnMoonDist <= 3 ? 'conjunction' : saturnMoonDist <= 15 ? 'square' : 'opposition',
      planet1: 'Shani',
      planet2: 'Chandra (Natal)',
      orb: Math.round(saturnMoonDist * 10) / 10,
      severity: severity as 'critical' | 'moderate' | 'subtle',
      psychologicalFriction: severity === 'critical'
        ? 'The Saturn-Moon oscillation is at peak amplitude. The subject will experience compression of emotional architecture — isolation, self-doubt, and the dismantling of external support structures. This is not punishment; it is the algorithm recalibrating the ego-structure for sovereignty.'
        : severity === 'moderate'
          ? 'Shani is exerting gravitational pressure on the natal Moon. The subject may notice increased pattern loops in relationships and self-worth calculations. The geometry supports deep inner work.'
          : 'Distant Saturn resonance. Subtle pressure on the emotional architecture. The pattern is detectable but not acute.',
      prescribedMicroSadhana: severity === 'critical'
        ? 'Shani Gayatri Mantra (108 repetitions at dusk). Nāḍī Śuddhi with extended Bahya Kumbhaka. Journal the specific pattern loop activating today.'
        : 'Chandra Bhedana (moon-piercing prāṇāyāma), 15 rounds. Observe emotional triggers without intervention. Record the vector.',
    });
  }

  // Mars-Moon square (emotional volatility)
  const mars = positions.find(p => p.planet === 'Mangala');
  if (mars) {
    const marsMoonDist = angularDistance(mars.longitude, natalMoonLongitude);
    if (marsMoonDist <= 8 && marsMoonDist >= 82) {
      frictions.push({
        type: 'square',
        planet1: 'Mangala',
        planet2: 'Chandra (Natal)',
        orb: Math.round(Math.min(marsMoonDist, 90 - marsMoonDist) * 10) / 10,
        severity: 'moderate',
        psychologicalFriction: 'Mangala squares the natal Moon. The subject will experience amplified reactivity — irritability, impulsiveness, and the activation of aggressive pattern loops. The architecture favors decisive action but risks destructive vectors.',
        prescribedMicroSadhana: 'Chandra Nadi Shodhana (5 minutes). Then sit in stillness for 10 minutes observing the impulse-to-action vector without executing. Record what the mind demands vs. what pattern intelligence recommends.',
      });
    }
  }

  return frictions;
}

/**
 * Generate the full transit geometry report for a given date.
 */
export function getTransitGeometry(
  natalMoonLongitude?: number,
  date?: Date
): TransitGeometry {
  const dt = date ?? new Date();
  const positions = calculateCurrentPositions(dt);
  const frictions = natalMoonLongitude !== undefined
    ? identifyFrictions(natalMoonLongitude, dt)
    : [];

  return {
    timestamp: dt.toISOString(),
    positions,
    frictions,
  };
}

/**
 * Format a transit geometry for the YANTRA prompt context.
 */
export function formatTransitForPrompt(geometry: TransitGeometry): string {
  const planetLines = geometry.positions
    .map(p => {
      const retro = p.retrograde ? ' (R)' : '';
      return `${p.planet} at ${p.longitude.toFixed(2)}° in ${p.nakshatra} Pada ${p.nakshatraPada}${retro}`;
    })
    .join(' | ');

  if (geometry.frictions.length === 0) {
    return `CURRENT TRANSIT GEOMETRY: ${planetLines}`;
  }

  const frictionLines = geometry.frictions
    .map(f => `[${f.severity.toUpperCase()}] ${f.planet1}-${f.planet2} ${f.type} (${f.orb}° orb)`)
    .join('\n');

  return `CURRENT TRANSIT GEOMETRY: ${planetLines}\nACTIVE FRICTION POINTS:\n${frictionLines}`;
}

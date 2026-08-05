/**
 * PURE-JS EPHEMERIS TRANSIT ENGINE
 *
 * Zero native dependencies. No node-gyp, no Python, no C compilation.
 * Safe for Vercel serverless, edge, any JS runtime.
 *
 * Algorithms:
 *   - Sun:     Meeus Ch.25 (low-precision series, ~0.01° accuracy)
 *   - Moon:    Meeus Ch.45-47 main terms + ELP2000 truncated (~0.1° accuracy)
 *   - Planets: Heliocentric mean orbital elements + Kepler's equation
 *              (Schlyter/Meeus approach, ~0.5° accuracy)
 *   - Rahu:    Mean Node from Meeus Ch.47
 *
 * For Vedic transit detection, sub-degree accuracy is sufficient.
 * The YANTRA system operates on archetypal resonance, not arcminute precision.
 */

// ─── Julian Day ─────────────────────────────────────────────────────────────

function toJD(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440 + date.getUTCSeconds() / 86400;
  let yy = y;
  let mm = m;
  if (mm <= 2) { yy -= 1; mm += 12; }
  const A = Math.floor(yy / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + d + B - 1524.5;
}

function daysSinceJ2000(jd: number): number {
  return jd - 2451545.0;
}

function julianCenturies(jd: number): number {
  return (jd - 2451545.0) / 36525.0;
}

// ─── Utility ────────────────────────────────────────────────────────────────

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function angularDistance(lon1: number, lon2: number): number {
  const diff = Math.abs(normalizeDeg(lon1) - normalizeDeg(lon2));
  return diff > 180 ? 360 - diff : diff;
}

function solveKepler(M: number, e: number, tol = 1e-8): number {
  let E = M;
  for (let i = 0; i < 30; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tol) break;
  }
  return E;
}

// ─── SUN (Meeus Ch.25) ─────────────────────────────────────────────────────

function sunLongitude(T: number): number {
  const L0 = normalizeDeg(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M = normalizeDeg(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mrad = M * DEG;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);
  return normalizeDeg(L0 + C);
}

// ─── MOON (Meeus Ch.47, ELP2000 main terms) ─────────────────────────────────

function moonLongitude(T: number): number {
  const Lp = normalizeDeg(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T
    + T * T * T / 538841 - T * T * T * T / 65194000);
  const D  = normalizeDeg(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T
    + T * T * T / 545868 - T * T * T * T / 113065000);
  const M  = normalizeDeg(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T
    + T * T * T / 24490000);
  const Mp = normalizeDeg(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T
    + T * T * T / 69699 - T * T * T * T / 14712000);
  const F  = normalizeDeg(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T
    - T * T * T / 3526000 + T * T * T * T / 863310000);

  const Dr = D * DEG, Mr = M * DEG, Mpr = Mp * DEG, Fr = F * DEG;

  const terms: [number, number, number, number, number][] = [
    [6.288774, 0, 0, 1, 0],
    [1.274016, 2, 0, -1, 0],
    [0.658314, 2, 0, 0, 0],
    [0.213618, 0, 0, 2, 0],
    [0.185146, 0, 1, 0, 0],
    [0.114333, 0, 0, 0, 2],
    [0.058733, 2, 0, -2, 0],
    [0.057066, 1, 0, -1, 0],
    [0.053322, 0, 1, 1, 0],
    [0.045758, 0, 1, -1, 0],
    [0.041024, 2, -1, -1, 0],
    [-0.034718, 1, 0, 1, 0],
    [-0.030383, 0, -1, 1, 0],
    [0.015327, 0, 1, 2, 0],
    [-0.012528, 3, 0, -1, 0],
    [0.010980, 4, 0, -1, 0],
  ];

  let sum = 0;
  for (const [A, cD, cM, cMp, cF] of terms) {
    sum += A * Math.sin(cD * Dr + cM * Mr + cMp * Mpr + cF * Fr);
  }

  return normalizeDeg(Lp + sum);
}

// ─── MEAN NODE (Rahu/Ketu) ─────────────────────────────────────────────────

function meanNode(T: number): number {
  return normalizeDeg(125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000);
}

// ─── PLANETS — Mean Elements + Kepler (Schlyter/Meeus) ─────────────────────
//
// J2000 osculating elements from JPL/Meeus.
// For each planet: [L0°, L1°/day, a(AU), e, i°, Ω°, ω̃°]
//
// Algorithm:
//   1. Compute d (days from J2000)
//   2. L = L0 + L1*d (mean longitude)
//   3. M = L - ω̃ (mean anomaly)
//   4. Solve Kepler: E - e*sin(E) = M
//   5. ν = true anomaly from E
//   6. r = a*(1 - e*cos(E)) (heliocentric distance)
//   7. Heliocentric ecliptic (x,y,z) from (r, ν, i, Ω, ω)
//   8. Subtract Earth's (x,y,z) for geocentric
//   9. atan2(yg, xg) = geocentric ecliptic longitude

interface OrbitalElements {
  L0: number;   // mean longitude at J2000 (deg)
  L1: number;   // mean motion (deg/day)
  a: number;    // semi-major axis (AU)
  e: number;    // eccentricity
  i: number;    // inclination (deg)
  Om: number;   // longitude of ascending node (deg)
  wp: number;   // longitude of perihelion ω̃ (deg)
}

const PLANET_ELEMENTS: Record<string, OrbitalElements> = {
  Budha:   { L0: 252.2509, L1: 4.09233445, a: 0.387098, e: 0.205636, i: 7.005,  Om: 48.331,  wp: 77.456 },
  Shukra:  { L0: 181.9798, L1: 1.60213049, a: 0.723332, e: 0.006772, i: 3.395,  Om: 76.680,  wp: 131.602 },
  Mangala: { L0: 355.4533, L1: 0.52402068, a: 1.523679, e: 0.093401, i: 1.850,  Om: 49.558,  wp: 336.060 },
  Guru:    { L0: 34.3515,  L1: 0.08308529, a: 5.202603, e: 0.048498, i: 1.303,  Om: 100.464, wp: 14.331 },
  Shani:   { L0: 50.0774,  L1: 0.03344414, a: 9.554909, e: 0.055509, i: 2.489,  Om: 113.666, wp: 92.432 },
};

// Earth elements (for geocentric conversion)
const EARTH_EL: OrbitalElements = {
  L0: 100.4646, L1: 0.98560910, a: 1.000000, e: 0.016711, i: 0.000, Om: 0.0, wp: 102.937,
};

/**
 * Compute heliocentric ecliptic (x, y, z) in AU for a body.
 */
function heliocentricXYZ(el: OrbitalElements, d: number): { x: number; y: number; z: number } {
  // Mean longitude and anomaly
  const L = normalizeDeg(el.L0 + el.L1 * d);
  const w = normalizeDeg(el.wp - el.Om); // argument of perihelion
  const M = normalizeDeg(L - el.wp);    // mean anomaly
  const Mrad = M * DEG;

  // Solve Kepler's equation
  const E = solveKepler(Mrad, el.e);

  // True anomaly
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + el.e) * Math.sin(E / 2),
    Math.sqrt(1 - el.e) * Math.cos(E / 2)
  );

  // Heliocentric distance
  const r = el.a * (1 - el.e * Math.cos(E));

  // Heliocentric ecliptic coordinates
  const xp = r * Math.cos(nu + w * DEG);
  const yp = r * Math.sin(nu + w * DEG);

  // Rotate by inclination and ascending node
  const OmRad = el.Om * DEG;
  const iRad = el.i * DEG;

  const x = xp * Math.cos(OmRad) - yp * Math.cos(iRad) * Math.sin(OmRad);
  const y = xp * Math.sin(OmRad) + yp * Math.cos(iRad) * Math.cos(OmRad);
  const z = yp * Math.sin(iRad);

  return { x, y, z };
}

/**
 * Compute geocentric ecliptic longitude for a planet.
 */
function planetGeoLon(planetName: string, d: number): number {
  const el = PLANET_ELEMENTS[planetName];
  if (!el) return 0;

  const planetPos = heliocentricXYZ(el, d);
  const earthPos = heliocentricXYZ(EARTH_EL, d);

  // Geocentric vector
  const xg = planetPos.x - earthPos.x;
  const yg = planetPos.y - earthPos.y;

  return normalizeDeg(Math.atan2(yg, xg) * RAD);
}

// ─── Retrograde detection ───────────────────────────────────────────────────

function isRetrograde(planetName: string, jd: number): boolean {
  const d = daysSinceJ2000(jd);
  const lon1 = planetGeoLon(planetName, d - 1);
  const lon2 = planetGeoLon(planetName, d + 1);

  let diff = lon2 - lon1;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  return diff < 0;
}

// ─── Nakshatras ─────────────────────────────────────────────────────────────

const NAKSHATRAS = [
  'Ashvini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishtha',
  'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
];

function getNakshatra(longitude: number): { name: string; pada: number } {
  const normalizedLong = normalizeDeg(longitude);
  const nakshatraSpan = 360 / 27;
  const index = Math.floor(normalizedLong / nakshatraSpan);
  const remainder = normalizedLong - index * nakshatraSpan;
  const pada = Math.floor(remainder / (nakshatraSpan / 4)) + 1;
  return {
    name: NAKSHATRAS[index] || 'Ashvini',
    pada: Math.min(pada, 4),
  };
}

// ─── Vedic planet registry ──────────────────────────────────────────────────

const VEDIC_PLANETS = [
  { name: 'Surya',   sanskrit: 'सूर्य', type: 'star' },
  { name: 'Chandra', sanskrit: 'चन्द्र', type: 'moon' },
  { name: 'Mangala', sanskrit: 'मंगल', type: 'planet' },
  { name: 'Budha',   sanskrit: 'बुध', type: 'planet' },
  { name: 'Guru',    sanskrit: 'गुरु', type: 'planet' },
  { name: 'Shukra',  sanskrit: 'शुक्र', type: 'planet' },
  { name: 'Shani',   sanskrit: 'शनि', type: 'planet' },
  { name: 'Rahu',    sanskrit: 'राहु', type: 'node' },
] as const;

// ─── Public API ─────────────────────────────────────────────────────────────

export interface PlanetaryPosition {
  planet: string;
  sanskrit: string;
  longitude: number;
  nakshatra: string;
  nakshatraPada: number;
  retrograde: boolean;
}

export interface TransitFriction {
  type: 'conjunction' | 'opposition' | 'square' | 'trine';
  planet1: string;
  planet2: string;
  orb: number;
  severity: 'critical' | 'moderate' | 'subtle';
  psychologicalFriction: string;
  prescribedMicroSadhana: string;
}

export interface TransitGeometry {
  timestamp: string;
  positions: PlanetaryPosition[];
  frictions: TransitFriction[];
}

/**
 * Calculate current planetary positions.
 * Pure JS — no native dependencies.
 */
export function calculateCurrentPositions(date?: Date): PlanetaryPosition[] {
  const dt = date ?? new Date();
  const jd = toJD(dt);
  const T = julianCenturies(jd);
  const d = daysSinceJ2000(jd);

  const sunLon = sunLongitude(T);
  const moonLon = moonLongitude(T);
  const rahuLon = meanNode(T);

  return VEDIC_PLANETS.map(p => {
    let longitude: number;
    let retrograde = false;

    switch (p.name) {
      case 'Surya':
        longitude = sunLon;
        break;
      case 'Chandra':
        longitude = moonLon;
        break;
      case 'Rahu':
        longitude = rahuLon;
        break;
      default:
        longitude = planetGeoLon(p.name, d);
        retrograde = isRetrograde(p.name, jd);
        break;
    }

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
 */
export function identifyFrictions(
  natalMoonLongitude: number,
  date?: Date
): TransitFriction[] {
  const positions = calculateCurrentPositions(date);
  const frictions: TransitFriction[] = [];

  const saturn = positions.find(p => p.planet === 'Shani');
  if (!saturn) return frictions;

  const saturnMoonDist = angularDistance(saturn.longitude, natalMoonLongitude);

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

  const mars = positions.find(p => p.planet === 'Mangala');
  if (mars) {
    const marsMoonDist = angularDistance(mars.longitude, natalMoonLongitude);
    if (marsMoonDist <= 8 || (marsMoonDist >= 82 && marsMoonDist <= 98)) {
      frictions.push({
        type: 'square',
        planet1: 'Mangala',
        planet2: 'Chandra (Natal)',
        orb: Math.round(marsMoonDist * 10) / 10,
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

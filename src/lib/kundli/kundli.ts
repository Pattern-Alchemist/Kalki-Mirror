// =============================================================
// AUDIT #2 — Vedic birth chart (Kundli) calculation
// -------------------------------------------------------------
// Computes the Vedic (sidereal) birth chart from birth data:
//   · 9 graha positions (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu)
//   · 12 bhāva (house) cusps (whole-sign houses)
//   · Lagna (ascendant) — the rising sign
//   · Nakṣatra (lunar mansion) of the Moon
//   · Navāṃśa (D9) — the most important divisional chart
//
// Uses the Lahiri (Chitrapaksha) ayanāṃśa.
// Planetary positions computed via astronomy-engine (MIT, pure TS).
// All computation is in-browser — zero server calls, zero API cost.
// =============================================================

import { Body, EclipticLongitude, Observer, SiderealTime } from "astronomy-engine";

// Lahiri ayanāṃśa for 2026 (precesses ~50.3 arcsec/year)
const LAHIRI_AYANAMSA_2026 = 24.21;

export const RASI_NAMES = [
  'Mesha (Aries)', 'Vrishabha (Taurus)', 'Mithuna (Gemini)', 'Karkataka (Cancer)',
  'Simha (Leo)', 'Kanya (Virgo)', 'Tula (Libra)', 'Vrischika (Scorpio)',
  'Dhanus (Sagittarius)', 'Makara (Capricorn)', 'Kumbha (Aquarius)', 'Meena (Pisces)',
] as const;

export const RASI_SHORT = [
  'Ari', 'Tau', 'Gem', 'Cnc', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis',
];

export const NAKSHATRA_NAMES = [
  'Ashvini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva-Phalguni', 'Uttara-Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula', 'Purva-Ashadha',
  'Uttara-Ashadha', 'Shravana', 'Dhanishtha', 'Shatabhishaj', 'Purva-Bhadrapada',
  'Uttara-Bhadrapada', 'Revati',
] as const;

export const GRAHA_NAMES = [
  'Sun (Surya)', 'Moon (Chandra)', 'Mars (Mangala)', 'Mercury (Budha)',
  'Jupiter (Guru)', 'Venus (Shukra)', 'Saturn (Shani)',
  'Rahu (North Node)', 'Ketu (South Node)',
] as const;

export interface BirthData {
  year: number;
  month: number; // 1-12
  day: number; // 1-31
  hour: number; // 0-23
  minute: number; // 0-59
  latitude: number;
  longitude: number;
  timezoneOffsetMinutes: number;
}

export interface PlanetPosition {
  graha: string;
  longitude: number;
  rasi: number;
  rasiLongitude: number;
  nakshatra: number;
  nakshatraPada: number;
  retrograde: boolean;
}

export interface KundliResult {
  lagna: number;
  lagnaLongitude: number;
  planets: PlanetPosition[];
  moonNakshatra: number;
  moonNakshatraPada: number;
  ayanamsa: number;
  birthData: BirthData;
  navamsa: Record<string, number>;
}

function toSidereal(tropicalLongitude: number): number {
  let sidereal = tropicalLongitude - LAHIRI_AYANAMSA_2026;
  while (sidereal < 0) sidereal += 360;
  while (sidereal >= 360) sidereal -= 360;
  return sidereal;
}

function getRasi(longitude: number): number {
  return Math.floor(longitude / 30) % 12;
}

function getNakshatra(longitude: number): number {
  return Math.floor(longitude / (360 / 27)) % 27;
}

function getNakshatraPada(longitude: number): number {
  const degInNakshatra = longitude % (360 / 27);
  return Math.floor(degInNakshatra / (360 / 27 / 4)) + 1;
}

function getNavamsaRasi(longitude: number): number {
  const rasi = getRasi(longitude);
  const degInSign = longitude % 30;
  const navamsaIndex = Math.floor(degInSign / (30 / 9));
  const rasiElementType = rasi % 3;
  const offset = rasiElementType === 0 ? rasi : rasiElementType === 1 ? (rasi + 8) % 12 : (rasi + 4) % 12;
  return (offset + navamsaIndex) % 12;
}

function computeLagna(date: Date, observer: Observer): number {
  const st = SiderealTime(date);
  const lst = st + (observer.longitude / 15);
  const ramc = lst * 15;
  const latRad = (observer.latitude * Math.PI) / 180;
  const obliquity = 23.44 * (Math.PI / 180);
  const ramcRad = (ramc * Math.PI) / 180;
  const y = Math.cos(ramcRad);
  const x = -(Math.sin(ramcRad) * Math.cos(obliquity) + Math.tan(latRad) * Math.sin(obliquity));
  let tropicalAscendant = (Math.atan2(y, x) * 180) / Math.PI;
  if (tropicalAscendant < 0) tropicalAscendant += 360;
  return toSidereal(tropicalAscendant);
}

export function computeKundli(birth: BirthData): KundliResult {
  const utcMs = Date.UTC(
    birth.year, birth.month - 1, birth.day,
    birth.hour, birth.minute, 0, 0,
  ) - birth.timezoneOffsetMinutes * 60 * 1000;
  const date = new Date(utcMs);
  const observer = new Observer(birth.latitude, birth.longitude, 0);

  const planetBodies: Array<{ graha: string; body: Body | null; isNode: boolean }> = [
    { graha: 'Sun (Surya)', body: Body.Sun, isNode: false },
    { graha: 'Moon (Chandra)', body: Body.Moon, isNode: false },
    { graha: 'Mars (Mangala)', body: Body.Mars, isNode: false },
    { graha: 'Mercury (Budha)', body: Body.Mercury, isNode: false },
    { graha: 'Jupiter (Guru)', body: Body.Jupiter, isNode: false },
    { graha: 'Venus (Shukra)', body: Body.Venus, isNode: false },
    { graha: 'Saturn (Shani)', body: Body.Saturn, isNode: false },
    { graha: 'Rahu (North Node)', body: null, isNode: true },
    { graha: 'Ketu (South Node)', body: null, isNode: true },
  ];

  const planets: PlanetPosition[] = [];

  for (const pb of planetBodies) {
    let tropicalLon: number;
    let retrograde = false;

    if (pb.isNode) {
      const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
      const daysSinceJ2000 = (date.getTime() - j2000.getTime()) / (1000 * 60 * 60 * 24);
      const rahuMeanMotion = -0.0529539;
      tropicalLon = (125.04 + rahuMeanMotion * daysSinceJ2000) % 360;
      if (tropicalLon < 0) tropicalLon += 360;
      retrograde = true;
      if (pb.graha.includes('Ketu')) {
        tropicalLon = (tropicalLon + 180) % 360;
      }
    } else if (pb.body !== null) {
      
      
      tropicalLon = ((EclipticLongitude(pb.body, date) % 360) + 360) % 360;
      const yesterday = new Date(date.getTime() - 86400000);
      
      
      const yesterdayLon = ((EclipticLongitude(pb.body, yesterday) % 360) + 360) % 360;
      const delta = (tropicalLon - yesterdayLon + 540) % 360 - 180;
      retrograde = delta < 0;
    } else {
      continue;
    }

    const siderealLon = toSidereal(tropicalLon);
    planets.push({
      graha: pb.graha,
      longitude: siderealLon,
      rasi: getRasi(siderealLon),
      rasiLongitude: siderealLon % 30,
      nakshatra: getNakshatra(siderealLon),
      nakshatraPada: getNakshatraPada(siderealLon),
      retrograde,
    });
  }

  const lagnaLongitude = computeLagna(date, observer);
  const lagna = getRasi(lagnaLongitude);
  const moon = planets.find(p => p.graha.includes('Moon'));
  const moonNakshatra = moon?.nakshatra ?? 0;
  const moonNakshatraPada = moon?.nakshatraPada ?? 1;

  const navamsa: Record<string, number> = {};
  for (const p of planets) {
    navamsa[p.graha] = getNavamsaRasi(p.longitude);
  }
  navamsa['Lagna'] = getNavamsaRasi(lagnaLongitude);

  return {
    lagna, lagnaLongitude, planets,
    moonNakshatra, moonNakshatraPada,
    ayanamsa: LAHIRI_AYANAMSA_2026,
    birthData: birth,
    navamsa,
  };
}

export function formatLongitude(lon: number): string {
  const deg = Math.floor(lon);
  const minFloat = (lon - deg) * 60;
  const min = Math.floor(minFloat);
  const sec = Math.floor((minFloat - min) * 60);
  return `${deg}°${min}'${sec}"`;
}

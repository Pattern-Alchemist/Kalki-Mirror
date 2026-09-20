"use client";

import { useState, useMemo } from "react";
import { computeKundli, RASI_NAMES, RASI_SHORT, NAKSHATRA_NAMES, GRAHA_NAMES, formatLongitude, type BirthData, type KundliResult } from "@/lib/kundli/kundli";
import { track } from "@/lib/analytics/track";
import Link from "next/link";

// =============================================================
// AUDIT #2 — Free Vedic Birth Chart (Kundli) Calculator
// -------------------------------------------------------------
// Lead magnet. Computes the chart in-browser (zero server calls)
// and gates the interpretation behind the membership tiers.
// The chart is free; the reading is paid.
// =============================================================

const COMMON_CITIES = [
  { label: "Mumbai", lat: 19.076, lon: 72.877, tz: 330 },
  { label: "Delhi", lat: 28.613, lon: 77.209, tz: 330 },
  { label: "Bengaluru", lat: 12.971, lon: 77.594, tz: 330 },
  { label: "Kolkata", lat: 22.572, lon: 88.363, tz: 330 },
  { label: "Chennai", lat: 13.082, lon: 80.270, tz: 330 },
  { label: "Austin, TX", lat: 30.267, lon: -97.743, tz: -300 },
  { label: "New York", lat: 40.712, lon: -74.006, tz: -300 },
  { label: "London", lat: 51.507, lon: -0.127, tz: 0 },
  { label: "Sydney", lat: -33.868, lon: 151.207, tz: 600 },
];

export default function KundliPage() {
  const [birth, setBirth] = useState<BirthData>({
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    minute: 0,
    latitude: 19.076,
    longitude: 72.877,
    timezoneOffsetMinutes: 330,
  });
  const [result, setResult] = useState<KundliResult | null>(null);
  const [error, setError] = useState("");
  const [city, setCity] = useState("Mumbai");

  const onCompute = () => {
    setError("");
    try {
      const r = computeKundli(birth);
      setResult(r);
      track("kundli_computed", { properties: { hasResult: true } } as any);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Calculation failed");
    }
  };

  const setCityData = (label: string) => {
    const c = COMMON_CITIES.find(c => c.label === label);
    if (c) {
      setCity(label);
      setBirth(prev => ({ ...prev, latitude: c.lat, longitude: c.lon, timezoneOffsetMinutes: c.tz }));
    }
  };

  return (
    <div className="bg-deep-black min-h-screen">
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 md:py-28">
        <Link href="/" className="inline-block text-text-secondary hover:text-gold transition-colors text-sm tracking-wide mb-8">
          ← Back to KALKI
        </Link>

        <header className="mb-12">
          <p className="section-label mb-4">Free Tool</p>
          <h1 className="font-display text-3xl md:text-5xl text-foreground leading-tight tracking-wide mb-4 hero-heading">
            Vedic Birth Chart Calculator
          </h1>
          <p className="text-text-secondary text-base editorial-spacing max-w-2xl">
            Compute your sidereal (Vedic) kundli in your browser — 9 graha positions, 12 bhāvas, nakṣatra, and navāṃśa (D9). No data leaves your device. The chart is free; the interpretation is a paid consultation.
          </p>
        </header>

        {/* Birth data form */}
        <section className="aw-card mb-12">
          <h2 className="font-display text-xl text-foreground mb-6">Birth Details</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Year</label>
              <input type="number" min={1900} max={2100} value={birth.year} onChange={e => setBirth({ ...birth, year: Number(e.target.value) })} className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Month</label>
              <select value={birth.month} onChange={e => setBirth({ ...birth, month: Number(e.target.value) })} className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground">
                {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Day</label>
              <input type="number" min={1} max={31} value={birth.day} onChange={e => setBirth({ ...birth, day: Number(e.target.value) })} className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Hour</label>
              <input type="number" min={0} max={23} value={birth.hour} onChange={e => setBirth({ ...birth, hour: Number(e.target.value) })} className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Minute</label>
              <input type="number" min={0} max={59} value={birth.minute} onChange={e => setBirth({ ...birth, minute: Number(e.target.value) })} className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">City (preset)</label>
              <select value={city} onChange={e => setCityData(e.target.value)} className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground">
                {COMMON_CITIES.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Latitude</label>
              <input type="number" step="0.001" value={birth.latitude} onChange={e => setBirth({ ...birth, latitude: Number(e.target.value) })} className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Longitude</label>
              <input type="number" step="0.001" value={birth.longitude} onChange={e => setBirth({ ...birth, longitude: Number(e.target.value) })} className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground" />
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">TZ Offset (min)</label>
              <input type="number" value={birth.timezoneOffsetMinutes} onChange={e => setBirth({ ...birth, timezoneOffsetMinutes: Number(e.target.value) })} className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          <button
            onClick={onCompute}
            className="mt-6 rounded-lg bg-gold/20 border border-gold/40 px-6 py-3 text-sm font-medium text-gold hover:bg-gold/30 transition-colors"
          >
            Calculate Chart
          </button>
        </section>

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Chart grid (North Indian style) */}
            <section className="aw-card">
              <h2 className="font-display text-xl text-foreground mb-4">Rāśi Chart (D1)</h2>
              <NorthIndianChart result={result} />
              <p className="text-xs text-text-secondary mt-4">
                Ayanāṃśa: Lahiri (Chitrapaksha) — {result.ayanamsa.toFixed(2)}° · Lagna: {RASI_NAMES[result.lagna]}
              </p>
            </section>

            {/* Planet positions table */}
            <section className="aw-card">
              <h2 className="font-display text-xl text-foreground mb-4">Graha Positions</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gold/20">
                      <th className="px-3 py-2 font-medium text-text-secondary">Graha</th>
                      <th className="px-3 py-2 font-medium text-text-secondary">Rāśi (Sign)</th>
                      <th className="px-3 py-2 font-medium text-text-secondary text-right">Longitude</th>
                      <th className="px-3 py-2 font-medium text-text-secondary">Nakṣatra</th>
                      <th className="px-3 py-2 font-medium text-text-secondary text-center">Pāda</th>
                      <th className="px-3 py-2 font-medium text-text-secondary text-center">Retro</th>
                      <th className="px-3 py-2 font-medium text-text-secondary">Navāṃśa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.planets.map(p => (
                      <tr key={p.graha} className="border-b border-gold/10">
                        <td className="px-3 py-2 text-foreground">{p.graha}</td>
                        <td className="px-3 py-2 text-gold">{RASI_NAMES[p.rasi]}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-text-secondary">{formatLongitude(p.longitude)}</td>
                        <td className="px-3 py-2 text-text-secondary">{NAKSHATRA_NAMES[p.nakshatra]}</td>
                        <td className="px-3 py-2 text-center tabular-nums text-text-secondary">{p.nakshatraPada}</td>
                        <td className="px-3 py-2 text-center">{p.retrograde ? <span className="text-amber-300 font-mono text-xs">R</span> : "—"}</td>
                        <td className="px-3 py-2 text-gold">{RASI_SHORT[result.navamsa[p.graha]]}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-gold/10">
                      <td className="px-3 py-2 text-foreground font-medium">Lagna (Ascendant)</td>
                      <td className="px-3 py-2 text-gold">{RASI_NAMES[result.lagna]}</td>
                      <td className="px-3 py-2 text-right tabular-nums text-text-secondary">{formatLongitude(result.lagnaLongitude)}</td>
                      <td className="px-3 py-2 text-text-secondary">{NAKSHATRA_NAMES[Math.floor(result.lagnaLongitude / (360 / 27)) % 27]}</td>
                      <td className="px-3 py-2 text-center tabular-nums text-text-secondary">{Math.floor((result.lagnaLongitude % (360 / 27)) / (360 / 27 / 4)) + 1}</td>
                      <td className="px-3 py-2 text-center">—</td>
                      <td className="px-3 py-2 text-gold">{RASI_SHORT[result.navamsa['Lagna']]}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Key insights */}
            <section className="aw-card">
              <h2 className="font-display text-xl text-foreground mb-4">Key Astrological Facts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-text-secondary">Lagna (Ascendant)</p>
                  <p className="text-lg text-gold font-display mt-1">{RASI_NAMES[result.lagna]}</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary">Moon Nakṣatra (Birth Star)</p>
                  <p className="text-lg text-gold font-display mt-1">
                    {NAKSHATRA_NAMES[result.moonNakshatra]} (Pāda {result.moonNakshatraPada})
                  </p>
                </div>
              </div>
            </section>

            {/* CTA — gate the interpretation */}
            <section className="aw-card border-gold/30 bg-gold/5">
              <h2 className="font-display text-xl text-foreground mb-3">Want a Full Reading?</h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                The chart above is the raw geometry. A Vedic reading interprets these positions — your karmic patterns, dhārmic path, relationship dynamics, career potential, and the sādhanā that dissolves your specific patterns.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/consultations"
                  className="rounded-lg bg-gold/20 border border-gold/40 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/30 transition-colors"
                >
                  Request a Consultation →
                </Link>
                <Link
                  href="/archetypes"
                  className="rounded-lg border border-gold/20 px-4 py-2 text-sm text-text-secondary hover:text-gold transition-colors"
                >
                  Take the Archetype Quiz
                </Link>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================
// North Indian chart grid (traditional diamond layout)
// =============================================================
function NorthIndianChart({ result }: { result: KundliResult }) {
  // North Indian chart: diamond-shaped, houses fixed in position
  // House 1 (Lagna) is top-center. Houses go clockwise.
  // The 12 houses map to fixed positions on the diamond grid.

  // Group planets by rasi
  const planetsByRasi = useMemo(() => {
    const map: Record<number, string[]> = {};
    for (const p of result.planets) {
      if (!map[p.rasi]) map[p.rasi] = [];
      const short = p.graha.split(' ')[0].slice(0, 2);
      map[p.rasi].push(short + (p.retrograde ? 'ᴿ' : ''));
    }
    return map;
  }, [result]);

  // North Indian chart house positions (rasi number → grid cell)
  // The chart is a diamond; the 12 houses are fixed in position.
  // House 1 (Lagna) is always the top-center diamond cell.
  // Houses 2-12 go clockwise from there.
  // For simplicity, we render a 4x4 grid with the diamond pattern.

  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-md aspect-square">
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Diamond outline */}
          <polygon points="200,20 380,200 200,380 20,200" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold/40" />
          {/* Inner lines — standard North Indian chart pattern */}
          <line x1="200" y1="20" x2="200" y2="380" stroke="currentColor" strokeWidth="1" className="text-gold/30" />
          <line x1="20" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" className="text-gold/30" />
          <line x1="110" y1="110" x2="290" y2="290" stroke="currentColor" strokeWidth="1" className="text-gold/30" />
          <line x1="290" y1="110" x2="110" y2="290" stroke="currentColor" strokeWidth="1" className="text-gold/30" />

          {/* House numbers + planet labels */}
          {/* The 12 houses are positioned clockwise starting from top-center (House 1 = Lagna) */}
          {/* For a North Indian chart, the house positions are FIXED; the rasi numbers rotate */}
          {/* We render the rasi number + any planets in each house */}

          {/* Center: 4 triangles for houses 2,3,11,12 (inner) */}
          {[
            { rasi: 0, x: 200, y: 110, label: '11' }, // top-center inner
            { rasi: 0, x: 200, y: 290, label: '5' },  // bottom-center inner
            { rasi: 0, x: 110, y: 200, label: '2' },  // left-center inner
            { rasi: 0, x: 290, y: 200, label: '8' },  // right-center inner
          ].map((cell, i) => (
            <text key={i} x={cell.x} y={cell.y} textAnchor="middle" dominantBaseline="middle" className="fill-gold/60 text-[10px] font-mono">
              {cell.label}
            </text>
          ))}

          {/* Outer houses: 1 (Lagna, top), 4 (right), 7 (bottom), 10 (left) */}
          {/* The rasi number in each house = the Lagna's rasi offset */}
          {[
            { house: 1, x: 200, y: 60, label: '1' },   // top
            { house: 4, x: 340, y: 200, label: '4' },   // right
            { house: 7, x: 200, y: 340, label: '7' },   // bottom
            { house: 10, x: 60, y: 200, label: '10' },  // left
          ].map((cell) => {
            const rasiInHouse = (result.lagna + cell.house - 1) % 12;
            const planets = planetsByRasi[rasiInHouse] || [];
            return (
              <g key={cell.house}>
                <text x={cell.x} y={cell.y - 8} textAnchor="middle" className="fill-gold/80 text-[10px] font-mono">
                  {rasiInHouse + 1}
                </text>
                {planets.length > 0 && (
                  <text x={cell.x} y={cell.y + 8} textAnchor="middle" className="fill-foreground text-[9px] font-mono">
                    {planets.join(' ')}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

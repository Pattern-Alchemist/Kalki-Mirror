"use client";

import { useState } from "react";
import { useAdminSWR } from "@/components/admin/use-admin-swr";
import Link from "next/link";

// =============================================================
// VOL. 2 #14 — Folio Corpus Visualizer
// -------------------------------------------------------------
// A treemap-style grid of the 327-chunk corpus grouped by slug
// (folio). Each cell is sized by chunk count + colored by max
// caution level. Hover shows sections + chunk count. Click goes
// to the folio filtered by that slug.
// =============================================================

interface SlugRow {
  slug: string;
  chunkCount: number;
  sections: string[];
  cautions: string[];
  maxCaution: 'OPEN' | 'MODERATE' | 'HIGH' | 'SEALED';
  archetype: string | null;
}

interface VisualizeResponse {
  total: number;
  slugs: SlugRow[];
  byCaution: [string, number][];
  bySection: [string, number][];
  byArchetype: [string, number][];
}

const CAUTION_COLOR: Record<string, string> = {
  OPEN: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
  MODERATE: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
  HIGH: 'bg-orange-500/15 border-orange-500/30 text-orange-300',
  SEALED: 'bg-red-500/15 border-red-500/30 text-red-300',
};

const CAUTION_DOT: Record<string, string> = {
  OPEN: 'bg-emerald-400',
  MODERATE: 'bg-amber-400',
  HIGH: 'bg-orange-400',
  SEALED: 'bg-red-400',
};

function StatBlock({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] p-3">
      <p className="text-[10px] uppercase tracking-wider text-[var(--aw-text-3)]">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-[var(--aw-text)]">{value}</p>
      {sub && <p className="mt-0.5 text-[10px] text-[var(--aw-text-3)]">{sub}</p>}
    </div>
  );
}

export default function FolioVisualizePage() {
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const { data, loading, error } = useAdminSWR<VisualizeResponse>({
    key: 'admin-folio-visualize',
    fetcher: async () => {
      const r = await fetch('/api/admin/folio/visualize');
      if (!r.ok) throw new Error('Failed to load visualize data');
      return r.json();
    },
    refreshInterval: 0, // static-ish data — no need for live refresh
    revalidateOnFocus: false,
  });

  const slugs = data?.slugs ?? [];
  const total = data?.total ?? 0;
  const byCaution = data?.byCaution ?? [];
  const bySection = data?.bySection ?? [];

  // Compute a font-size scale for the treemap: larger chunkCount → larger cell
  const maxChunks = slugs.length > 0 ? Math.max(...slugs.map(s => s.chunkCount)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--aw-text)]">Folio Corpus Visualizer</h1>
          <p className="mt-1 text-sm text-[var(--aw-text-2)]">
            Treemap of the {total}-chunk corpus, grouped by folio (slug). Cell size scales with chunk count; color = max caution level.
          </p>
        </div>
        <Link
          href="/admin/folio"
          className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-1.5 text-xs font-medium text-[var(--aw-text-2)] transition hover:text-[var(--aw-text)]"
        >
          ← Folio list
        </Link>
      </div>

      {loading && <p className="text-sm text-[var(--aw-text-2)]">Loading corpus…</p>}
      {error && <p className="text-red-400 text-sm">{error.message}</p>}

      {/* Top-line stats */}
      {data && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatBlock label="Total Chunks" value={total} />
          <StatBlock label="Folios (slugs)" value={slugs.length} sub={`avg ${(total / Math.max(slugs.length, 1)).toFixed(1)} chunks/folio`} />
          <StatBlock label="Sections" value={bySection.length} />
          <StatBlock label="Caution Levels" value={byCaution.length} />
        </div>
      )}

      {/* By Caution strip */}
      {byCaution.length > 0 && (
        <section className="aw-card">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">By Caution Level</h2>
          <div className="mt-3 space-y-2">
            {byCaution.map(([caution, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={caution} className="flex items-center gap-3">
                  <span className={`h-1.5 w-1.5 rounded-full ${CAUTION_DOT[caution] ?? 'bg-zinc-500'}`} />
                  <span className="w-20 text-xs text-[var(--aw-text-2)]">{caution}</span>
                  <div className="flex-1 h-2 rounded-full bg-[var(--aw-glass-1)]">
                    <div
                      className={`h-full rounded-full ${CAUTION_DOT[caution] ?? 'bg-zinc-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs tabular-nums text-[var(--aw-text-2)]">{count}</span>
                  <span className="w-10 text-right text-[10px] tabular-nums text-[var(--aw-text-3)]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* By Section strip */}
      {bySection.length > 0 && (
        <section className="aw-card">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">By Section</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {bySection.map(([section, count]) => (
              <div key={section} className="flex items-center justify-between rounded-lg border border-[var(--aw-border-2)]/60 bg-[var(--aw-glass-1)] px-3 py-1.5">
                <span className="text-xs text-[var(--aw-text-2)]">{section}</span>
                <span className="text-xs tabular-nums text-[var(--aw-text)]">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Treemap grid */}
      {slugs.length > 0 && (
        <section className="aw-card">
          <h2 className="text-xs font-medium uppercase tracking-wider text-[var(--aw-text-2)]">
            Folio Treemap — {slugs.length} folios
          </h2>
          <p className="mt-1 text-[10px] text-[var(--aw-text-3)]">
            Cell size scales with chunk count. Hover for details. Click to filter the folio list.
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {slugs.map(s => {
              // Scale font size by chunk count relative to max
              const scale = s.chunkCount / maxChunks; // 0..1
              const fontSize = 9 + Math.round(scale * 6); // 9px..15px
              const minW = 60 + Math.round(scale * 80); // 60..140px
              return (
                <a
                  key={s.slug}
                  href={`/admin/folio?q=${encodeURIComponent(s.slug)}`}
                  onMouseEnter={() => setHoveredSlug(s.slug)}
                  onMouseLeave={() => setHoveredSlug(null)}
                  className={`flex flex-col items-center justify-center rounded border px-2 py-1.5 transition hover:scale-105 hover:z-10 ${CAUTION_COLOR[s.maxCaution] ?? 'bg-zinc-800 border-zinc-700 text-[var(--aw-text-2)]'}`}
                  style={{ minWidth: `${minW}px`, minHeight: '36px', fontSize: `${fontSize}px` }}
                  title={`${s.slug} — ${s.chunkCount} chunk${s.chunkCount === 1 ? '' : 's'} · ${s.sections.join(', ')}`}
                >
                  <span className="font-medium text-center leading-tight truncate w-full">{s.slug}</span>
                  <span className="text-[9px] opacity-70 mt-0.5">{s.chunkCount}</span>
                </a>
              );
            })}
          </div>
          {hoveredSlug && (
            <div className="mt-3 rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] p-3">
              {(() => {
                const s = slugs.find(x => x.slug === hoveredSlug);
                if (!s) return null;
                return (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--aw-text-3)]">Folio</p>
                      <p className="text-xs font-mono text-[var(--aw-cyan)]">{s.slug}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--aw-text-3)]">Chunks</p>
                      <p className="text-xs text-[var(--aw-text)]">{s.chunkCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[var(--aw-text-3)]">Max Caution</p>
                      <p className="text-xs">
                        <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1 ${CAUTION_DOT[s.maxCaution]}`} />
                        {s.maxCaution}
                      </p>
                    </div>
                    <div className="sm:col-span-3">
                      <p className="text-[10px] uppercase tracking-wider text-[var(--aw-text-3)]">Sections</p>
                      <p className="text-xs text-[var(--aw-text-2)]">{s.sections.join(' · ')}</p>
                    </div>
                    {s.archetype && (
                      <div className="sm:col-span-3">
                        <p className="text-[10px] uppercase tracking-wider text-[var(--aw-text-3)]">Archetype</p>
                        <p className="text-xs text-[var(--aw-text-2)]">{s.archetype}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

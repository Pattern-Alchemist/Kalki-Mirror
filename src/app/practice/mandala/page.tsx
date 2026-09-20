"use client";

import { useState, useEffect } from "react";
import { allSiddhis } from "@/lib/data/siddhis";
import {
  getVows, startVow, markDayComplete, deleteVow, getVowProgress, generateCertificate,
  type Vow,
} from "@/lib/mandala/vow-tracker";

// =============================================================
// AUDIT2 #36 — 40-day Maṇḍala vow tracker
// -------------------------------------------------------------
// Pick a folio → start a 40-day vow → mark each day → earn a
// completion certificate. All client-side (localStorage).
// =============================================================

export default function MandalaPage() {
  const [vows, setVows] = useState<Vow[]>([]);
  const [selectedFolio, setSelectedFolio] = useState("");
  const [targetDays, setTargetDays] = useState(40);

  useEffect(() => {
    setVows(getVows());
  }, []);

  const refresh = () => setVows(getVows());

  const onStart = () => {
    if (!selectedFolio) return;
    const siddhi = allSiddhis.find(s => s.slug === selectedFolio);
    if (!siddhi) return;
    startVow(siddhi.slug, siddhi.name, targetDays);
    refresh();
  };

  const onMarkToday = (vowId: string) => {
    const today = new Date().toISOString().slice(0, 10);
    markDayComplete(vowId, today);
    refresh();
  };

  const onDelete = (vowId: string) => {
    if (!confirm('Delete this vow? This cannot be undone.')) return;
    deleteVow(vowId);
    refresh();
  };

  const onPrintCertificate = (vow: Vow) => {
    const html = generateCertificate(vow);
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  };

  return (
    <div className="bg-deep-black min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-20 md:py-28">
        <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4 hero-heading">
          40-Day Maṇḍala Vow
        </h1>
        <p className="text-text-secondary text-base editorial-spacing mb-12">
          Traditional sādhana runs in 40-day maṇḍala cycles. Commit to a folio, mark each day, and earn a completion certificate. All data stays in your browser.
        </p>

        {/* Start a new vow */}
        <section className="aw-card mb-12">
          <h2 className="font-display text-xl text-foreground mb-4">Start a New Vow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-text-secondary mb-1">Select a folio</label>
              <select
                value={selectedFolio}
                onChange={e => setSelectedFolio(e.target.value)}
                className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground"
              >
                <option value="">— Choose a siddhi —</option>
                {allSiddhis.map(s => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Duration (days)</label>
              <input
                type="number"
                min={7}
                max={108}
                value={targetDays}
                onChange={e => setTargetDays(Number(e.target.value))}
                className="w-full rounded-lg border border-gold/20 bg-black/40 px-3 py-2 text-sm text-foreground"
              />
            </div>
          </div>
          <button
            onClick={onStart}
            disabled={!selectedFolio}
            className="mt-4 rounded-lg bg-gold/20 border border-gold/40 px-4 py-2 text-sm font-medium text-gold hover:bg-gold/30 disabled:opacity-40 transition-colors"
          >
            Begin Vow
          </button>
        </section>

        {/* Active vows */}
        {vows.length === 0 ? (
          <p className="text-text-secondary text-sm">No active vows. Begin one above.</p>
        ) : (
          <div className="space-y-6">
            {vows.map(vow => {
              const progress = getVowProgress(vow);
              return (
                <div key={vow.id} className="aw-card">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-display text-lg text-foreground">{vow.folioName}</h3>
                      <p className="text-xs text-text-secondary mt-1">
                        Day {progress.currentDay} of {vow.targetDays} · Started {new Date(vow.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    {vow.completed && (
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                        ✓ Complete
                      </span>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                      <span>{progress.completedDays} days completed</span>
                      <span>{progress.percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-black/40 overflow-hidden">
                      <div
                        className="h-full bg-gold/60 rounded-full transition-all"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Day grid */}
                  <div className="grid grid-cols-10 gap-1 mb-4">
                    {Array.from({ length: vow.targetDays }, (_, i) => {
                      const day = vow.days.find(d => {
                        const dayNum = Math.floor((new Date(d.date).getTime() - new Date(vow.startDate).getTime()) / 86_400_000) + 1;
                        return dayNum === i + 1;
                      });
                      return (
                        <div
                          key={i}
                          className={`h-6 rounded text-[10px] flex items-center justify-center ${
                            day?.completed
                              ? 'bg-gold/40 text-deep-black'
                              : 'bg-zinc-800/40 text-text-muted'
                          }`}
                          title={`Day ${i + 1}`}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {!vow.completed && (
                      <button
                        onClick={() => onMarkToday(vow.id)}
                        className="rounded-lg bg-gold/20 border border-gold/40 px-3 py-1.5 text-xs text-gold hover:bg-gold/30 transition-colors"
                      >
                        ✓ Mark Today Complete
                      </button>
                    )}
                    {vow.completed && (
                      <button
                        onClick={() => onPrintCertificate(vow)}
                        className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs text-gold hover:bg-gold/20 transition-colors"
                      >
                        📜 Print Certificate
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(vow.id)}
                      className="ml-auto text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";

export default function FolioPage() {
  const [chunks, setChunks] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [sections, setSections] = useState<string[]>([]);
  const [cautions, setCautions] = useState<string[]>([]);
  const [section, setSection] = useState("");
  const [caution, setCaution] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  // Vol. 8 #20 — AI Playground
  const [showPlayground, setShowPlayground] = useState(false);
  const [pgQuery, setPgQuery] = useState("");
  const [pgAnswer, setPgAnswer] = useState<string | null>(null);
  const [pgLoading, setPgLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), section, caution, q });
      const r = await fetch(`/api/admin/folio?${params}`);
      if (!r.ok) throw new Error();
      const d = await r.json();
      setChunks(d.chunks); setTotal(d.total); setPages(d.pages);
      if (d.sections) setSections(d.sections);
      if (d.cautions) setCautions(d.cautions);
    } catch {} finally { setLoading(false); }
  }, [page, section, caution, q]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Vol. 8 #20 — AI Playground: ask a question, see the answer
  const runPlayground = async () => {
    if (!pgQuery.trim() || pgLoading) return;
    setPgLoading(true);
    setPgAnswer(null);
    try {
      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: pgQuery }),
      });
      const data = await res.json();
      if (data.grounded) {
        setPgAnswer(`✓ Grounded: ${data.answer}\n\nCitations: ${(data.citations || []).map((c: any) => c.slug).join(', ')}`);
      } else {
        setPgAnswer(`✗ ${data.reason || 'corpus_silent'} — the corpus is silent on this query.`);
      }
    } catch (e) {
      setPgAnswer(`Error: ${e instanceof Error ? e.message : 'unknown'}`);
    } finally {
      setPgLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--aw-text)]">Folio Corpus</h1>
          <p className="mt-1 text-sm text-[var(--aw-text-2)]">{total} chunks indexed</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Vol. 2 #14 — Visualizer link */}
          <a
            href="/admin/folio/visualize"
            className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-1.5 text-xs font-medium text-[var(--aw-text-2)] transition hover:text-[var(--aw-text)]"
            title="Vol. 2 #14 — Treemap of all folios by caution + chunk count"
          >
            🌐 Visualize
          </a>
          {/* Vol. 8 #20 — AI Playground toggle */}
          <button
            onClick={() => setShowPlayground(!showPlayground)}
            className={showPlayground ? "aw-btn aw-btn-primary text-xs" : "aw-btn aw-btn-ghost text-xs"}
          >
          {showPlayground ? '✦ Playground Active' : '✦ AI Playground'}
        </button>
        </div>
      </div>

      {/* Vol. 8 #20 — AI Playground */}
      {showPlayground && (
        <div className="aw-card p-5 aw-scanline" data-tour="folio-playground">
          <div className="flex items-center gap-2 mb-3">
            <span className="aw-hud-dot aw-hud-dot--ok" />
            <h2 className="aw-mono text-[10px] uppercase tracking-[0.15em] text-[var(--aw-text-3)]">AI PLAYGROUND</h2>
          </div>
          <p className="text-sm text-[var(--aw-text-2)] mb-3">Ask a question — see what the corpus knows. This uses the live /api/ai/ask route.</p>
          <div className="flex gap-2 mb-3">
            <input
              value={pgQuery}
              onChange={(e) => setPgQuery(e.target.value)}
              placeholder="What is the gayatri mantra?"
              className="aw-input flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter') runPlayground(); }}
            />
            <button onClick={runPlayground} disabled={pgLoading || !pgQuery.trim()} className="aw-btn aw-btn-primary text-xs disabled:opacity-40">
              {pgLoading ? 'Thinking...' : 'Ask'}
            </button>
          </div>
          {pgAnswer && (
            <div className="p-3 rounded-lg bg-[var(--aw-bg)] border border-[var(--aw-border)]">
              <pre className="text-xs text-[var(--aw-text-2)] whitespace-pre-wrap font-sans">{pgAnswer}</pre>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <select value={section} onChange={e => { setSection(e.target.value); setPage(1); }} className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-2 text-sm text-[var(--aw-text)]">
          <option value="">All Sections</option>
          {sections.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={caution} onChange={e => { setCaution(e.target.value); setPage(1); }} className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-2 text-sm text-[var(--aw-text)]">
          <option value="">All Cautions</option>
          {cautions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="text" placeholder="Search text..." value={q} onChange={e => { setQ(e.target.value); setPage(1); }} className="flex-1 min-w-[200px] aw-input" />
      </div>
      {loading && <p className="text-[var(--aw-text-2)] text-sm">Loading...</p>}
      <div className="space-y-3">
        {chunks.map(c => (
          <div key={c.id} className="aw-card">
            <div className="flex items-start justify-between">
              <div><p className="aw-mono text-xs text-[var(--aw-cyan)]">{c.slug}</p><p className="mt-1 text-xs text-[var(--aw-text-2)]">Section: {c.section} / Caution: {c.caution}</p></div>
            </div>
            <p className="mt-2 text-sm text-[var(--aw-text-2)] line-clamp-3">{c.text}</p>
          </div>
        ))}
      </div>
      {pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-[var(--aw-text-2)] hover:text-[var(--aw-text-2)]"}`}>{p}</button>)}</div>}
    </div>
  );
}

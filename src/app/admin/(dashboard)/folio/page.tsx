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

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-zinc-100">Folio Corpus</h1><p className="mt-1 text-sm text-zinc-500">{total} chunks indexed</p></div>
      <div className="flex flex-wrap gap-2">
        <select value={section} onChange={e => { setSection(e.target.value); setPage(1); }} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200">
          <option value="">All Sections</option>
          {sections.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={caution} onChange={e => { setCaution(e.target.value); setPage(1); }} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200">
          <option value="">All Cautions</option>
          {cautions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="text" placeholder="Search text..." value={q} onChange={e => { setQ(e.target.value); setPage(1); }} className="flex-1 min-w-[200px] rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600" />
      </div>
      {loading && <p className="text-zinc-500 text-sm">Loading...</p>}
      <div className="space-y-3">
        {chunks.map(c => (
          <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-start justify-between">
              <div><p className="font-mono text-xs text-amber-400">{c.slug}</p><p className="mt-1 text-xs text-zinc-500">Section: {c.section} / Caution: {c.caution}</p></div>
            </div>
            <p className="mt-2 text-sm text-zinc-400 line-clamp-3">{c.text}</p>
          </div>
        ))}
      </div>
      {pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-zinc-500 hover:text-zinc-300"}`}>{p}</button>)}</div>}
    </div>
  );
}

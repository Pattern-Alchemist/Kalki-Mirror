"use client";
import { useEffect, useState, useCallback } from "react";

const TYPES = ["ALL", "practice", "archetype", "pattern", "research", "codex"];
const STATUSES = ["ALL", "DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];
const STATUS_COLOR: Record<string, string> = { DRAFT: "text-zinc-400", IN_REVIEW: "text-amber-400", PUBLISHED: "text-emerald-400", ARCHIVED: "text-zinc-600" };

export default function ContentPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/content?type=${type}&status=${status}&page=${page}`);
      if (!r.ok) throw new Error();
      const d = await r.json(); setEntries(d.entries); setTotal(d.total); setPages(d.pages);
    } catch {} finally { setLoading(false); }
  }, [type, status, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-zinc-100">Content Studio</h1><p className="mt-1 text-sm text-zinc-500">{total} content entries</p></div>
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">{TYPES.map(t => <button key={t} onClick={() => { setType(t); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${type === t ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-zinc-500 border border-zinc-800"}`}>{t}</button>)}</div>
        <div className="flex gap-1">{STATUSES.map(s => <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${status === s ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-zinc-500 border border-zinc-800"}`}>{s}</button>)}</div>
      </div>
      {loading && <p className="text-zinc-500 text-sm">Loading...</p>}
      <div className="space-y-3">
        {entries.map(e => (
          <div key={e.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-start justify-between">
              <div><p className="font-medium text-zinc-200">{e.title}</p><p className="mt-0.5 text-xs text-zinc-500">/{e.type}/{e.slug}</p></div>
              <span className={`text-xs font-medium ${STATUS_COLOR[e.status] || "text-zinc-400"}`}>{e.status}</span>
            </div>
            {e.excerpt && <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{e.excerpt}</p>}
            <p className="mt-2 text-xs text-zinc-600">Updated {new Date(e.updatedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      {pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-zinc-500 hover:text-zinc-300"}`}>{p}</button>)}</div>}
    </div>
  );
}

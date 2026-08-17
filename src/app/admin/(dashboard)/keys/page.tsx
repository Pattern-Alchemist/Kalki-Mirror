"use client";
import { useEffect, useState, useCallback } from "react";

export default function KeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/keys?query=${encodeURIComponent(query)}&page=${page}`);
      if (!r.ok) throw new Error();
      const d = await r.json(); setKeys(d.keys); setTotal(d.total); setPages(d.pages);
    } catch {} finally { setLoading(false); }
  }, [query, page]);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-zinc-100">Golden Keys</h1><p className="mt-1 text-sm text-zinc-500">{total} invite codes</p></div>
      <input type="text" placeholder="Search code or creator..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none" />
      {loading && <p className="text-zinc-500 text-sm">Loading...</p>}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-zinc-800 bg-zinc-900/50">
            <th className="px-4 py-3 font-medium text-zinc-500">Code</th>
            <th className="px-4 py-3 font-medium text-zinc-500">Tier</th>
            <th className="px-4 py-3 font-medium text-zinc-500">Uses</th>
            <th className="px-4 py-3 font-medium text-zinc-500">Active</th>
            <th className="px-4 py-3 font-medium text-zinc-500">Created</th>
          </tr></thead>
          <tbody className="divide-y divide-zinc-800/50">
            {keys.map(k => (
              <tr key={k.id} className="transition hover:bg-zinc-900/30">
                <td className="px-4 py-3 font-mono text-xs text-amber-400">{k.code}</td>
                <td className="px-4 py-3 text-zinc-300 text-xs">{k.tierGranted}</td>
                <td className="px-4 py-3 tabular-nums text-zinc-400 text-xs">{k._count.usages}/{k.maxUses}</td>
                <td className="px-4 py-3">{k.active ? <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" /> : <span className="inline-flex h-2 w-2 rounded-full bg-zinc-600" />}</td>
                <td className="px-4 py-3 text-xs text-zinc-500">{new Date(k.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-zinc-500 hover:text-zinc-300"}`}>{p}</button>)}</div>}
    </div>
  );
}

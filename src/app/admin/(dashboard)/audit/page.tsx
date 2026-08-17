"use client";
import { useEffect, useState, useCallback } from "react";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/audit-logs?page=${page}`);
      if (!r.ok) throw new Error();
      const d = await r.json(); setLogs(d.logs); setTotal(d.total); setPages(d.pages);
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-zinc-100">Audit Log</h1><p className="mt-1 text-sm text-zinc-500">{total} total events</p></div>
      {loading && <p className="text-zinc-500 text-sm">Loading...</p>}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-zinc-800 bg-zinc-900/50">
            <th className="px-4 py-3 font-medium text-zinc-500">Time</th>
            <th className="px-4 py-3 font-medium text-zinc-500">Actor</th>
            <th className="px-4 py-3 font-medium text-zinc-500">Action</th>
            <th className="px-4 py-3 font-medium text-zinc-500">Entity</th>
            <th className="px-4 py-3 font-medium text-zinc-500">Details</th>
          </tr></thead>
          <tbody className="divide-y divide-zinc-800/50">
            {logs.map(l => (
              <tr key={l.id} className="transition hover:bg-zinc-900/30">
                <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-zinc-300 text-xs">{l.actor?.name || l.actor?.email || l.actorId?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-amber-400 text-xs font-mono">{l.action}</td>
                <td className="px-4 py-3 text-zinc-400 text-xs">{l.entity}{l.entityId ? ` / ${l.entityId.slice(0, 8)}` : ""}</td>
                <td className="px-4 py-3 text-zinc-600 text-xs max-w-[200px] truncate">{l.after ? JSON.stringify(l.after).slice(0, 60) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-zinc-500 hover:text-zinc-300"}`}>{p}</button>)}</div>}
    </div>
  );
}

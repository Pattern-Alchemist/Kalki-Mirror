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
      <div><h1 className="text-2xl font-semibold text-[var(--aw-text)]">Audit Log</h1><p className="mt-1 text-sm text-[var(--aw-text-2)]">{total} total events</p></div>
      {loading && <p className="text-[var(--aw-text-2)] text-sm">Loading...</p>}
      <div className="overflow-x-auto aw-table">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]">
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Time</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Actor</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Action</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Entity</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Details</th>
          </tr></thead>
          <tbody className="divide-y divide-zinc-800/50">
            {logs.map(l => (
              <tr key={l.id} className="transition hover:bg-[var(--aw-glass-1)]/30">
                <td className="px-4 py-3 text-xs text-[var(--aw-text-2)] whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3 text-[var(--aw-text-2)] text-xs">{l.actor?.name || l.actor?.email || l.actorId?.slice(0, 8)}</td>
                <td className="px-4 py-3 text-[var(--aw-cyan)] text-xs font-mono">{l.action}</td>
                <td className="px-4 py-3 text-[var(--aw-text-2)] text-xs">{l.entity}{l.entityId ? ` / ${l.entityId.slice(0, 8)}` : ""}</td>
                <td className="px-4 py-3 text-[var(--aw-text-3)] text-xs max-w-[200px] truncate">{l.after ? JSON.stringify(l.after).slice(0, 60) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-[var(--aw-text-2)] hover:text-[var(--aw-text-2)]"}`}>{p}</button>)}</div>}
    </div>
  );
}

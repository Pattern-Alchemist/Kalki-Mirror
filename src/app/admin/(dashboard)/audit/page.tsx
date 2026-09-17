"use client";
import { useEffect, useState, useCallback } from "react";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filterActor, setFilterActor] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/audit-logs?page=${page}`);
      if (!r.ok) throw new Error();
      const d = await r.json(); setLogs(d.logs); setTotal(d.total); setPages(d.pages);
    } catch {} finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Vol. 8 #18 — client-side filters + diff viewer
  const filteredLogs = logs.filter(l => {
    if (filterActor) {
      const actorName = l.actor?.name || l.actor?.email || l.actorId || '';
      if (!actorName.toLowerCase().includes(filterActor.toLowerCase())) return false;
    }
    if (filterAction && !l.action?.toLowerCase().includes(filterAction.toLowerCase())) return false;
    return true;
  });

  // Get unique actors + actions for filter chips
  const uniqueActors = [...new Set(logs.map(l => l.actor?.name || l.actor?.email || '').filter(Boolean))];
  const uniqueActions = [...new Set(logs.map(l => l.action).filter(Boolean))].slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--aw-text)]">Audit Log</h1>
        <p className="mt-1 text-sm text-[var(--aw-text-2)]">{total} total events · {filteredLogs.length} shown</p>
      </div>

      {/* Vol. 8 #18 — Filter bar */}
      <div className="aw-card p-3 flex flex-wrap items-center gap-2">
        <input
          value={filterActor}
          onChange={(e) => setFilterActor(e.target.value)}
          placeholder="Filter by actor…"
          className="aw-input text-xs flex-1 min-w-[150px]"
        />
        <input
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          placeholder="Filter by action…"
          className="aw-input text-xs flex-1 min-w-[150px]"
        />
        {(filterActor || filterAction) && (
          <button onClick={() => { setFilterActor(''); setFilterAction(''); }} className="aw-btn aw-btn-ghost text-[10px]">Clear</button>
        )}
      </div>

      {/* Action filter chips */}
      {uniqueActions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {uniqueActions.map(a => (
            <button
              key={a}
              onClick={() => setFilterAction(filterAction === a ? '' : a)}
              className={`aw-badge text-[8px] cursor-pointer transition ${filterAction === a ? 'aw-badge--info' : 'opacity-50 hover:opacity-100'}`}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      {loading && <p className="text-[var(--aw-text-2)] text-sm">Loading...</p>}

      {/* Vol. 8 #18 — Expandable diff table */}
      <div className="overflow-x-auto aw-table">
        <table className="w-full text-left text-sm">
          <thead><tr>
            <th scope="col" className="px-4 py-3">Time</th>
            <th scope="col" className="px-4 py-3">Actor</th>
            <th scope="col" className="px-4 py-3">Action</th>
            <th scope="col" className="px-4 py-3">Entity</th>
            <th scope="col" className="px-4 py-3">Details</th>
          </tr></thead>
          <tbody>
            {filteredLogs.map(l => (
              <>
                <tr key={l.id} className="transition hover:bg-[var(--aw-glass-1)]/30 cursor-pointer" onClick={() => setExpandedRow(expandedRow === l.id ? null : l.id)}>
                  <td className="px-4 py-3 text-xs text-[var(--aw-text-2)] whitespace-nowrap">{new Date(l.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                  <td className="px-4 py-3 text-[var(--aw-text-2)] text-xs">{l.actor?.name || l.actor?.email || l.actorId?.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-[var(--aw-cyan)] text-xs font-mono">{l.action}</td>
                  <td className="px-4 py-3 text-[var(--aw-text-2)] text-xs">{l.entity}{l.entityId ? ` / ${l.entityId.slice(0, 8)}` : ""}</td>
                  <td className="px-4 py-3 text-[var(--aw-text-3)] text-xs max-w-[200px] truncate">
                    {l.after ? JSON.stringify(l.after).slice(0, 60) : "-"}
                    {(l.before || l.after) && <span className="ml-1 text-[var(--aw-cyan)]">{expandedRow === l.id ? '▲' : '▼'}</span>}
                  </td>
                </tr>
                {expandedRow === l.id && (l.before || l.after) && (
                  <tr key={l.id + '-diff'} className="bg-[var(--aw-glass-1)]/40">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {l.before && (
                          <div>
                            <p className="aw-mono text-[10px] uppercase tracking-wider text-[var(--aw-danger)] mb-1">Before</p>
                            <pre className="text-[10px] aw-mono text-[var(--aw-text-2)] bg-[var(--aw-bg)] p-2 rounded overflow-x-auto max-h-[200px]">{JSON.stringify(l.before, null, 2)}</pre>
                          </div>
                        )}
                        {l.after && (
                          <div>
                            <p className="aw-mono text-[10px] uppercase tracking-wider text-[var(--aw-success)] mb-1">After</p>
                            <pre className="text-[10px] aw-mono text-[var(--aw-text-2)] bg-[var(--aw-bg)] p-2 rounded overflow-x-auto max-h-[200px]">{JSON.stringify(l.after, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-[var(--aw-text-2)] hover:text-[var(--aw-text-2)]"}`}>{p}</button>)}</div>}
    </div>
  );
}

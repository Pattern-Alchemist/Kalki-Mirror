"use client";
import { useEffect, useState, useCallback } from "react";

const STATUSES = ["ALL", "NEW", "ACKNOWLEDGED", "SCHEDULED", "COMPLETED", "CANCELLED"];
const STATUS_COLOR: Record<string, string> = { NEW: "bg-blue-500/10 text-blue-400", ACKNOWLEDGED: "bg-amber-500/10 text-amber-400", SCHEDULED: "bg-violet-500/10 text-violet-400", COMPLETED: "bg-emerald-500/10 text-emerald-400", CANCELLED: "bg-zinc-500/10 text-zinc-400" };

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/consultations?status=${status}&page=${page}`);
      if (!r.ok) throw new Error();
      const d = await r.json(); setConsultations(d.consultations); setTotal(d.total); setPages(d.pages);
    } catch {} finally { setLoading(false); }
  }, [status, page]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-zinc-100">Consultations</h1><p className="mt-1 text-sm text-zinc-500">{total} total consultations</p></div>
      <div className="flex flex-wrap gap-1">
        {STATUSES.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${status === s ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-zinc-500 border border-zinc-800 hover:text-zinc-300"}`}>{s}</button>
        ))}
      </div>
      {loading && <p className="text-zinc-500 text-sm">Loading...</p>}
      <div className="space-y-3">
        {consultations.map(c => (
          <div key={c.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-zinc-200">{c.name}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{c.email} {c.phone ? `/ ${c.phone}` : ""}</p>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[c.status] || "text-zinc-400"}`}>{c.status}</span>
            </div>
            <p className="mt-3 text-sm text-zinc-400 line-clamp-2">{c.request}</p>
            {c.scheduledFor && <p className="mt-2 text-xs text-zinc-500">Scheduled: {new Date(c.scheduledFor).toLocaleString()}</p>}
            <p className="mt-2 text-xs text-zinc-600">Received {new Date(c.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      {pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-zinc-500 hover:text-zinc-300"}`}>{p}</button>)}</div>}
    </div>
  );
}

"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

const TIERS = ["ALL", "prithvi", "jal", "agni", "akash"];

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), query, tier });
      const r = await fetch(`/api/admin/members?${params}`);
      if (!r.ok) throw new Error(await r.text());
      const d = await r.json();
      setMembers(d.members);
      setTotal(d.total);
      setPages(d.pages);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, [page, query, tier]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const TIER_BADGE: Record<string, string> = { prithvi: "bg-emerald-500/10 text-emerald-400", jal: "bg-blue-500/10 text-blue-400", agni: "bg-orange-500/10 text-orange-400", akash: "bg-violet-500/10 text-violet-400" };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-[var(--aw-text)]">Members</h1><p className="mt-1 text-sm text-[var(--aw-text-2)]">{total} registered members</p></div>

      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search email, name, ID..." value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} className="flex-1 min-w-[200px] rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-2 text-sm text-[var(--aw-text)] placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none" />
        <div className="flex gap-1">
          {TIERS.map(t => (
            <button key={t} onClick={() => { setTier(t); setPage(1); }} className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${tier === t ? "bg-amber-500/20 text-[var(--aw-cyan)] border border-[var(--aw-border-2)]" : "text-[var(--aw-text-2)] border border-[var(--aw-border-2)] hover:text-[var(--aw-text-2)]"}`}>{t}</button>
          ))}
        </div>
      </div>

      {err && <p className="text-red-400 text-sm">{err}</p>}
      {loading && <p className="text-[var(--aw-text-2)] text-sm">Loading...</p>}

      <div className="overflow-x-auto aw-table">
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]">
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Email</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Name</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Tier</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Role</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Streaks</th>
            <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Joined</th>
          </tr></thead>
          <tbody className="divide-y divide-zinc-800/50">
            {members.map(m => (
              <tr key={m.id} className="transition hover:bg-[var(--aw-glass-1)]/30">
                <td className="px-4 py-3"><Link href={`/admin/members/${m.id}`} className="text-[var(--aw-cyan)] hover:text-amber-300">{m.email}</Link></td>
                <td className="px-4 py-3 text-[var(--aw-text-2)]">{m.name || "-"}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIER_BADGE[m.tier] || "text-[var(--aw-text-2)]"}`}>{m.tier}</span></td>
                <td className="px-4 py-3 text-[var(--aw-text-2)] text-xs">{m.role}</td>
                <td className="px-4 py-3 tabular-nums text-[var(--aw-text-2)]">{m._count.streaks}</td>
                <td className="px-4 py-3 text-xs text-[var(--aw-text-2)]">{new Date(m.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).slice(Math.max(0, page - 3), page + 2).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-[var(--aw-text-2)] hover:text-[var(--aw-text-2)]"}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}

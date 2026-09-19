"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SeekerJourneyTimeline } from "./SeekerJourneyTimeline";

const TIER_BADGE: Record<string, string> = { prithvi: "bg-emerald-500/10 text-emerald-400", jal: "bg-blue-500/10 text-blue-400", agni: "bg-orange-500/10 text-orange-400", akash: "bg-violet-500/10 text-violet-400" };

function Field({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  return <div><dt className="text-xs text-[var(--aw-text-2)]">{label}</dt><dd className={`mt-0.5 text-sm text-[var(--aw-text)] ${mono ? "font-mono text-xs text-[var(--aw-text-2)] break-all" : ""}`}>{value || "-"}</dd></div>;
}

export default function MemberDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch(`/api/admin/members/${id}`)
      .then(r => { if (!r.ok) throw new Error("Not found"); return r.json(); })
      .then(d => setData(d))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-[var(--aw-text-2)]">Loading member...</div>;
  if (err || !data?.user) return <div className="text-center py-20"><p className="text-red-400">{err || "Member not found"}</p><Link href="/admin/members" className="mt-4 inline-block text-[var(--aw-cyan)] hover:text-amber-300 text-sm">Back to Members</Link></div>;

  const u = data.user;
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Link href="/admin/members" className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--aw-text-2)] hover:text-[var(--aw-cyan)]">Back to Members</Link>
        <div className="flex flex-wrap items-center gap-3">
          <div><h1 className="text-2xl font-semibold text-[var(--aw-text)]">{u.name || "Unnamed"}</h1><p className="mt-1 text-sm text-[var(--aw-text-2)]">{u.email}</p></div>
          <span className="rounded-full bg-[rgba(0,240,255,0.08)] px-2.5 py-0.5 text-xs font-medium text-[var(--aw-cyan)]">{u.role}</span>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TIER_BADGE[u.tier] || "text-[var(--aw-text-2)]"}`}>{u.tier}</span>
        </div>
      </div>

      <section className="aw-card">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Profile</h2>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="ID" value={u.id} mono />
          <Field label="Email" value={u.email} />
          <Field label="Name" value={u.name} />
          <Field label="Tier" value={u.tier} />
          <Field label="Role" value={u.role} />
          <Field label="Gold Keys Remaining" value={String(u.goldKeysRemaining)} />
          <Field label="Created At" value={new Date(u.createdAt).toLocaleString()} />
          <Field label="Invited By Code" value={u.invitedByCode} />
        </div>
      </section>

      {u.streaks?.length > 0 && (
        <section className="aw-card">
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--aw-text-2)]">Sadhana Streaks</h2>
          <div className="overflow-x-auto aw-table">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]">
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Practice</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Current</th>
                <th scope="col" className="px-4 py-3 font-medium text-[var(--aw-text-2)]">Longest</th>
              </tr></thead>
              <tbody className="divide-y divide-zinc-800/50">
                {u.streaks.map((s: any) => (
                  <tr key={s.id} className="hover:bg-[var(--aw-glass-1)]/30">
                    <td className="px-4 py-3 font-medium text-[var(--aw-text)]">{s.practiceName}</td>
                    <td className="px-4 py-3 tabular-nums text-[var(--aw-cyan)]">{s.currentStreak}</td>
                    <td className="px-4 py-3 tabular-nums text-[var(--aw-text-2)]">{s.longestStreak}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Vol. 2 #15 — Seeker Journey Timeline */}
      <SeekerJourneyTimeline seekerJourney={data.seekerJourney} timeline={data.timeline} />
    </div>
  );
}

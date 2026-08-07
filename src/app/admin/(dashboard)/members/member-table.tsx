"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateMemberTier, updateMemberRole, type MemberRow } from "./actions";

const TIERS = ["prithvi", "jal", "agni", "akash"];
const ROLES = ["USER", "EDITOR", "REVIEWER", "ADMIN", "SUPERADMIN"];

const TIER_BADGE: Record<string, string> = {
  prithvi: "bg-emerald-500/10 text-emerald-400",
  jal: "bg-blue-500/10 text-blue-400",
  agni: "bg-orange-500/10 text-orange-400",
  akash: "bg-violet-500/10 text-violet-400",
};

export function MemberTable({
  members,
  totalPages,
  currentPage,
  currentQuery,
  currentTier,
}: {
  members: MemberRow[];
  totalPages: number;
  currentPage: number;
  currentQuery: string;
  currentTier: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentQuery);
  const [tierFilter, setTierFilter] = useState(currentTier);

  function applyFilters() {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (tierFilter !== "ALL") params.set("tier", tierFilter);
    startTransition(() => router.push(`/admin/members?${params.toString()}`));
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by name, email, or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="w-72 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        />
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
        >
          <option value="ALL">All Tiers</option>
          {TIERS.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <button
          onClick={applyFilters}
          disabled={isPending}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-50"
        >
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-500">Member</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Tier</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Role</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Streaks</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Keys</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Joined</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {members.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-zinc-600">
                  No members found.
                </td>
              </tr>
            )}
            {members.map((m) => (
              <tr key={m.id} className="transition hover:bg-zinc-900/30">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-zinc-200">{m.name || "—"}</p>
                    <p className="text-xs text-zinc-500">{m.email}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <TierSelect userId={m.id} currentTier={m.tier} />
                </td>
                <td className="px-4 py-3">
                  <RoleSelect userId={m.id} currentRole={m.role} />
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-400">
                  {m._count.streaks}
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-400">
                  {m._count.keysGenerated}/{m._count.keysUsed}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {new Date(m.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button className="text-xs text-amber-500 hover:text-amber-400">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (search) params.set("q", search);
                  if (tierFilter !== "ALL") params.set("tier", tierFilter);
                  if (p > 1) params.set("page", String(p));
                  router.push(`/admin/members?${params.toString()}`);
                }}
                className={`rounded px-2.5 py-1 text-xs transition ${p === currentPage ? "bg-amber-500/10 text-amber-400" : "hover:bg-zinc-800 text-zinc-400"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TierSelect({ userId, currentTier }: { userId: string; currentTier: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      disabled={isPending}
      defaultValue={currentTier}
      onChange={(e) => {
        startTransition(async () => {
          await updateMemberTier(userId, e.target.value, "Admin manual change");
        });
      }}
      className={`rounded-md border-0 bg-transparent px-2 py-1 text-xs font-medium ${TIER_BADGE[currentTier] || "text-zinc-400"}`}
    >
      {TIERS.map((t) => (
        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
      ))}
    </select>
  );
}

function RoleSelect({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      disabled={isPending}
      defaultValue={currentRole}
      onChange={(e) => {
        startTransition(async () => {
          await updateMemberRole(userId, e.target.value, "Admin manual change");
        });
      }}
      className="rounded-md border-0 bg-transparent px-2 py-1 text-xs text-zinc-400"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  );
}

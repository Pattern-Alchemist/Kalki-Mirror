"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateKeys, revokeKey } from "./actions";

type KeyRow = {
  id: string;
  code: string;
  tierGranted: string;
  maxUses: number;
  usesUsed: number;
  expiresAt: Date | null;
  active: boolean;
  createdAt: Date;
  creator: { name: string | null; email: string } | null;
  _count: { usages: number };
};

export function KeysClient({
  initialKeys,
  totalPages,
  currentPage,
  query,
}: {
  initialKeys: KeyRow[];
  totalPages: number;
  currentPage: number;
  query: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showGen, setShowGen] = useState(false);
  const [genCount, setGenCount] = useState(1);
  const [genTier, setGenTier] = useState("jal");
  const [search, setSearch] = useState(query);

  function handleSearch() {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    startTransition(() => router.push(`/admin/keys?${params.toString()}`));
  }

  async function handleGenerate() {
    const form = new FormData();
    form.append("count", String(genCount));
    form.append("tier", genTier);
    form.append("maxUses", "1");
    startTransition(async () => {
      await generateKeys(genCount, genTier, 1);
      router.refresh();
      setShowGen(false);
    });
  }

  async function handleRevoke(id: string) {
    startTransition(async () => {
      await revokeKey(id);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search by code or creator ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="w-72 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        />
        <button onClick={handleSearch} disabled={isPending} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-50">
          Search
        </button>
        <button onClick={() => setShowGen(!showGen)} className="ml-auto rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-500">
          Generate Keys
        </button>
      </div>

      {/* Generator form */}
      {showGen && (
        <div className="flex flex-wrap items-end gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-400">Quantity</label>
            <input
              type="number" min={1} max={50} value={genCount}
              onChange={(e) => setGenCount(Number(e.target.value))}
              className="w-24 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-xs font-medium text-zinc-400">Grants Tier</label>
            <select value={genTier} onChange={(e) => setGenTier(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none">
              {["jal", "agni", "akash"].map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
            </select>
          </div>
          <button onClick={handleGenerate} disabled={isPending} className="rounded-lg bg-amber-600 px-6 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-500 disabled:opacity-50">
            {isPending ? "Generating…" : "Create"}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-500">Code</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Tier</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Uses</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Expires</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {initialKeys.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-600">No keys found.</td></tr>
            )}
            {initialKeys.map((k) => (
              <tr key={k.id} className="transition hover:bg-zinc-900/30">
                <td className="px-4 py-3">
                  <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-amber-400">
                    {k.code}
                  </code>
                </td>
                <td className="px-4 py-3 text-zinc-400 capitalize">{k.tierGranted}</td>
                <td className="px-4 py-3 tabular-nums text-zinc-400">{k._count.usages}/{k.maxUses}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${k.active ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                    {k.active ? "Active" : "Revoked"}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : "Never"}
                </td>
                <td className="px-4 py-3">
                  {k.active && (
                    <button onClick={() => handleRevoke(k.id)} disabled={isPending} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">
                      Revoke
                    </button>
                  )}
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
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((p, i, arr) => {
                const prev = arr[i - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <span key={p} className="flex items-center gap-2">
                    {showEllipsis && <span className="text-zinc-700">...</span>}
                    <button
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (search) params.set("q", search);
                        if (p > 1) params.set("page", String(p));
                        router.push(`/admin/keys?${params.toString()}`);
                      }}
                      className={`rounded px-2.5 py-1 text-xs transition ${p === currentPage ? "bg-amber-500/10 text-amber-400" : "hover:bg-zinc-800 text-zinc-400"}`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

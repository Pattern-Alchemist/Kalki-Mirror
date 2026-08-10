"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FolioChunkRow } from "./actions";

const CAUTION_STYLES: Record<string, string> = {
  OPEN: "bg-zinc-800 text-zinc-400",
  MODERATE: "bg-amber-500/10 text-amber-400",
  HIGH: "bg-orange-500/10 text-orange-400",
  SEALED: "bg-red-500/10 text-red-400",
};

export function FolioClient({
  initialChunks,
  totalPages,
  currentPage,
  currentSection,
  currentCaution,
  currentQ,
  sections,
  cautions,
}: {
  initialChunks: FolioChunkRow[];
  totalPages: number;
  currentPage: number;
  currentSection: string;
  currentCaution: string;
  currentQ: string;
  sections: string[];
  cautions: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sectionFilter, setSectionFilter] = useState(currentSection);
  const [cautionFilter, setCautionFilter] = useState(currentCaution);
  const [searchInput, setSearchInput] = useState(currentQ);

  function applyFilters() {
    const params = new URLSearchParams();
    if (sectionFilter) params.set("section", sectionFilter);
    if (cautionFilter) params.set("caution", cautionFilter);
    if (searchInput) params.set("q", searchInput);
    startTransition(() => router.push(`/admin/folio?${params.toString()}`));
  }

  function clearFilters() {
    setSectionFilter("");
    setCautionFilter("");
    setSearchInput("");
    startTransition(() => router.push("/admin/folio"));
  }

  function goToPage(p: number) {
    const params = new URLSearchParams();
    if (sectionFilter) params.set("section", sectionFilter);
    if (cautionFilter) params.set("caution", cautionFilter);
    if (searchInput) params.set("q", searchInput);
    if (p > 1) params.set("page", String(p));
    startTransition(() => router.push(`/admin/folio?${params.toString()}`));
  }

  const expandedChunk = expandedId
    ? initialChunks.find((c) => c.id === expandedId) ?? null
    : null;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
        >
          <option value="">All Sections</option>
          {sections.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={cautionFilter}
          onChange={(e) => setCautionFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
        >
          <option value="">All Cautions</option>
          {cautions.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search text..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="w-64 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none"
        />
        <button
          onClick={applyFilters}
          disabled={isPending}
          className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-50"
        >
          Filter
        </button>
        {(sectionFilter || cautionFilter || searchInput) && (
          <button
            onClick={clearFilters}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-sm text-zinc-500 transition hover:text-zinc-300 disabled:opacity-50"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className={`overflow-x-auto rounded-xl border border-zinc-800 transition-opacity ${isPending ? "opacity-50" : ""}`}>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-500">Slug</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Archetype</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Section</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Caution</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Text</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Embedding</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {initialChunks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-zinc-600">No corpus chunks found.</td>
              </tr>
            )}
            {initialChunks.map((chunk) => {
              const hasEmbedding = chunk.embedding && chunk.embedding !== "[]";
              return (
                <tr
                  key={chunk.id}
                  onClick={() => setExpandedId(expandedId === chunk.id ? null : chunk.id)}
                  className={`cursor-pointer transition hover:bg-zinc-900/30 ${expandedId === chunk.id ? "bg-zinc-900/50" : ""}`}
                >
                  <td className="max-w-[180px] truncate px-4 py-3 font-mono text-sm text-amber-400">{chunk.slug}</td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-zinc-400">{chunk.archetype || "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{chunk.section}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CAUTION_STYLES[chunk.caution] || CAUTION_STYLES.OPEN}`}>
                      {chunk.caution}
                    </span>
                  </td>
                  <td className="max-w-xs truncate px-4 py-3 text-zinc-500">
                    {chunk.text.length > 100 ? chunk.text.slice(0, 100) + "..." : chunk.text}
                  </td>
                  <td className="px-4 py-3">
                    {hasEmbedding ? (
                      <span className="text-emerald-400">yes</span>
                    ) : (
                      <span className="text-red-400">no</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Expanded detail panel */}
      {expandedChunk && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-zinc-600">Slug</p>
              <p className="text-sm font-mono text-amber-400">{expandedChunk.slug}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600">Archetype</p>
              <p className="text-sm text-zinc-200">{expandedChunk.archetype || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600">Section</p>
              <p className="text-sm text-zinc-200">{expandedChunk.section}</p>
            </div>
            <div>
              <p className="text-xs text-zinc-600">Caution</p>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${CAUTION_STYLES[expandedChunk.caution] || CAUTION_STYLES.OPEN}`}>
                {expandedChunk.caution}
              </span>
            </div>
            <div>
              <p className="text-xs text-zinc-600">Embedding</p>
              <p className="text-sm text-zinc-200">
                {expandedChunk.embedding && expandedChunk.embedding !== "[]"
                  ? `${expandedChunk.embedding.length} chars`
                  : "None"}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-zinc-600">Full Text</p>
            <p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{expandedChunk.text}</p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1 || isPending}
              className="rounded px-2.5 py-1 text-xs transition hover:bg-zinc-800 text-zinc-400 disabled:opacity-30"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((p, i, arr) => {
                const prev = arr[i - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <span key={p} className="flex items-center gap-2">
                    {showEllipsis && <span className="text-zinc-700">...</span>}
                    <button
                      onClick={() => goToPage(p)}
                      className={`rounded px-2.5 py-1 text-xs transition ${p === currentPage ? "bg-amber-500/10 text-amber-400" : "hover:bg-zinc-800 text-zinc-400"}`}
                    >
                      {p}
                    </button>
                  </span>
                );
              })}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages || isPending}
              className="rounded px-2.5 py-1 text-xs transition hover:bg-zinc-800 text-zinc-400 disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

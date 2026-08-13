"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId?: string | null;
  after?: string | null;
  createdAt: string;
  actor: { name: string | null; email: string | null } | null;
}

interface Props {
  initialLogs: AuditLog[];
 totalPages: number;
  currentPage: number;
  total: number;
}

export function AuditClient({ initialLogs, totalPages, currentPage, total }: Props) {
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  // Extract unique values for filters
  const uniqueActions = useMemo(() => {
    const set = new Set(initialLogs.map((l) => l.action));
    return Array.from(set).sort();
  }, [initialLogs]);

  const uniqueEntities = useMemo(() => {
    const set = new Set(initialLogs.map((l) => l.entity));
    return Array.from(set).sort();
  }, [initialLogs]);

  const filteredLogs = useMemo(() => {
    return initialLogs.filter((log) => {
      if (actionFilter && log.action !== actionFilter) return false;
      if (entityFilter && log.entity !== entityFilter) return false;
      return true;
    });
  }, [initialLogs, actionFilter, entityFilter]);

  return (
    <div className="space-y-4">
      {/* Filters — E5: audit log client-side filtering */}
      <div className="flex flex-wrap gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 focus:border-amber-500/50 focus:outline-none"
        >
          <option value="">All Actions ({initialLogs.length})</option>
          {uniqueActions.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 focus:border-amber-500/50 focus:outline-none"
        >
          <option value="">All Entities</option>
          {uniqueEntities.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        {(actionFilter || entityFilter) && (
          <button
            onClick={() => { setActionFilter(""); setEntityFilter(""); }}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition"
          >
            Clear filters ({filteredLogs.length} results)
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-500">Timestamp</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Actor</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Action</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Entity</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-600">
                  No audit events match the current filters.
                </td>
              </tr>
            )}
            {filteredLogs.map((log) => (
              <tr key={log.id} className="transition hover:bg-zinc-900/30">
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <p className="text-zinc-300">{log.actor?.name || "Unknown"}</p>
                  <p className="text-xs text-zinc-600">{log.actor?.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-xs font-mono text-amber-400">
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {log.entity}{log.entityId ? <span className="text-zinc-600">:{log.entityId.slice(0, 8)}</span> : ""}
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-xs text-zinc-500">
                  {log.after || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>{total} events &middot; Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/audit?page=${p}`}
                className={`rounded px-2.5 py-1 text-xs transition ${p === currentPage ? "bg-amber-500/10 text-amber-400" : "hover:bg-zinc-800 text-zinc-400"}`}
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
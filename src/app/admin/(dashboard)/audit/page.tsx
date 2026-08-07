import { getAuditLogs } from "./actions";
import Link from "next/link";

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const { logs, total, pages } = await getAuditLogs(page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Audit Log</h1>
        <p className="mt-1 text-sm text-zinc-500">Immutable record of all archivist actions</p>
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
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-zinc-600">
                  No audit events recorded yet.
                </td>
              </tr>
            )}
            {logs.map((log) => (
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

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>{total} events &middot; Page {page} of {pages}</span>
          <div className="flex gap-2">
            {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/audit?page=${p}`}
                className={`rounded px-2.5 py-1 text-xs transition ${p === page ? "bg-amber-500/10 text-amber-400" : "hover:bg-zinc-800 text-zinc-400"}`}
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

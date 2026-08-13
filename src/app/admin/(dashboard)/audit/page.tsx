import { getAuditLogs } from "./actions";
import { AuditClient } from "./audit-client";

export const dynamic = "force-dynamic";

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

      <AuditClient
        initialLogs={JSON.parse(JSON.stringify(logs))}
        totalPages={pages}
        currentPage={page}
        total={total}
      />
    </div>
  );
}
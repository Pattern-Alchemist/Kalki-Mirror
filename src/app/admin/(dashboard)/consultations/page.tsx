import { getConsultations } from "./actions";
import { ConsultationsClient } from "./consultations-client";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status || "ALL";
  const page = Number(params.page) || 1;
  const { consultations, total, pages } = await getConsultations(status, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Consultations</h1>
        <p className="mt-1 text-sm text-zinc-500">{total} total request{total !== 1 ? "s" : ""}</p>
      </div>
      <ConsultationsClient
        initialConsultations={JSON.parse(JSON.stringify(consultations))}
        totalPages={pages}
        currentPage={page}
        currentStatus={status}
      />
    </div>
  );
}
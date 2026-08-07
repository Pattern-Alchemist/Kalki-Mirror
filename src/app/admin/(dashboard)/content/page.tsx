import { getContentEntries } from "./actions";
import { ContentClient } from "./content-client";

export const dynamic = "force-dynamic";

export default async function ContentPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const type = params.type || "ALL";
  const status = params.status || "ALL";
  const page = Number(params.page) || 1;
  const { entries, total, pages } = await getContentEntries(type, status, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Content Studio</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage practices, archetypes, patterns, research, and codex entries</p>
      </div>
      <ContentClient
        initialEntries={JSON.parse(JSON.stringify(entries))}
        totalPages={pages}
        currentPage={page}
        currentType={type}
        currentStatus={status}
      />
    </div>
  );
}
import { getKeys } from "./actions";
import { KeysClient } from "./keys-client";

export default async function KeysPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const page = Number(params.page) || 1;
  const { keys, total, pages } = await getKeys(query, page);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Golden Keys</h1>
          <p className="mt-1 text-sm text-zinc-500">{total} total key{total !== 1 ? "s" : ""}</p>
        </div>
      </div>
      <KeysClient initialKeys={JSON.parse(JSON.stringify(keys))} totalPages={pages} currentPage={page} query={query} />
    </div>
  );
}
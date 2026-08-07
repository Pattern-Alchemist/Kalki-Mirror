import { getMembers } from "./actions";
import { MemberTable } from "./member-table";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tier?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const tier = params.tier || "ALL";
  const page = Number(params.page) || 1;

  const { members, total, pages } = await getMembers(query, tier, page);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Members</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {total} total member{total !== 1 ? "s" : ""}
        </p>
      </div>
      <MemberTable members={members} totalPages={pages} currentPage={page} currentQuery={query} currentTier={tier} />
    </div>
  );
}

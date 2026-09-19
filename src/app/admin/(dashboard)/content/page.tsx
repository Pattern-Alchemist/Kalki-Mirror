import { getContentEntries } from "./actions";
import { ContentStudioClient } from "./ContentStudioClient";

/**
 * Vol. 4 #2 — the LIVE Content Studio is the rich client.
 *
 * History: the 444-line ContentClient (full CRUD + media picker + AI draft)
 * sat orphaned for a volume — the LIVE page was a simple read-only list, so
 * the studio could not create or edit entries from the UI at all. This was
 * the third orphan-trap incident (consultations-client, content-client, media
 * panel port) and it is now structurally closed: the page renders the rich
 * client, and tests/lib/orphan-guard.test.ts fails CI on any future
 * zero-importer component.
 *
 * Vol. 2 #13 — CalendarView mounted above the ContentClient. Shows the
 * next 7 days of scheduled content as a grid so the founder can queue
 * Sunday's letter on Monday and see it land on the right day.
 *
 * Server component: paged query via the audited server action, then props
 * down. Mutations inside the client call their server actions and refresh
 * the tree (router.refresh), which re-runs this query.
 */

type SearchParams = Promise<{ type?: string; status?: string; page?: string }>;

export const dynamic = "force-dynamic";

export default async function ContentPage({ searchParams }: { searchParams: SearchParams }) {
  const { type = "ALL", status = "ALL", page: pageParam } = await searchParams;
  const page = Math.max(1, Math.min(999, Number.parseInt(pageParam ?? "1", 10) || 1));

  const { entries, pages } = await getContentEntries(type, status, page);

  return (
    <ContentStudioClient
      initialEntries={entries}
      totalPages={pages}
      currentPage={page}
      currentType={type}
      currentStatus={status}
    />
  );
}

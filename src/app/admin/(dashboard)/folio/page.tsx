import { getFolioChunks } from "./actions";
import { FolioClient } from "./folio-client";
import { getCorpusStats } from "@/lib/static-db";

export const dynamic = "force-dynamic";

export default async function FolioPage({
  searchParams,
}: {
  searchParams: Promise<{
    section?: string;
    caution?: string;
    q?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const section = params.section || "";
  const caution = params.caution || "";
  const q = params.q || "";
  const page = Number(params.page) || 1;

  const { chunks, total, pages, sections, cautions } = await getFolioChunks(
    section || undefined,
    caution || undefined,
    page,
    q || undefined
  );

  let stats: { total: number; withEmbeddings: number } | null = null;
  try {
    const corpusStats = await getCorpusStats();
    stats = {
      total: corpusStats.total,
      withEmbeddings: corpusStats.withEmbeddings,
    };
  } catch {
    // static-db may not be available in all environments
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Folio Corpus</h1>
        {stats ? (
          <p className="mt-1 text-sm text-zinc-500">
            {stats.total} total chunks &middot; {stats.withEmbeddings} with embeddings
          </p>
        ) : (
          <p className="mt-1 text-sm text-zinc-500">RAG corpus browser</p>
        )}
      </div>
      <FolioClient
        initialChunks={JSON.parse(JSON.stringify(chunks))}
        totalPages={pages}
        currentPage={page}
        currentSection={section}
        currentCaution={caution}
        currentQ={q}
        sections={sections}
        cautions={cautions}
      />
    </div>
  );
}

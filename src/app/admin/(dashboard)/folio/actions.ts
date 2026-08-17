"use server";

import { staticDb } from "@/lib/static-db";
import { safeGetToken } from "@/lib/get-token-safe";

export type FolioChunkRow = {
  id: string;
  slug: string;
  archetype: string | null;
  section: string;
  caution: string;
  text: string;
  embedding: string;
};

export async function getFolioChunks(
  section?: string,
  caution?: string,
  page: number = 1,
  q?: string
) {
  const session = await safeGetToken();
  if (!session?.id) throw new Error("Unauthorized");
  const where: Record<string, unknown> = {};

  if (section) {
    where.section = section;
  }
  if (caution) {
    where.caution = caution;
  }
  if (q) {
    where.text = { contains: q };
  }

  const take = 20;
  const skip = (page - 1) * take;

  const [chunks, total, sections, cautions] = await Promise.all([
    staticDb.folioChunk.findMany({
      where,
      orderBy: { slug: "asc" },
      take,
      skip,
    }),
    staticDb.folioChunk.count({ where }),
    staticDb.folioChunk.findMany({
      distinct: ["section"],
      select: { section: true },
    }),
    staticDb.folioChunk.findMany({
      distinct: ["caution"],
      select: { caution: true },
    }),
  ]);

  return {
    chunks: chunks as FolioChunkRow[],
    total,
    pages: Math.ceil(total / take),
    sections: sections.map((s) => s.section).sort(),
    cautions: cautions.map((c) => c.caution).sort(),
  };
}

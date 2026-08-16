import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ContentPreviewClient } from "./preview-client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ id?: string; body?: string; title?: string; type?: string; caution?: string }>;
}

export default async function ContentPreviewPage({ searchParams }: Props) {
  const params = await searchParams;
  let content: {
    title: string;
    body: string;
    type: string;
    caution: string;
    slug: string;
    excerpt: string | null;
    minTier: string;
    status: string;
  } | null = null;

  if (params.id) {
    content = await db.contentEntry.findUnique({
      where: { id: params.id },
      select: {
        title: true, body: true, type: true, caution: true,
        slug: true, excerpt: true, minTier: true, status: true,
      },
    });
  }

  if (!content && params.body) {
    content = {
      title: params.title || "Untitled",
      body: params.body,
      type: params.type || "practice",
      caution: params.caution || "OPEN",
      slug: "preview",
      excerpt: null,
      minTier: "prithvi",
      status: "DRAFT",
    };
  }

  if (!content) notFound();

  const cautionColors: Record<string, string> = {
    OPEN: "text-zinc-500",
    MODERATE: "text-amber-400",
    HIGH: "text-orange-400",
    SEALED: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">Preview Mode</span>
            <span className="text-xs text-zinc-500 capitalize">{content.type}</span>
            <span className={`text-xs font-medium capitalize ${cautionColors[content.caution] || ""}`}>{content.caution}</span>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">{content.status}</span>
          </div>
          <span className="text-xs text-zinc-600">Min tier: {content.minTier}</span>
        </div>

        <article className="prose prose-invert prose-zinc prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-200 prose-a:text-amber-400 prose-code:text-amber-300 max-w-none">
          <h1>{content.title}</h1>
          {content.excerpt && (
            <p className="text-lg text-zinc-400 border-l-2 border-amber-500/30 pl-4 italic">{content.excerpt}</p>
          )}
          <ReactMarkdown>{content.body}</ReactMarkdown>
        </article>

        <ContentPreviewClient />
      </div>
    </div>
  );
}

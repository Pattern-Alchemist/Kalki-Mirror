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
    OPEN: "text-[var(--aw-text-2)]",
    MODERATE: "text-[var(--aw-cyan)]",
    HIGH: "text-orange-400",
    SEALED: "text-red-400",
  };

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="rounded bg-[rgba(0,240,255,0.08)] px-2 py-0.5 text-xs font-medium text-[var(--aw-cyan)]">Preview Mode</span>
            <span className="text-xs text-[var(--aw-text-2)] capitalize">{content.type}</span>
            <span className={`text-xs font-medium capitalize ${cautionColors[content.caution] || ""}`}>{content.caution}</span>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-[var(--aw-text-2)]">{content.status}</span>
          </div>
          <span className="text-xs text-[var(--aw-text-3)]">Min tier: {content.minTier}</span>
        </div>

        <article className="prose prose-invert prose-zinc prose-headings:text-[var(--aw-text)] prose-p:text-[var(--aw-text-2)] prose-strong:text-[var(--aw-text)] prose-a:text-[var(--aw-cyan)] prose-code:text-amber-300 max-w-none">
          <h1>{content.title}</h1>
          {content.excerpt && (
            <p className="text-lg text-[var(--aw-text-2)] border-l-2 border-[var(--aw-border-2)] pl-4 italic">{content.excerpt}</p>
          )}
          <ReactMarkdown>{content.body}</ReactMarkdown>
        </article>

        <ContentPreviewClient />
      </div>
    </div>
  );
}

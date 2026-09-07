"use client";

import { useState, useTransition, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { createContentEntry, updateContentEntry, deleteContentEntry } from "./actions";
import { listMedia, uploadMedia } from "./media-actions";
import { buildImageMarkdown, insertMarkdownAtCursor, type MediaAsset } from "@/lib/cloudinary/media";
import { CONTENT_TYPES, STATUSES, CAUTIONS, TIERS, type ContentRow } from "./constants";
import { AdminAIDraft } from "@/components/ai/AdminAIDraft";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-zinc-800 text-zinc-400",
  IN_REVIEW: "bg-blue-500/10 text-blue-400",
  PUBLISHED: "bg-emerald-500/10 text-emerald-400",
  ARCHIVED: "bg-zinc-800/50 text-zinc-600",
};

const CAUTION_STYLES: Record<string, string> = {
  OPEN: "text-zinc-500",
  MODERATE: "text-amber-400",
  HIGH: "text-orange-400",
  SEALED: "text-red-400",
};

export function ContentClient({
  initialEntries,
  totalPages,
  currentPage,
  currentType,
  currentStatus,
}: {
  initialEntries: ContentRow[];
  totalPages: number;
  currentPage: number;
  currentType: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [typeFilter, setTypeFilter] = useState(currentType);
  const [statusFilter, setStatusFilter] = useState(currentStatus);
  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: "practice", slug: "", title: "", excerpt: "", body: "", minTier: "prithvi", caution: "OPEN" });

  // ── Vol. 3 #5 — media library state ──
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [mediaOpen, setMediaOpen] = useState(false);          // studio panel
  const [pickerOpen, setPickerOpen] = useState(false);        // in-modal picker
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [mediaState, setMediaState] = useState<"idle" | "loading" | "ready" | "not-configured" | "error">("idle");
  const [mediaMessage, setMediaMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadMedia = useCallback(async () => {
    setMediaState("loading");
    setMediaMessage("");
    try {
      const result = await listMedia();
      if (result.ok) {
        setMediaAssets(result.assets);
        setMediaState("ready");
      } else {
        setMediaState(result.reason === "not-configured" ? "not-configured" : "error");
        setMediaMessage(result.message);
      }
    } catch {
      setMediaState("error");
      setMediaMessage("Media listing failed — try again shortly.");
    }
  }, []);

  function toggleMediaPanel() {
    const next = !mediaOpen;
    setMediaOpen(next);
    if (next && mediaState === "idle") void loadMedia();
  }

  function openPicker() {
    setPickerOpen(true);
    if (mediaState === "idle") void loadMedia();
  }

  async function handleUpload(file: File) {
    setUploading(true);
    setMediaMessage("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      const result = await uploadMedia(fd);
      if (result.ok) {
        setMediaAssets((prev) => [result.asset, ...prev]);
        setMediaState("ready");
        setMediaMessage("");
      } else {
        setMediaMessage(result.message);
        if (result.message.includes("dormant")) setMediaState("not-configured");
      }
    } catch {
      setMediaMessage("Upload failed — try again shortly.");
    } finally {
      setUploading(false);
    }
  }

  function insertAsset(asset: MediaAsset) {
    const alt = asset.publicId.split("/").pop() || "illustration";
    const md = buildImageMarkdown(alt.replace(/\.[a-z0-9]+$/i, ""), asset.secureUrl);
    const ta = bodyRef.current;
    const { text, caret } = insertMarkdownAtCursor(
      form.body,
      ta?.selectionStart ?? form.body.length,
      ta?.selectionEnd ?? form.body.length,
      md
    );
    setForm((prev) => ({ ...prev, body: text }));
    requestAnimationFrame(() => {
      ta?.focus();
      ta?.setSelectionRange(caret, caret);
    });
  }

  function copyAssetMarkdown(asset: MediaAsset) {
    const alt = (asset.publicId.split("/").pop() || "illustration").replace(/\.[a-z0-9]+$/i, "");
    void navigator.clipboard?.writeText(buildImageMarkdown(alt, asset.secureUrl));
  }

  function applyFilters() {
    const params = new URLSearchParams();
    if (typeFilter !== "ALL") params.set("type", typeFilter);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    startTransition(() => router.push(`/admin/content?${params.toString()}`));
  }

  function openCreate() {
    setForm({ type: "practice", slug: "", title: "", excerpt: "", body: "", minTier: "prithvi", caution: "OPEN" });
    setShowCreate(true);
    setEditId(null);
  }

  function openEdit(entry: ContentRow) {
    setForm({
      type: entry.type,
      slug: entry.slug,
      title: entry.title,
      excerpt: entry.excerpt || "",
      body: entry.body || "",
      minTier: entry.minTier,
      caution: entry.caution,
    });
    setEditId(entry.id);
    setShowCreate(true);
  }

  async function handleSave() {
    if (!form.slug || !form.title) return;
    startTransition(async () => {
      if (editId) {
        await updateContentEntry(editId, {
          title: form.title,
          excerpt: form.excerpt || undefined,
          body: form.body || undefined,
          minTier: form.minTier,
          caution: form.caution,
        });
      } else {
        await createContentEntry({
          type: form.type,
          slug: form.slug,
          title: form.title,
          excerpt: form.excerpt || undefined,
          body: form.body || undefined,
          minTier: form.minTier,
          caution: form.caution,
        });
      }
      setShowCreate(false);
      setEditId(null);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this entry?")) return;
    startTransition(async () => {
      await deleteContentEntry(id);
      router.refresh();
    });
  }

  function handleStatusChange(id: string, newStatus: string) {
    startTransition(async () => {
      await updateContentEntry(id, { status: newStatus });
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none">
          <option value="ALL">All Types</option>
          {CONTENT_TYPES.map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none">
          <option value="ALL">All Statuses</option>
          {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
        <button onClick={applyFilters} disabled={isPending} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-50">Filter</button>
        <button onClick={openCreate} className="ml-auto rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-500">
          New Entry
        </button>
      </div>

      {/* AI Draft Generator */}
      <div className="rounded-xl border border-zinc-800 p-4">
        <AdminAIDraft
          type={form.type as any}
          title={form.title || undefined || ''}
          onDraft={(draft, caution, tier, siddhis) => {
            setForm(prev => ({
              ...prev,
              body: draft,
              caution: caution || prev.caution,
              minTier: tier || prev.minTier,
            }));
            setShowCreate(true);
          }}
        />
      </div>

      {/* Media Library (Vol. 3 #5 — the uploader finally has callers) */}
      <div className="rounded-xl border border-zinc-800 p-4">
        <div className="flex items-center gap-3">
          <button onClick={toggleMediaPanel} className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors">
            Media Library {mediaOpen ? "▾" : "▸"}
          </button>
          {mediaState === "ready" && <span className="text-xs text-zinc-600">{mediaAssets.length} asset(s) in kalki-mirror/</span>}
          {mediaOpen && (
            <label className="ml-auto cursor-pointer rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-400">
              {uploading ? "Uploading…" : "Upload image"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUpload(f);
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
        {mediaOpen && (
          <div className="mt-4">
            {mediaState === "loading" && <p className="text-sm text-zinc-500">Opening the media library…</p>}
            {mediaState === "not-configured" && (
              <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">{mediaMessage}</p>
            )}
            {mediaState === "error" && <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{mediaMessage}</p>}
            {mediaState === "ready" && mediaAssets.length === 0 && (
              <p className="text-sm text-zinc-600">No assets yet — upload the first image for this entry.</p>
            )}
            {mediaState === "ready" && mediaAssets.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {mediaAssets.map((asset) => (
                  <div key={asset.publicId} className="group space-y-1 rounded-lg border border-zinc-800 p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.secureUrl} alt={asset.publicId} className="h-24 w-full rounded object-cover" />
                    <p className="truncate font-mono text-[0.625rem] text-zinc-600" title={asset.publicId}>{asset.publicId.split("/").pop()}</p>
                    <div className="flex gap-1">
                      <button onClick={() => copyAssetMarkdown(asset)} className="flex-1 rounded bg-zinc-800 px-1.5 py-1 text-[0.625rem] text-zinc-300 transition hover:bg-zinc-700">Copy ![]()</button>
                      <button onClick={() => window.open(asset.secureUrl, "_blank")} className="rounded bg-zinc-800 px-1.5 py-1 text-[0.625rem] text-zinc-300 transition hover:bg-zinc-700">↗</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {mediaMessage && mediaState === "ready" && <p className="mt-2 text-xs text-red-400">{mediaMessage}</p>}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-500">Title</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Type</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Caution</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Tier</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Updated</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {initialEntries.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-600">No content entries.</td></tr>
            )}
            {initialEntries.map((entry) => (
              <tr key={entry.id} className="transition hover:bg-zinc-900/30">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-200">{entry.title}</p>
                  <p className="text-xs text-zinc-600 font-mono">/{entry.type}/{entry.slug}</p>
                </td>
                <td className="px-4 py-3 capitalize text-zinc-400">{entry.type}</td>
                <td className="px-4 py-3">
                  <select
                    value={entry.status}
                    onChange={(e) => handleStatusChange(entry.id, e.target.value)}
                    disabled={isPending}
                    className={`rounded-md border-0 bg-transparent text-xs font-medium ${STATUS_STYLES[entry.status] || ""}`}
                  >
                    {STATUSES.map((s) => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </td>
                <td className={`px-4 py-3 text-xs font-medium ${CAUTION_STYLES[entry.caution] || ""}`}>{entry.caution}</td>
                <td className="px-4 py-3 text-xs text-zinc-500 capitalize">{entry.minTier}</td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">{new Date(entry.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(entry)} disabled={isPending} className="text-xs text-amber-500 hover:text-amber-400 disabled:opacity-50">Edit</button>
                    <button onClick={() => window.open(`/admin/content/preview?id=${entry.id}`, '_blank')} disabled={isPending} className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50">Preview</button>
                    <button onClick={() => handleDelete(entry.id)} disabled={isPending} className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { setShowCreate(false); setEditId(null); }}>
          <div className="w-full max-w-4xl rounded-xl border border-zinc-700 bg-zinc-900 p-6 space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-medium text-zinc-200">{editId ? "Edit Entry" : "New Content Entry"}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-400">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={!!editId} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none">
                  {CONTENT_TYPES.map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-400">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} disabled={!!editId} placeholder="my-entry-slug" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none font-mono" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-400">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Entry title" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-zinc-400">Excerpt</label>
              <input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Brief description…" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-zinc-400">Body (Markdown)</label>
                  <button onClick={openPicker} className="text-[0.625rem] text-amber-500 transition hover:text-amber-400">Insert image ↓</button>
                </div>
                <textarea ref={bodyRef} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={12} placeholder="Write content body in Markdown…" className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none resize-none font-mono" />
                {pickerOpen && (
                  <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs text-zinc-500">Media library</span>
                      <button onClick={() => setPickerOpen(false)} className="text-xs text-zinc-600 hover:text-zinc-400">close</button>
                    </div>
                    {mediaState === "loading" && <p className="text-xs text-zinc-600">Loading…</p>}
                    {mediaState === "not-configured" && <p className="text-xs text-amber-400">{mediaMessage}</p>}
                    {mediaState === "ready" && mediaAssets.length === 0 && <p className="text-xs text-zinc-600">No assets — close this picker and upload from the Media Library panel first.</p>}
                    {mediaState === "ready" && mediaAssets.length > 0 && (
                      <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto">
                        {mediaAssets.map((asset) => (
                          <button key={asset.publicId} onClick={() => insertAsset(asset)} title={`Insert ${asset.publicId.split("/").pop()}`} className="group relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={asset.secureUrl} alt={asset.publicId} className="h-16 w-full rounded border border-zinc-800 object-cover transition group-hover:border-amber-500/50" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-400">Preview</label>
                <div className="h-[280px] overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300 prose prose-invert prose-sm prose-zinc max-w-none">
                  {form.body ? <ReactMarkdown>{form.body}</ReactMarkdown> : <span className="text-zinc-600">Nothing to preview</span>}
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-400">Min Tier</label>
                <select value={form.minTier} onChange={(e) => setForm({ ...form, minTier: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none">
                  {TIERS.map((t) => (<option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-zinc-400">Caution</label>
                <select value={form.caution} onChange={(e) => setForm({ ...form, caution: e.target.value })} className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none">
                  {CAUTIONS.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setShowCreate(false); setEditId(null); }} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">Cancel</button>
              <button onClick={handleSave} disabled={isPending || !form.slug || !form.title} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50">
                {isPending ? "Saving…" : editId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>Page {currentPage} of {totalPages}</span>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => {
                const params = new URLSearchParams();
                if (typeFilter !== "ALL") params.set("type", typeFilter);
                if (statusFilter !== "ALL") params.set("status", statusFilter);
                if (p > 1) params.set("page", String(p));
                router.push(`/admin/content?${params.toString()}`);
              }} className={`rounded px-2.5 py-1 text-xs transition ${p === currentPage ? "bg-amber-500/10 text-amber-400" : "hover:bg-zinc-800 text-zinc-400"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
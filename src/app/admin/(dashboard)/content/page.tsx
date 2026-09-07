"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { listMedia, uploadMedia } from "./media-actions";
import { buildImageMarkdown, type MediaAsset } from "@/lib/cloudinary/media";

const TYPES = ["ALL", "practice", "archetype", "pattern", "research", "codex"];
const STATUSES = ["ALL", "DRAFT", "IN_REVIEW", "PUBLISHED", "ARCHIVED"];
const STATUS_COLOR: Record<string, string> = { DRAFT: "text-zinc-400", IN_REVIEW: "text-amber-400", PUBLISHED: "text-emerald-400", ARCHIVED: "text-zinc-600" };

// ── Vol. 3 #5 — Media Library panel ─────────────────────────────
// The Cloudinary uploader shipped in Vol. 1 with zero callers; this
// panel is its first live surface. Uploads are role-gated + audited
// server-side; the panel degrades honestly when the deployment
// carries no CLOUDINARY_URL. Copy ![]() puts ready-to-paste markdown
// on the clipboard for whichever entry body the archivist is writing.

type MediaState = "idle" | "loading" | "ready" | "not-configured" | "error";

function MediaLibraryPanel() {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [state, setState] = useState<MediaState>("idle");
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setState("loading");
    setMessage("");
    try {
      const result = await listMedia();
      if (result.ok) {
        setAssets(result.assets);
        setState("ready");
      } else {
        setState(result.reason === "not-configured" ? "not-configured" : "error");
        setMessage(result.message);
      }
    } catch {
      setState("error");
      setMessage("Media listing failed — try again shortly.");
    }
  }, []);

  async function handleUpload(file: File) {
    setUploading(true);
    setMessage("");
    try {
      const fd = new FormData();
      fd.set("file", file);
      const result = await uploadMedia(fd);
      if (result.ok) {
        setAssets((prev) => [result.asset, ...prev]);
        setState("ready");
      } else {
        setMessage(result.message);
        if (result.message.includes("dormant")) setState("not-configured");
      }
    } catch {
      setMessage("Upload failed — try again shortly.");
    } finally {
      setUploading(false);
    }
  }

  function copyMarkdown(asset: MediaAsset) {
    const alt = (asset.publicId.split("/").pop() || "illustration").replace(/\.[a-z0-9]+$/i, "");
    void navigator.clipboard?.writeText(buildImageMarkdown(alt, asset.secureUrl));
  }

  return (
    <div className="rounded-xl border border-zinc-800 p-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => { const next = !open; setOpen(next); if (next && state === "idle") void load(); }}
          className="text-sm font-medium text-zinc-300 hover:text-amber-400 transition-colors"
        >
          Media Library {open ? "▾" : "▸"}
        </button>
        {state === "ready" && <span className="text-xs text-zinc-600">{assets.length} asset(s) in kalki-mirror/</span>}
        {open && (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="ml-auto rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition hover:border-amber-500/50 hover:text-amber-400 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
        )}
        <input
          ref={fileRef}
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
      </div>
      {open && (
        <div className="mt-4">
          {state === "loading" && <p className="text-sm text-zinc-500">Opening the media library…</p>}
          {state === "not-configured" && (
            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-400">{message}</p>
          )}
          {state === "error" && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">{message}</p>
          )}
          {state === "ready" && assets.length === 0 && (
            <p className="text-sm text-zinc-600">No assets yet — upload the first image.</p>
          )}
          {state === "ready" && assets.length > 0 && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {assets.map((asset) => (
                <div key={asset.publicId} className="space-y-1 rounded-lg border border-zinc-800 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.secureUrl} alt={asset.publicId} className="h-24 w-full rounded object-cover" />
                  <p className="truncate font-mono text-[0.625rem] text-zinc-600" title={asset.publicId}>{asset.publicId.split("/").pop()}</p>
                  <div className="flex gap-1">
                    <button onClick={() => copyMarkdown(asset)} className="flex-1 rounded bg-zinc-800 px-1.5 py-1 text-[0.625rem] text-zinc-300 transition hover:bg-zinc-700">Copy ![]()</button>
                    <button onClick={() => window.open(asset.secureUrl, "_blank")} className="rounded bg-zinc-800 px-1.5 py-1 text-[0.625rem] text-zinc-300 transition hover:bg-zinc-700">↗</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {message && state === "ready" && <p className="mt-2 text-xs text-red-400">{message}</p>}
        </div>
      )}
    </div>
  );
}

export default function ContentPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/content?type=${type}&status=${status}&page=${page}`);
      if (!r.ok) throw new Error();
      const d = await r.json(); setEntries(d.entries); setTotal(d.total); setPages(d.pages);
    } catch {} finally { setLoading(false); }
  }, [type, status, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-zinc-100">Content Studio</h1><p className="mt-1 text-sm text-zinc-500">{total} content entries</p></div>
      <MediaLibraryPanel />
      <div className="flex flex-wrap gap-2">
        <div className="flex gap-1">{TYPES.map(t => <button key={t} onClick={() => { setType(t); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${type === t ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-zinc-500 border border-zinc-800"}`}>{t}</button>)}</div>
        <div className="flex gap-1">{STATUSES.map(s => <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${status === s ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "text-zinc-500 border border-zinc-800"}`}>{s}</button>)}</div>
      </div>
      {loading && <p className="text-zinc-500 text-sm">Loading...</p>}
      <div className="space-y-3">
        {entries.map(e => (
          <div key={e.id} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="flex items-start justify-between">
              <div><p className="font-medium text-zinc-200">{e.title}</p><p className="mt-0.5 text-xs text-zinc-500">/{e.type}/{e.slug}</p></div>
              <span className={`text-xs font-medium ${STATUS_COLOR[e.status] || "text-zinc-400"}`}>{e.status}</span>
            </div>
            {e.excerpt && <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{e.excerpt}</p>}
            <p className="mt-2 text-xs text-zinc-600">Updated {new Date(e.updatedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
      {pages > 1 && <div className="flex justify-center gap-2">{Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm ${p === page ? "bg-amber-500 text-black font-medium" : "text-zinc-500 hover:text-zinc-300"}`}>{p}</button>)}</div>}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getTestimonials,
  createTestimonial,
  approveTestimonial,
  hideTestimonial,
  toggleFeatured,
  deleteTestimonial,
  bulkApproveTestimonials,
  bulkHideTestimonials,
  bulkDeleteTestimonials,
  bulkFeatureTestimonials,
  type TestimonialRow,
} from "./actions";
import { BulkActionBar, useRowSelection } from "@/components/admin/BulkActionBar";

const STATUSES = ["PENDING", "APPROVED", "HIDDEN"] as const;
const STATUS_CHIP: Record<string, string> = {
  PENDING: "border-amber-500/40 bg-[rgba(0,240,255,0.08)] text-amber-300",
  APPROVED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  HIDDEN: "border-zinc-700 text-[var(--aw-text-2)]",
};

function fmtDate(iso: unknown): string {
  if (!iso || typeof iso !== "string" && !(iso instanceof Date)) return "—";
  const d = new Date(iso as string | Date);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export default function TestimonialsPage() {
  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // Vol. 2 #4 — bulk selection (declared early so load() can be referenced by handlers below)
  const sel = useRowSelection();
  const [bulkBusy, setBulkBusy] = useState(false);

  // Forward-declared via useCallback so it can be referenced by bulk handlers
  const loadRef = useRef<() => Promise<void>>(async () => {});

  const onBulkApprove = useCallback(async () => {
    if (sel.selectedCount === 0) return;
    if (!confirm(`Approve ${sel.selectedCount} testimonials? They'll go live on /consultations.`)) return;
    setBulkBusy(true);
    try {
      const r = await bulkApproveTestimonials(sel.selectedIds);
      setNotice(`Approved ${r.affected} testimonials.`);
      sel.clear();
      await loadRef.current();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk approve failed.");
    } finally { setBulkBusy(false); }
  }, [sel]);

  const onBulkHide = useCallback(async () => {
    if (sel.selectedCount === 0) return;
    setBulkBusy(true);
    try {
      const r = await bulkHideTestimonials(sel.selectedIds);
      setNotice(`Hid ${r.affected} testimonials.`);
      sel.clear();
      await loadRef.current();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk hide failed.");
    } finally { setBulkBusy(false); }
  }, [sel]);

  const onBulkDelete = useCallback(async () => {
    if (sel.selectedCount === 0) return;
    if (!confirm(`Permanently delete ${sel.selectedCount} testimonials? This cannot be undone.`)) return;
    setBulkBusy(true);
    try {
      const r = await bulkDeleteTestimonials(sel.selectedIds);
      setNotice(`Deleted ${r.affected} testimonials.`);
      sel.clear();
      await loadRef.current();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk delete failed.");
    } finally { setBulkBusy(false); }
  }, [sel]);

  const onBulkFeature = useCallback(async (featured: boolean) => {
    if (sel.selectedCount === 0) return;
    setBulkBusy(true);
    try {
      const r = await bulkFeatureTestimonials(sel.selectedIds, featured);
      setNotice(`${featured ? 'Featured' : 'Unfeatured'} ${r.affected} testimonials.`);
      sel.clear();
      await loadRef.current();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bulk feature failed.");
    } finally { setBulkBusy(false); }
  }, [sel]);

  // New-entry form — seeker words arrive over WhatsApp, entered here with consent.
  const [form, setForm] = useState({
    quote: "",
    name: "",
    context: "Pattern Consultation",
    location: "",
    source: "consultation",
    consent: false,
  });
  // Vol. 8 #17 — WhatsApp paste-and-parse
  const [waPaste, setWaPaste] = useState("");
  const [showWaPaste, setShowWaPaste] = useState(false);

  const parseWhatsAppPaste = () => {
    const text = waPaste.trim();
    if (!text) return;
    // WhatsApp messages typically start with the sender name followed by a message
    // Try to extract: first line or first few words = name, rest = quote
    const lines = text.split('\n').filter(l => l.trim());
    let name = '';
    let quote = text;

    if (lines.length > 1) {
      // First line might be the name (WhatsApp format: "Name: message")
      const firstLine = lines[0].trim();
      if (firstLine.includes(':')) {
        const colonIdx = firstLine.indexOf(':');
        name = firstLine.substring(0, colonIdx).trim();
        quote = firstLine.substring(colonIdx + 1).trim();
        if (lines.length > 1) quote += '\n' + lines.slice(1).join('\n');
      } else if (firstLine.length < 50 && !firstLine.includes('.')) {
        // Short first line without punctuation = likely a name
        name = firstLine;
        quote = lines.slice(1).join('\n');
      }
    }

    // Clean up the name (take first part if "First Last" → "First L.")
    if (name) {
      const parts = name.split(/\s+/);
      if (parts.length > 1) {
        name = parts[0] + ' ' + parts[parts.length - 1][0] + '.';
      }
    }

    setForm(prev => ({ ...prev, quote: quote.trim(), name }));
    setWaPaste('');
    setShowWaPaste(false);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await getTestimonials();
      setRows(d.testimonials);
      setCounts(d.counts ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load testimonials.");
    } finally {
      setLoading(false);
    }
  }, []);
  // Keep the ref in sync so the bulk handlers above can call load()
  loadRef.current = load;

  useEffect(() => {
    load();
  }, [load]);

  const onCreate = useCallback(async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await createTestimonial({
        quote: form.quote,
        name: form.name || undefined,
        context: form.context || undefined,
        location: form.location || undefined,
        source: form.source,
        consent: form.consent,
      });
      if (res.success) {
        setNotice("Saved — Approve (and Feature) when you want it on /consultations.");
        setForm({ ...form, quote: "", name: "", location: "", consent: false });
        await load();
      } else {
        setError(res.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed.");
    } finally {
      setBusy(false);
    }
  }, [form, load]);

  const onAction = useCallback(async (fn: () => Promise<{ success: boolean; error?: string }>, ok: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await fn();
      if (res.success) setNotice(ok);
      else setError(res.error ?? "Action failed.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--aw-text)]">Testimonials</h1>
          <p className="mt-1 text-sm text-[var(--aw-text-2)]">
            Social proof ledger — WhatsApp words → consent → curate. Featured + approved render on /consultations.
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border border-[var(--aw-border-2)] px-3 py-2 text-xs font-medium text-[var(--aw-text-2)] transition-colors hover:border-[var(--aw-border-2)] hover:text-amber-300"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {STATUSES.map((s) => (
          <div key={s} className="aw-card">
            <p className="text-xs text-[var(--aw-text-2)]">{s}</p>
            <p className="mt-1 text-xl font-semibold text-[var(--aw-text)]">{loading ? "—" : counts[s] ?? 0}</p>
          </div>
        ))}
      </div>

      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      {notice && <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{notice}</p>}

      {/* New entry */}
      <div className="aw-card">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--aw-text-2)]">New testimonial (enter with consent)</p>
          {/* Vol. 8 #17 — WhatsApp paste-and-parse */}
          <button onClick={() => setShowWaPaste(!showWaPaste)} className="aw-btn aw-btn-ghost text-[10px]">
            {showWaPaste ? '✕ Close' : '📋 Paste from WhatsApp'}
          </button>
        </div>
        {showWaPaste && (
          <div className="mt-3 aw-card p-3 bg-[rgba(37,211,102,0.04)]">
            <textarea
              value={waPaste}
              onChange={(e) => setWaPaste(e.target.value)}
              placeholder="Paste the WhatsApp message here — the name and quote will be auto-extracted…"
              rows={4}
              className="aw-input mt-1"
            />
            <button onClick={parseWhatsAppPaste} disabled={!waPaste.trim()} className="aw-btn aw-btn-primary mt-2 text-xs disabled:opacity-40">
              Parse & Fill Form →
            </button>
          </div>
        )}
        <textarea
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
          placeholder="The seeker's words, lightly copy-edited…"
          rows={3}
          className="mt-3 w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]/60 px-3 py-2 text-sm text-[var(--aw-text)] placeholder:text-[var(--aw-text-3)] focus:border-amber-500/40 focus:outline-none"
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Display name — e.g. Ananya M."
            className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]/60 px-3 py-2 text-sm text-[var(--aw-text)] placeholder:text-[var(--aw-text-3)] focus:border-amber-500/40 focus:outline-none"
          />
          <input
            value={form.context}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            placeholder="Context — e.g. Shadow Dossier"
            className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]/60 px-3 py-2 text-sm text-[var(--aw-text)] placeholder:text-[var(--aw-text-3)] focus:border-amber-500/40 focus:outline-none"
          />
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Location (optional) — e.g. Austin, TX"
            className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]/60 px-3 py-2 text-sm text-[var(--aw-text)] placeholder:text-[var(--aw-text-3)] focus:border-amber-500/40 focus:outline-none"
          />
          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className="rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]/60 px-3 py-2 text-sm text-[var(--aw-text)] focus:border-amber-500/40 focus:outline-none"
          >
            <option value="consultation">consultation</option>
            <option value="membership">membership</option>
            <option value="email-course">email-course</option>
            <option value="other">other</option>
          </select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-[var(--aw-text-2)]">
          <input
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm({ ...form, consent: e.target.checked })}
            className="h-3.5 w-3.5 accent-amber-500"
          />
          The seeker explicitly consented to public display of these words.
        </label>
        <button
          onClick={onCreate}
          disabled={busy || form.quote.trim().length < 20 || !form.consent}
          className="mt-3 rounded-lg bg-amber-500/20 px-4 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save testimonial
        </button>
      </div>

      {/* Vol. 2 #4 — BulkActionBar appears when rows are selected */}
      <BulkActionBar
        selectedCount={sel.selectedCount}
        onClear={sel.clear}
        actions={[
          { label: 'Approve', onClick: onBulkApprove, variant: 'primary', loading: bulkBusy },
          { label: 'Feature', onClick: () => onBulkFeature(true), loading: bulkBusy },
          { label: 'Unfeature', onClick: () => onBulkFeature(false), loading: bulkBusy },
          { label: 'Hide', onClick: onBulkHide, loading: bulkBusy },
          { label: 'Delete', onClick: onBulkDelete, variant: 'danger', loading: bulkBusy },
        ]}
      />

      {/* Ledger */}
      <div className="overflow-x-auto aw-table">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--aw-border-2)] bg-[var(--aw-glass-1)]/60 text-xs uppercase tracking-wider text-[var(--aw-text-2)]">
              <th scope="col" className="px-2 py-3 w-10">
                <input
                  type="checkbox"
                  aria-label="Select all testimonials"
                  checked={rows.length > 0 && rows.every(r => sel.isSelected(r.id))}
                  ref={el => { if (el) el.indeterminate = sel.selectedCount > 0 && sel.selectedCount < rows.length; }}
                  onChange={() => sel.toggleAll(rows.map(r => r.id))}
                  className="h-3.5 w-3.5 accent-amber-500 cursor-pointer"
                />
              </th>
              <th scope="col" className="px-4 py-3 font-medium">Quote</th>
              <th scope="col" className="px-4 py-3 font-medium">Seeker</th>
              <th scope="col" className="px-4 py-3 font-medium">Status</th>
              <th scope="col" className="px-4 py-3 font-medium">Entered</th>
              <th scope="col" className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-[var(--aw-text-2)]">Loading ledger…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-[var(--aw-text-2)]">Nothing yet — after a session, ask the seeker for three honest sentences and their consent, then enter them above.</td></tr>
            )}
            {!loading && rows.map((t) => (
              <tr key={t.id} className={`border-b border-[var(--aw-border-2)]/60 last:border-0 align-top ${sel.isSelected(t.id) ? 'bg-[var(--aw-glass-1)]/40' : ''}`}>
                <td className="px-2 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select testimonial from ${t.name || 'anonymous'}`}
                    checked={sel.isSelected(t.id)}
                    onChange={() => sel.toggle(t.id)}
                    className="h-3.5 w-3.5 accent-amber-500 cursor-pointer"
                  />
                </td>
                <td className="max-w-md px-4 py-3">
                  <p className="text-[var(--aw-text-2)]">&ldquo;{t.quote.length > 180 ? t.quote.slice(0, 180) + "…" : t.quote}&rdquo;</p>
                  {t.submittedBy && <p className="mt-1 text-[10px] text-[var(--aw-text-3)]">entered by {t.submittedBy}</p>}
                </td>
                <td className="px-4 py-3">
                  <p className="text-[var(--aw-text-2)]">{t.name || "—"}</p>
                  <p className="text-xs text-[var(--aw-text-2)]">{t.context || "—"}{t.location ? ` · ${t.location}` : ""}</p>
                  <p className="text-[10px] text-[var(--aw-text-3)]">{t.source}{t.consent ? " · consent ✓" : " · NO CONSENT"}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs ${STATUS_CHIP[t.status] ?? ""}`}>{t.status}</span>
                  {t.featured && <span className="ml-1 rounded-full border border-gold-500/40 bg-[rgba(0,240,255,0.08)] px-2 py-0.5 text-xs text-amber-300">★</span>}
                </td>
                <td className="px-4 py-3 text-xs text-[var(--aw-text-2)]">{fmtDate(t.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {t.status !== "APPROVED" && (
                      <button
                        onClick={() => onAction(() => approveTestimonial(t.id), "Approved — live on the wall (if featured).")}
                        disabled={busy}
                        className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Approve
                      </button>
                    )}
                    {t.status === "APPROVED" && (
                      <button
                        onClick={() => onAction(() => toggleFeatured(t.id), t.featured ? "Unfeatured." : "Featured on /consultations.")}
                        disabled={busy}
                        className="rounded-lg border border-amber-500/40 bg-[rgba(0,240,255,0.08)] px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t.featured ? "Unfeature" : "Feature"}
                      </button>
                    )}
                    {t.status !== "HIDDEN" && (
                      <button
                        onClick={() => onAction(() => hideTestimonial(t.id), "Hidden from the public surface.")}
                        disabled={busy}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-[var(--aw-text-2)] transition-colors hover:text-[var(--aw-text)] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Hide
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this testimonial permanently?")) {
                          void onAction(() => deleteTestimonial(t.id), "Deleted.");
                        }
                      }}
                      disabled={busy}
                      className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-400/80 transition-colors hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

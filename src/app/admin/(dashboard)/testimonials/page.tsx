"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getTestimonials,
  createTestimonial,
  approveTestimonial,
  hideTestimonial,
  toggleFeatured,
  deleteTestimonial,
  type TestimonialRow,
} from "./actions";

const STATUSES = ["PENDING", "APPROVED", "HIDDEN"] as const;
const STATUS_CHIP: Record<string, string> = {
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  APPROVED: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  HIDDEN: "border-zinc-700 text-zinc-500",
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

  // New-entry form — seeker words arrive over WhatsApp, entered here with consent.
  const [form, setForm] = useState({
    quote: "",
    name: "",
    context: "Pattern Consultation",
    location: "",
    source: "consultation",
    consent: false,
  });

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
          <h1 className="text-2xl font-semibold text-zinc-100">Testimonials</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Social proof ledger — WhatsApp words → consent → curate. Featured + approved render on /consultations.
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-amber-500/30 hover:text-amber-300"
        >
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {STATUSES.map((s) => (
          <div key={s} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <p className="text-xs text-zinc-500">{s}</p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{loading ? "—" : counts[s] ?? 0}</p>
          </div>
        ))}
      </div>

      {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      {notice && <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{notice}</p>}

      {/* New entry */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">New testimonial (enter with consent)</p>
        <textarea
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
          placeholder="The seeker's words, lightly copy-edited…"
          rows={3}
          className="mt-3 w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Display name — e.g. Ananya M."
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
          />
          <input
            value={form.context}
            onChange={(e) => setForm({ ...form, context: e.target.value })}
            placeholder="Context — e.g. Shadow Dossier"
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
          />
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Location (optional) — e.g. Austin, TX"
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
          />
          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 focus:border-amber-500/40 focus:outline-none"
          >
            <option value="consultation">consultation</option>
            <option value="membership">membership</option>
            <option value="email-course">email-course</option>
            <option value="other">other</option>
          </select>
        </div>
        <label className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
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

      {/* Ledger */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Quote</th>
              <th className="px-4 py-3 font-medium">Seeker</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Entered</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-zinc-500">Loading ledger…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-zinc-500">Nothing yet — after a session, ask the seeker for three honest sentences and their consent, then enter them above.</td></tr>
            )}
            {!loading && rows.map((t) => (
              <tr key={t.id} className="border-b border-zinc-800/60 last:border-0 align-top">
                <td className="max-w-md px-4 py-3">
                  <p className="text-zinc-300">&ldquo;{t.quote.length > 180 ? t.quote.slice(0, 180) + "…" : t.quote}&rdquo;</p>
                  {t.submittedBy && <p className="mt-1 text-[10px] text-zinc-600">entered by {t.submittedBy}</p>}
                </td>
                <td className="px-4 py-3">
                  <p className="text-zinc-300">{t.name || "—"}</p>
                  <p className="text-xs text-zinc-500">{t.context || "—"}{t.location ? ` · ${t.location}` : ""}</p>
                  <p className="text-[10px] text-zinc-600">{t.source}{t.consent ? " · consent ✓" : " · NO CONSENT"}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs ${STATUS_CHIP[t.status] ?? ""}`}>{t.status}</span>
                  {t.featured && <span className="ml-1 rounded-full border border-gold-500/40 bg-amber-500/10 px-2 py-0.5 text-xs text-amber-300">★</span>}
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">{fmtDate(t.createdAt)}</td>
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
                        className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {t.featured ? "Unfeature" : "Feature"}
                      </button>
                    )}
                    {t.status !== "HIDDEN" && (
                      <button
                        onClick={() => onAction(() => hideTestimonial(t.id), "Hidden from the public surface.")}
                        disabled={busy}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
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

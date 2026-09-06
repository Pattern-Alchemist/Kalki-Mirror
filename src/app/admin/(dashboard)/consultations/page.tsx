"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getConsultations,
  updateConsultationStatus,
  deleteConsultation,
  setPaymentPaid,
  setPaymentWaived,
  saveOutcome,
  getFollowUpsDue,
  type ConsultationRow,
} from "./actions";

/* Vol. 3 #1 — outcome lifecycle (mirrors dossier/actions.ts OutcomeStatus) */
type OutcomeInput = Parameters<typeof saveOutcome>[1];
const OUTCOME_COLOR: Record<string, string> = {
  PENDING: "border-zinc-600 text-zinc-400",
  IN_PROGRESS: "border-blue-500/40 text-blue-300",
  RESOLVED: "border-emerald-500/40 text-emerald-300",
  DISCONTINUED: "border-zinc-700 text-zinc-500",
};

/* ─── Pipeline constants ──────────────────────────────────────────────────── */

const PIPELINE = ["NEW", "ACKNOWLEDGED", "SCHEDULED", "COMPLETED", "CANCELLED"] as const;
const STATUS_COLOR: Record<string, string> = {
  NEW: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  ACKNOWLEDGED: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  SCHEDULED: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  COMPLETED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
};
const STATUS_DOT: Record<string, string> = {
  NEW: "bg-blue-400",
  ACKNOWLEDGED: "bg-amber-400",
  SCHEDULED: "bg-violet-400",
  COMPLETED: "bg-emerald-400",
  CANCELLED: "bg-zinc-500",
};

type AttributionSnapshot = {
  first?: Record<string, unknown> & { ts?: string; source?: string; medium?: string; campaign?: string; country?: string; landingPath?: string; referrer?: string };
  last?: Record<string, unknown> & { ts?: string; source?: string; medium?: string; campaign?: string; country?: string; landingPath?: string; referrer?: string };
  sessions?: number;
};

function parseSnapshot(json: string | null): AttributionSnapshot | null {
  if (!json) return null;
  try {
    const v = JSON.parse(json);
    return v && typeof v === "object" ? (v as AttributionSnapshot) : null;
  } catch {
    return null;
  }
}

function timeAgo(iso: string | Date): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

function fmtDate(iso: unknown): string {
  if (typeof iso !== "string" || !iso) return "—";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

/** One-line source classification for a lead. */
function leadSource(c: ConsultationRow): { label: string; kind: "paid" | "organic" | "referral" | "direct" } {
  const geo = c.country ? ` · ${c.country}` : "";
  if (c.clickId) return { label: (c.utmSource || c.clickId) + geo, kind: "paid" };
  if (c.utmSource && c.utmSource !== "direct") {
    return { label: (c.utmCampaign ? `${c.utmSource} · ${c.utmCampaign}` : c.utmSource) + geo, kind: "organic" };
  }
  if (c.referrerDomain) return { label: c.referrerDomain + geo, kind: "referral" };
  return { label: (c.utmSource || "direct") + geo, kind: "direct" };
}

const SOURCE_CHIP: Record<string, string> = {
  paid: "border-emerald-500/40 text-emerald-300",
  organic: "border-amber-500/40 text-amber-300",
  referral: "border-sky-500/40 text-sky-300",
  direct: "border-zinc-700 text-zinc-400",
};

/* Tier-1 ① — UPI reconciliation ledger states */
const PAYMENT_STATES = ["UNPAID", "CLAIMED", "PAID", "WAIVED"] as const;
const PAYMENT_CHIP: Record<string, string> = {
  UNPAID: "border-zinc-700 text-zinc-500",
  CLAIMED: "border-amber-500/50 bg-amber-500/10 text-amber-300",
  PAID: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  WAIVED: "border-violet-500/40 text-violet-300",
};
const PAYMENT_LABEL: Record<string, string> = {
  UNPAID: "unpaid",
  CLAIMED: "claimed — confirm on WhatsApp",
  PAID: "paid ✓",
  WAIVED: "waived",
};

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function ConsultationsPage() {
  const [leads, setLeads] = useState<ConsultationRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<ConsultationRow | null>(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [countryFilter, setCountryFilter] = useState("ALL");
  const [kindFilter, setKindFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");
  // Vol. 3 #3 — follow-up queue (due followUpDate, live outcome fields)
  const [followUps, setFollowUps] = useState<Array<ConsultationRow & { status: string }>>([]);

  const loadPipeline = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Full board: up to 200 most recent leads, unfiltered by status.
      const d = await getConsultations("ALL", 1, 200);
      setLeads(d.consultations);
      setCounts(d.counts ?? {});
      setTotal(d.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load the pipeline.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  // Vol. 3 #3 — load the follow-up queue alongside the pipeline.
  const loadFollowUps = useCallback(async () => {
    try {
      setFollowUps((await getFollowUpsDue()) as Array<ConsultationRow & { status: string }>);
    } catch {
      // queue is advisory — never block the board on it
    }
  }, []);
  useEffect(() => {
    loadFollowUps();
  }, [loadFollowUps]);

  // Vol. 3 #1 — outcome writer handler: optimistically patches the board
  // and the open drawer, then refreshes the follow-up queue.
  const saveOutcomeFor = useCallback(
    async (lead: ConsultationRow, input: OutcomeInput) => {
      setSavingStatus(true);
      try {
        await saveOutcome(lead.id, input);
        setLeads((prev) =>
          prev.map((c) =>
            c.id === lead.id
              ? {
                  ...c,
                  outcome: input.outcome !== undefined ? input.outcome || null : c.outcome,
                  patternDiagnosis: input.patternSlugs !== undefined
                    ? input.patternSlugs ? JSON.stringify(input.patternSlugs.split(",").map((s) => s.trim()).filter(Boolean)) : null
                    : c.patternDiagnosis,
                  prescribedSequence: input.sequenceSlug !== undefined ? input.sequenceSlug.trim() || null : c.prescribedSequence,
                  prescribedSiddhis: input.siddhiSlugs !== undefined
                    ? input.siddhiSlugs ? JSON.stringify(input.siddhiSlugs.split(",").map((s) => s.trim()).filter(Boolean)) : null
                    : c.prescribedSiddhis,
                  sessionNotes: input.sessionNotes !== undefined ? input.sessionNotes.trim() || null : c.sessionNotes,
                  followUpDate: input.followUpDate !== undefined ? (input.followUpDate ? new Date(input.followUpDate) : null) : c.followUpDate,
                  completedAt:
                    input.outcome === "RESOLVED" || input.outcome === "DISCONTINUED"
                      ? (c.completedAt ?? new Date())
                      : c.completedAt,
                }
              : c,
          ),
        );
        setSelected((s) => (s && s.id === lead.id ? { ...s } : s));
        loadFollowUps();
      } catch {
        setError("Saving outcome failed — try again.");
      } finally {
        setSavingStatus(false);
      }
    },
    [loadFollowUps],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leads.filter((c) => {
      if (countryFilter !== "ALL" && (c.country ?? "??") !== countryFilter) return false;
      if (kindFilter !== "ALL" && leadSource(c).kind !== kindFilter) return false;
      if (paymentFilter !== "ALL" && c.paymentState !== paymentFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.request.toLowerCase().includes(q)
      );
    });
  }, [leads, query, countryFilter, kindFilter, paymentFilter]);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const c of leads) set.add(c.country ?? "??");
    return [...set].sort();
  }, [leads]);

  const byStatus = useMemo(() => {
    const map: Record<string, ConsultationRow[]> = {};
    for (const s of PIPELINE) map[s] = [];
    for (const c of filtered) (map[c.status] ??= []).push(c);
    return map;
  }, [filtered]);

  const changeStatus = useCallback(
    async (lead: ConsultationRow, newStatus: string) => {
      setSavingStatus(true);
      try {
        await updateConsultationStatus(lead.id, newStatus);
        setLeads((prev) => prev.map((c) => (c.id === lead.id ? { ...c, status: newStatus } : c)));
        setCounts((prev) => ({
          ...prev,
          [lead.status]: Math.max(0, (prev[lead.status] ?? 1) - 1),
          [newStatus]: (prev[newStatus] ?? 0) + 1,
        }));
        setSelected((s) => (s && s.id === lead.id ? { ...s, status: newStatus } : s));
      } catch {
        setError("Status update failed — check your session and try again.");
      } finally {
        setSavingStatus(false);
      }
    },
    [],
  );

  const saveNotes = useCallback(
    async (lead: ConsultationRow, notes: string) => {
      setSavingStatus(true);
      try {
        await updateConsultationStatus(lead.id, lead.status, notes);
        setLeads((prev) => prev.map((c) => (c.id === lead.id ? { ...c, notes } : c)));
        setSelected((s) => (s && s.id === lead.id ? { ...s, notes } : s));
      } catch {
        setError("Saving notes failed — try again.");
      } finally {
        setSavingStatus(false);
      }
    },
    [],
  );

  const deleteLead = useCallback(
    async (lead: ConsultationRow) => {
      setSavingStatus(true);
      try {
        await deleteConsultation(lead.id);
        setSelected(null);
        await loadPipeline();
      } catch {
        setError("Delete failed — only ADMIN/SUPERADMIN can remove leads.");
      } finally {
        setSavingStatus(false);
      }
    },
    [loadPipeline],
  );

  /* Tier-1 ① — reconciliation actions of record (audited server-side). */
  const savePaymentPaid = useCallback(
    async (lead: ConsultationRow, utr: string) => {
      setSavingStatus(true);
      try {
        await setPaymentPaid(lead.id, utr || undefined);
        setLeads((prev) =>
          prev.map((c) =>
            c.id === lead.id
              ? { ...c, paymentState: "PAID", paidAt: new Date(), ...(utr ? { utrRef: utr } : {}) }
              : c,
          ),
        );
        setSelected((s) =>
          s && s.id === lead.id
            ? { ...s, paymentState: "PAID", paidAt: new Date(), ...(utr ? { utrRef: utr } : {}) }
            : s,
        );
      } catch {
        setError("Marking paid failed — check your session and try again.");
      } finally {
        setSavingStatus(false);
      }
    },
    [],
  );

  const savePaymentWaived = useCallback(
    async (lead: ConsultationRow) => {
      setSavingStatus(true);
      try {
        await setPaymentWaived(lead.id);
        setLeads((prev) => prev.map((c) => (c.id === lead.id ? { ...c, paymentState: "WAIVED", paidAt: null } : c)));
        setSelected((s) => (s && s.id === lead.id ? { ...s, paymentState: "WAIVED", paidAt: null } : s));
      } catch {
        setError("Waiving payment failed — try again.");
      } finally {
        setSavingStatus(false);
      }
    },
    [],
  );

  const converting = (counts["SCHEDULED"] ?? 0) + (counts["COMPLETED"] ?? 0);
  const conversionRate = total > 0 ? Math.round((converting / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Vol. 3 #3 — Follow-up queue: dates that have arrived */}
      {followUps.length > 0 && (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/80">
            Follow-ups due · {followUps.length}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {followUps.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f)}
                className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-left transition-colors hover:border-cyan-500/40"
              >
                <span className="text-xs font-medium text-zinc-200">{f.name}</span>
                <span className="ml-2 text-[0.65rem] text-zinc-500">
                  promised {f.followUpDate ? fmtDate(f.followUpDate) : "—"}
                  {f.outcome ? ` · ${f.outcome.toLowerCase()}` : ""}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Consultation Pipeline</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {total} lead{total === 1 ? "" : "s"} · wizard intake → WhatsApp handoff · sources attributed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, intake…"
            className="w-56 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
          />
          <a
            href="/api/admin/consultations/export"
            className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-amber-500/30 hover:text-amber-300"
            title="Download every lead as CSV (ADMIN+; audit-logged)"
          >
            Export CSV
          </a>
          <button
            onClick={loadPipeline}
            className="rounded-lg border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition-colors hover:border-amber-500/30 hover:text-amber-300"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Total leads", value: total },
          { label: "New", value: counts["NEW"] ?? 0 },
          { label: "Acknowledged", value: counts["ACKNOWLEDGED"] ?? 0 },
          { label: "Scheduled", value: counts["SCHEDULED"] ?? 0 },
          { label: "Completed", value: counts["COMPLETED"] ?? 0 },
          { label: "Booking rate", value: `${conversionRate}%` },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
            <p className="text-xs text-zinc-500">{s.label}</p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{loading ? "—" : s.value}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}
      {loading && <p className="text-sm text-zinc-500">Loading pipeline…</p>}

      {/* Geo + source-kind filter chips (client-side over the loaded board) */}
      {!loading && leads.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-600">Geo:</span>
            {(["ALL", ...countries] as string[]).map((c) => (
              <button
                key={c}
                onClick={() => setCountryFilter(c)}
                className={`rounded-full border px-2 py-0.5 transition ${countryFilter === c ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
              >
                {c === "ALL" ? "all" : c === "??" ? "unknown" : c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-600">Source:</span>
            {(["ALL", "organic", "referral", "paid", "direct"] as const).map((kind) => (
              <button
                key={kind}
                onClick={() => setKindFilter(kind)}
                className={`rounded-full border px-2 py-0.5 capitalize transition ${kindFilter === kind ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : "border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
              >
                {kind.toLowerCase()}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-zinc-600">Payment:</span>
            {PAYMENT_STATES.map((p) => (
              <button
                key={p}
                onClick={() => setPaymentFilter(p)}
                className={`rounded-full border px-2 py-0.5 capitalize transition ${paymentFilter === p ? "border-amber-500/40 bg-amber-500/10 text-amber-300" : PAYMENT_CHIP[p]}`}
              >
                {p.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Kanban board — horizontal snap-scroll on small screens, 5-col grid on xl */}
      <div className="overflow-x-auto pb-2 snap-x snap-mandatory xl:overflow-visible">
        <div className="grid min-w-[900px] grid-cols-5 gap-4 xl:min-w-0">
          {PIPELINE.map((status) => (
            <div key={status} className="snap-start rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${STATUS_DOT[status]}`} />
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    {status === "ACKNOWLEDGED" ? "Contacted" : status}
                  </h2>
                </div>
                <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-400">
                  {loading ? "—" : counts[status] ?? 0}
                </span>
              </div>
              <div className="space-y-3">
                {byStatus[status].map((lead) => (
                  <LeadCard key={lead.id} lead={lead} onOpen={() => setSelected(lead)} />
                ))}
                {!loading && byStatus[status].length === 0 && (
                  <p className="px-1 py-4 text-xs text-zinc-700">Empty</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <LeadDrawer
          lead={selected}
          saving={savingStatus}
          onClose={() => setSelected(null)}
          onStatus={(s) => changeStatus(selected, s)}
          onSaveNotes={(n) => saveNotes(selected, n)}
          onSavePaymentPaid={(utr) => savePaymentPaid(selected, utr)}
          onSavePaymentWaived={() => savePaymentWaived(selected)}
          onSaveOutcome={(input) => saveOutcomeFor(selected, input)}
          onDelete={() => deleteLead(selected)}
        />
      )}
    </div>
  );
}

/* ─── Vol. 3 #1 — Outcome section ───────────────────────────────────── */

function slugsToText(json: string | null): string {
  if (!json) return "";
  try {
    return (JSON.parse(json) as string[]).join(", ");
  } catch {
    return "";
  }
}

function OutcomeSection({
  lead,
  saving,
  onSave,
}: {
  lead: ConsultationRow;
  saving: boolean;
  onSave: (input: OutcomeInput) => void;
}) {
  const [outcome, setOutcome] = useState(lead.outcome ?? "");
  const [patternSlugs, setPatternSlugs] = useState(slugsToText(lead.patternDiagnosis));
  const [sequenceSlug, setSequenceSlug] = useState(lead.prescribedSequence ?? "");
  const [siddhiSlugs, setSiddhiSlugs] = useState(slugsToText(lead.prescribedSiddhis));
  const [sessionNotes, setSessionNotes] = useState(lead.sessionNotes ?? "");
  const [followUpDate, setFollowUpDate] = useState(
    lead.followUpDate ? new Date(lead.followUpDate).toISOString().slice(0, 16) : "",
  );
  // Render-time state adjustment — same pattern as the notes draft above:
  // reset when a different lead opens or server state moved under us.
  const [prevKey, setPrevKey] = useState(`${lead.id}:${lead.updatedAt}`);
  if (prevKey !== `${lead.id}:${lead.updatedAt}`) {
    setPrevKey(`${lead.id}:${lead.updatedAt}`);
    setOutcome(lead.outcome ?? "");
    setPatternSlugs(slugsToText(lead.patternDiagnosis));
    setSequenceSlug(lead.prescribedSequence ?? "");
    setSiddhiSlugs(slugsToText(lead.prescribedSiddhis));
    setSessionNotes(lead.sessionNotes ?? "");
    setFollowUpDate(lead.followUpDate ? new Date(lead.followUpDate).toISOString().slice(0, 16) : "");
  }

  const dirty =
    outcome !== (lead.outcome ?? "") ||
    patternSlugs !== slugsToText(lead.patternDiagnosis) ||
    sequenceSlug !== (lead.prescribedSequence ?? "") ||
    siddhiSlugs !== slugsToText(lead.prescribedSiddhis) ||
    sessionNotes !== (lead.sessionNotes ?? "") ||
    followUpDate !== (lead.followUpDate ? new Date(lead.followUpDate).toISOString().slice(0, 16) : "");

  return (
    <div className="mt-5 space-y-3 rounded-lg border border-cyan-500/20 bg-cyan-500/[0.03] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400/80">Session outcome (dossier)</p>
        {lead.outcome && (
          <span className={`rounded-full border px-2.5 py-0.5 text-[0.65rem] ${OUTCOME_COLOR[lead.outcome] ?? ""}`}>
            {lead.outcome}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs text-zinc-500">Outcome</span>
          <select
            value={outcome}
            disabled={saving}
            onChange={(e) => setOutcome(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500/40 focus:outline-none"
          >
            <option value="">— not set —</option>
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="DISCONTINUED">DISCONTINUED</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs text-zinc-500">Follow-up date (feeds the queue)</span>
          <input
            type="datetime-local"
            value={followUpDate}
            disabled={saving}
            onChange={(e) => setFollowUpDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500/40 focus:outline-none"
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-zinc-500">Pattern diagnosis (comma-separated slugs)</span>
        <input
          type="text"
          value={patternSlugs}
          disabled={saving}
          onChange={(e) => setPatternSlugs(e.target.value)}
          placeholder="the-rescuer, the-controller"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none"
        />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="space-y-1">
          <span className="text-xs text-zinc-500">Prescribed sequence (slug)</span>
          <input
            type="text"
            value={sequenceSlug}
            disabled={saving}
            onChange={(e) => setSequenceSlug(e.target.value)}
            placeholder="foundation-of-stillness"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-zinc-500">Prescribed siddhis (slugs)</span>
          <input
            type="text"
            value={siddhiSlugs}
            disabled={saving}
            onChange={(e) => setSiddhiSlugs(e.target.value)}
            placeholder="nadi-shuddhi, soham-dhyana"
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none"
          />
        </label>
      </div>
      <label className="block space-y-1">
        <span className="text-xs text-zinc-500">Session notes (visible in the dossier)</span>
        <textarea
          rows={3}
          value={sessionNotes}
          disabled={saving}
          onChange={(e) => setSessionNotes(e.target.value)}
          placeholder="What surfaced, what was prescribed, what to watch…"
          className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none"
        />
      </label>
      <button
        onClick={() =>
          onSave({
            outcome: outcome || undefined,
            patternSlugs,
            sequenceSlug,
            siddhiSlugs,
            sessionNotes,
            followUpDate: followUpDate || null,
          })
        }
        disabled={saving || !dirty}
        className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Saving…" : "Save outcome"}
      </button>
      <p className="text-[0.65rem] text-zinc-600">
        RESOLVED / DISCONTINUED stamp completedAt (once). Audited, webhook-fired, bell-rung.
      </p>
    </div>
  );
}

/* ─── Lead card ───────────────────────────────────────────────────────────── */

function LeadCard({ lead, onOpen }: { lead: ConsultationRow; onOpen: () => void }) {
  const src = leadSource(lead);
  return (
    <button
      onClick={onOpen}
      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 text-left transition-colors hover:border-amber-500/30 hover:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate text-sm font-medium text-zinc-200">{lead.name}</p>
        <span className="shrink-0 text-[0.65rem] text-zinc-600">{timeAgo(lead.createdAt)}</span>
      </div>
      <p className="mt-0.5 truncate text-xs text-zinc-500">{lead.phone || lead.email || "—"}</p>
      <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">{lead.request}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className={`rounded-full border px-2 py-0.5 text-[0.65rem] ${SOURCE_CHIP[src.kind]}`}>
          {src.label}
        </span>
        {lead.clickId && (
          <span className="rounded-full border border-emerald-500/40 px-2 py-0.5 text-[0.65rem] text-emerald-300">
            {lead.clickId}
          </span>
        )}
        {lead.paymentState !== "UNPAID" && (
          <span className={`rounded-full border px-2 py-0.5 text-[0.65rem] ${PAYMENT_CHIP[lead.paymentState] ?? PAYMENT_CHIP.UNPAID}`}>
            {PAYMENT_LABEL[lead.paymentState] ?? lead.paymentState.toLowerCase()}
          </span>
        )}
        {lead.outcome && (
          <span className={`rounded-full border px-2 py-0.5 text-[0.65rem] ${OUTCOME_COLOR[lead.outcome] ?? ""}`}>
            {lead.outcome.toLowerCase()}
          </span>
        )}
        {lead.notes && (
          <span className="rounded-full border border-zinc-700 px-2 py-0.5 text-[0.65rem] text-zinc-500" title={lead.notes}>
            note
          </span>
        )}
      </div>
    </button>
  );
}

/* ─── Detail drawer ───────────────────────────────────────────────────────── */

function LeadDrawer({
  lead,
  saving,
  onClose,
  onStatus,
  onSaveNotes,
  onSavePaymentPaid,
  onSavePaymentWaived,
  onSaveOutcome,
  onDelete,
}: {
  lead: ConsultationRow;
  saving: boolean;
  onClose: () => void;
  onStatus: (s: string) => void;
  onSaveNotes: (n: string) => void;
  onSavePaymentPaid: (utr: string) => void;
  onSavePaymentWaived: () => void;
  onSaveOutcome: (input: OutcomeInput) => void;
  onDelete: () => void;
}) {
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [utr, setUtr] = useState(lead.utrRef ?? "");
  // Render-time state adjustment (react-hooks/set-state-in-effect): reset the
  // draft when a different lead is opened or its server-side notes change —
  // same semantics as the previous effect-based reset, without the effect.
  const [prevId, setPrevId] = useState(lead.id);
  const [prevNotes, setPrevNotes] = useState<string | null>(lead.notes);
  if (prevId !== lead.id || prevNotes !== lead.notes) {
    setPrevId(lead.id);
    setPrevNotes(lead.notes);
    setNotes(lead.notes ?? "");
    setUtr(lead.utrRef ?? "");
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const snapshot = parseSnapshot(lead.attributionJson);
  const src = leadSource(lead);

  const waHref = useMemo(() => {
    const digits = lead.phone.replace(/\D/g, "");
    if (digits.length < 7) return null;
    const first = lead.name.trim().split(/\s+/)[0] || "there";
    const text = [
      `Namaste ${first} — Kaustubh here from KALKI.`,
      "",
      "I received your consultation intake on astrokalki.com. The patterns you marked are a strong starting point for our first session.",
      "",
      "When would a video call work for you?",
    ].join("\n");
    return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
  }, [lead.name, lead.phone]);

  const touchRows = (touch: AttributionSnapshot["first"], title: string) => {
    if (!touch) return null;
    const rows: Array<[string, string | undefined]> = [
      ["Source", touch.source],
      ["Medium", touch.medium],
      ["Campaign", touch.campaign],
      ["Country", touch.country],
      ["Landing", touch.landingPath],
      ["Referrer", touch.referrer],
      ["At", fmtDate(touch.ts)],
    ];
    const visible = rows.filter(([, v]) => v);
    if (visible.length === 0) return null;
    return (
      <div>
        <p className="mb-1 text-xs font-medium text-zinc-400">{title}</p>
        <dl className="space-y-1">
          {visible.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs">
              <dt className="w-20 shrink-0 text-zinc-600">{k}</dt>
              <dd className="break-all text-zinc-300">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <aside
        className="h-full w-full max-w-xl overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[lead.status]}`}>
                {lead.status}
              </span>
              <span className={`rounded-full border px-2.5 py-0.5 text-xs ${SOURCE_CHIP[src.kind]}`}>{src.label}</span>
            </div>
            <h2 className="mt-2 text-xl font-semibold text-zinc-100">{lead.name}</h2>
            <p className="mt-0.5 text-sm text-zinc-500">
              {lead.phone || "no phone"} {lead.email ? `· ${lead.email}` : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-800 px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-300"
            aria-label="Close"
          >
            Esc ✕
          </button>
        </div>

        {/* WhatsApp follow-up */}
        {waHref && (
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Follow up on WhatsApp
          </a>
        )}

        {/* Intake */}
        <div className="mt-5">
          <p className="mb-1 text-xs font-medium text-zinc-400">Intake</p>
          <pre className="whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-xs leading-relaxed text-zinc-300">
            {lead.request}
          </pre>
          <p className="mt-1.5 text-[0.65rem] text-zinc-600">
            Received {fmtDate(lead.createdAt)} · Updated {fmtDate(lead.updatedAt)}
            {lead.landingPath ? ` · Landed on ${lead.landingPath}` : ""}
          </p>
        </div>

        {/* Attribution drill-down */}
        <div className="mt-5 space-y-3 rounded-lg border border-zinc-800/80 bg-zinc-900/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Attribution</p>
          {snapshot ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {touchRows(snapshot.first, "First touch")}
                {touchRows(snapshot.last, "Last touch")}
              </div>
              <p className="text-[0.65rem] text-zinc-600">
                {snapshot.sessions ?? 1} session{(snapshot.sessions ?? 1) === 1 ? "" : "s"} before submitting
              </p>
            </>
          ) : (
            <p className="text-xs text-zinc-600">
              No snapshot recorded — this lead predates the attribution layer or cookies were blocked.
              Flat fields: {lead.utmSource || "—"} / {lead.utmMedium || "—"} {lead.referrerDomain ? `· ref ${lead.referrerDomain}` : ""} {lead.country ? `· ${lead.country}` : ""}
            </p>
          )}
        </div>

        {/* Tier-1 ① — Payment reconciliation */}
        <div className="mt-5 rounded-lg border border-zinc-800/80 bg-zinc-900/20 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Payment (UPI manual rail)</p>
            <span className={`rounded-full border px-2.5 py-0.5 text-[0.65rem] ${PAYMENT_CHIP[lead.paymentState] ?? PAYMENT_CHIP.UNPAID}`}>
              {PAYMENT_LABEL[lead.paymentState] ?? lead.paymentState.toLowerCase()}
            </span>
          </div>
          <p className="mt-1.5 text-[0.65rem] text-zinc-600">
            {lead.paymentSession
              ? `Session: ${lead.paymentSession.replace(/-/g, " ")} · INR ${lead.paymentSession === "shadow-pattern-reading" ? "3,499" : "1,999"}`
              : "No session chosen yet — the seeker stayed on the free path."}
            {lead.paidAt ? ` · Paid ${fmtDate(lead.paidAt)}` : ""}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              placeholder="UPI ref / UTR…"
              className="w-40 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
            />
            <button
              onClick={() => onSavePaymentPaid(utr)}
              disabled={saving}
              className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Mark paid
            </button>
            <button
              onClick={() => onSavePaymentWaived()}
              disabled={saving}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Waive
            </button>
          </div>
          <p className="mt-1.5 text-[0.65rem] text-zinc-600">
            Reconciliation is audited and bell-rung. CLAIMED = seeker said they paid — verify the UTR in your UPI app.
          </p>
        </div>

        {/* Status */}
        <div className="mt-5">
          <label htmlFor="lead-status" className="mb-1 block text-xs font-medium text-zinc-400">
            Pipeline stage
          </label>
          <select
            id="lead-status"
            value={lead.status}
            disabled={saving}
            onChange={(e) => onStatus(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 focus:border-amber-500/40 focus:outline-none"
          >
            {PIPELINE.map((s) => (
              <option key={s} value={s}>
                {s === "ACKNOWLEDGED" ? "CONTACTED" : s}
              </option>
            ))}
          </select>
          {saving && <p className="mt-1 text-xs text-amber-400/80">Saving…</p>}
        </div>

        {/* Notes */}
        <div className="mt-5">
          <label htmlFor="lead-notes" className="mb-1 block text-xs font-medium text-zinc-400">
            Archivist notes
          </label>
          <textarea
            id="lead-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Call outcomes, session notes, follow-ups…"
            className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
          />
          <button
            onClick={() => onSaveNotes(notes)}
            disabled={saving || notes === (lead.notes ?? "")}
            className="mt-2 rounded-lg bg-amber-500/20 px-4 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save notes
          </button>
        </div>

        {/* Vol. 3 #1 — Session outcome (the archivist writes what /dossier reads) */}
        <OutcomeSection key={lead.id} lead={lead} saving={saving} onSave={onSaveOutcome} />

        {/* Danger zone */}
        <div className="mt-6 border-t border-zinc-800/80 pt-4">
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Delete lead "${lead.name}" permanently? This cannot be undone.`,
                )
              ) {
                onDelete();
              }
            }}
            disabled={saving}
            className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-2 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Delete lead permanently
          </button>
          <p className="mt-1.5 text-[0.65rem] text-zinc-600">
            Admin/Superadmin only · recorded in the audit log
          </p>
        </div>
      </aside>
    </div>
  );
}

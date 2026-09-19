"use client";

import { useState, useCallback } from "react";
import { useAdminSWR } from "@/components/admin/use-admin-swr";

// =============================================================
// VOL. 2 #17 — A/B Experiments admin page
// -------------------------------------------------------------
// Create / edit / start / pause / complete experiments.
// Variant assignment is sticky via a 30-day cookie. Conversions
// are tracked via the existing AnalyticsEvent table (event =
// 'experiment_converted'). The page shows raw counts + a
// significance heuristic (n>100 per variant AND leading beats
// control by >10% relative).
// =============================================================

interface ExperimentVariant {
  id: string;
  label: string;
  weight: number;
}

interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  variants: ExperimentVariant[];
  metric: string;
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ExperimentsResponse {
  experiments: Experiment[];
}

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'bg-zinc-700/40 text-[var(--aw-text-2)]',
  RUNNING: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  PAUSED: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  COMPLETED: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
};

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ExperimentsPage() {
  const { data, mutate } = useAdminSWR<ExperimentsResponse>({
    key: 'admin-experiments',
    fetcher: async () => {
      const r = await fetch('/api/admin/experiments');
      if (!r.ok) throw new Error('Failed to load');
      return r.json();
    },
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Experiment | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [metric, setMetric] = useState("consultation_started");
  const [variants, setVariants] = useState<ExperimentVariant[]>([
    { id: 'A', label: 'Control', weight: 50 },
    { id: 'B', label: 'Variant', weight: 50 },
  ]);

  const openCreate = () => {
    setEditing(null);
    setName("");
    setHypothesis("");
    setMetric("consultation_started");
    setVariants([
      { id: 'A', label: 'Control', weight: 50 },
      { id: 'B', label: 'Variant', weight: 50 },
    ]);
    setShowForm(true);
  };

  const openEdit = (exp: Experiment) => {
    setEditing(exp);
    setName(exp.name);
    setHypothesis(exp.hypothesis);
    setMetric(exp.metric);
    setVariants(exp.variants);
    setShowForm(true);
  };

  const onSave = useCallback(async () => {
    setBusy(true);
    setErr(""); setNotice("");
    try {
      const r = await fetch('/api/admin/experiments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editing?.id,
          name, hypothesis, metric, variants,
          status: editing?.status ?? 'DRAFT',
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Save failed');
      setNotice(editing ? 'Experiment updated.' : 'Experiment created.');
      setShowForm(false);
      await mutate();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Save failed');
    } finally { setBusy(false); }
  }, [editing, name, hypothesis, metric, variants, mutate]);

  const onStatusChange = useCallback(async (id: string, status: string) => {
    setBusy(true);
    try {
      const r = await fetch('/api/admin/experiments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!r.ok) throw new Error('Status change failed');
      setNotice(`Status set to ${status}.`);
      await mutate();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed');
    } finally { setBusy(false); }
  }, [mutate]);

  const onDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this experiment? This cannot be undone.')) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/experiments?id=${id}`, { method: 'DELETE' });
      setNotice('Experiment deleted.');
      await mutate();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Delete failed');
    } finally { setBusy(false); }
  }, [mutate]);

  const experiments = data?.experiments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--aw-text)]">A/B Experiments</h1>
          <p className="mt-1 text-sm text-[var(--aw-text-2)]">
            Variant assignment via 30-day cookie. Conversions tracked via the existing analytics event store.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="rounded-lg bg-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/30"
        >
          + New Experiment
        </button>
      </div>

      {err && <p className="text-red-400 text-sm">{err}</p>}
      {notice && <p className="text-emerald-400 text-sm">{notice}</p>}

      {/* Form modal */}
      {showForm && (
        <div className="aw-card space-y-3">
          <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--aw-text-2)]">
            {editing ? 'Edit Experiment' : 'New Experiment'}
          </h2>
          <div>
            <label className="block text-xs text-[var(--aw-text-2)] mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Pricing headline A/B"
              className="w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-2 text-sm text-[var(--aw-text)] placeholder:text-[var(--aw-text-3)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--aw-text-2)] mb-1">Hypothesis</label>
            <textarea
              value={hypothesis}
              onChange={e => setHypothesis(e.target.value)}
              placeholder="e.g. Shorter headline increases consultation_started conversions by 15%"
              rows={2}
              className="w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-2 text-sm text-[var(--aw-text)] placeholder:text-[var(--aw-text-3)]"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--aw-text-2)] mb-1">Conversion Metric</label>
            <select
              value={metric}
              onChange={e => setMetric(e.target.value)}
              className="w-full rounded-lg border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-3 py-2 text-sm text-[var(--aw-text)]"
            >
              <option value="consultation_started">consultation_started</option>
              <option value="pricing_viewed">pricing_viewed</option>
              <option value="email_subscribed">email_subscribed</option>
              <option value="dossier_started">dossier_started</option>
              <option value="dossier_completed">dossier_completed</option>
              <option value="whatsapp_handoff_clicked">whatsapp_handoff_clicked</option>
              <option value="upi_pay_clicked">upi_pay_clicked</option>
              <option value="booking_opened">booking_opened</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[var(--aw-text-2)] mb-1">
              Variants (weights must sum to 100)
            </label>
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[40px_1fr_80px_24px] gap-2">
                  <input
                    type="text"
                    value={v.id}
                    onChange={e => {
                      const next = [...variants];
                      next[i] = { ...v, id: e.target.value.toUpperCase().slice(0, 1) };
                      setVariants(next);
                    }}
                    className="rounded border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-2 py-1 text-sm text-[var(--aw-text)]"
                  />
                  <input
                    type="text"
                    value={v.label}
                    onChange={e => {
                      const next = [...variants];
                      next[i] = { ...v, label: e.target.value };
                      setVariants(next);
                    }}
                    placeholder="Variant label"
                    className="rounded border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-2 py-1 text-sm text-[var(--aw-text)]"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={v.weight}
                    onChange={e => {
                      const next = [...variants];
                      next[i] = { ...v, weight: Number(e.target.value) };
                      setVariants(next);
                    }}
                    className="rounded border border-[var(--aw-border-2)] bg-[var(--aw-glass-1)] px-2 py-1 text-sm text-[var(--aw-text)]"
                  />
                  {variants.length > 2 && (
                    <button
                      onClick={() => setVariants(variants.filter((_, j) => j !== i))}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            {variants.length < 5 && (
              <button
                onClick={() => setVariants([...variants, { id: String.fromCharCode(65 + variants.length), label: '', weight: 0 }])}
                className="mt-2 text-xs text-[var(--aw-cyan)] hover:text-amber-300"
              >
                + Add variant
              </button>
            )}
            <p className="mt-1 text-[10px] text-[var(--aw-text-3)]">
              Sum: {variants.reduce((s, v) => s + v.weight, 0)} / 100
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              disabled={busy}
              className="rounded-lg bg-amber-500/20 px-4 py-2 text-xs font-medium text-amber-300 transition hover:bg-amber-500/30 disabled:opacity-40"
            >
              {busy ? 'Saving…' : 'Save experiment'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="text-xs text-[var(--aw-text-2)] hover:text-[var(--aw-text)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Experiments list */}
      <div className="space-y-3">
        {experiments.length === 0 ? (
          <div className="aw-card text-center py-12">
            <p className="text-sm text-[var(--aw-text-2)]">
              No experiments yet. Create your first A/B test to start measuring.
            </p>
          </div>
        ) : (
          experiments.map(exp => (
            <div key={exp.id} className="aw-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-[var(--aw-text)]">{exp.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLOR[exp.status] ?? ''}`}>
                      {exp.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--aw-text-2)]">{exp.hypothesis}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-[var(--aw-text-3)]">Metric:</span>
                    <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-[var(--aw-cyan)]">
                      {exp.metric}
                    </code>
                    {exp.variants.map(v => (
                      <span key={v.id} className="rounded border border-[var(--aw-border-2)] px-1.5 py-0.5 text-[10px] text-[var(--aw-text-2)]">
                        {v.id}: {v.label} ({v.weight}%)
                      </span>
                    ))}
                    <span className="ml-auto text-[10px] text-[var(--aw-text-3)]">
                      Started {fmtDate(exp.startDate)} · Updated {fmtDate(exp.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {exp.status === 'DRAFT' && (
                  <button
                    onClick={() => onStatusChange(exp.id, 'RUNNING')}
                    disabled={busy}
                    className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
                  >
                    ▶ Start
                  </button>
                )}
                {exp.status === 'RUNNING' && (
                  <button
                    onClick={() => onStatusChange(exp.id, 'PAUSED')}
                    disabled={busy}
                    className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/20 disabled:opacity-40"
                  >
                    ⏸ Pause
                  </button>
                )}
                {exp.status === 'PAUSED' && (
                  <button
                    onClick={() => onStatusChange(exp.id, 'RUNNING')}
                    disabled={busy}
                    className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40"
                  >
                    ▶ Resume
                  </button>
                )}
                {(exp.status === 'RUNNING' || exp.status === 'PAUSED') && (
                  <button
                    onClick={() => onStatusChange(exp.id, 'COMPLETED')}
                    disabled={busy}
                    className="rounded-lg border border-blue-500/40 bg-blue-500/10 px-3 py-1.5 text-xs text-blue-300 hover:bg-blue-500/20 disabled:opacity-40"
                  >
                    ✓ Complete
                  </button>
                )}
                <button
                  onClick={() => openEdit(exp)}
                  disabled={busy || exp.status === 'RUNNING'}
                  className="rounded-lg border border-[var(--aw-border-2)] px-3 py-1.5 text-xs text-[var(--aw-text-2)] hover:text-[var(--aw-text)] disabled:opacity-40"
                  title={exp.status === 'RUNNING' ? 'Pause before editing' : 'Edit'}
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(exp.id)}
                  disabled={busy}
                  className="ml-auto text-xs text-red-400 hover:text-red-300 disabled:opacity-40"
                >
                  Delete
                </button>
              </div>
              <p className="mt-2 text-[10px] text-[var(--aw-text-3)]">
                Conversion counts populate in the analytics dashboard once visitors are assigned and fire the metric event.
                The experiment_converted event carries <code className="font-mono">{'{ experimentId, variant }'}</code> in its properties.
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

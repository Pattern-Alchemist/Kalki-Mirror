"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getMemberships,
  createMembership,
  grantMembership,
  cancelMembership,
  type MembershipRow,
} from "./actions";

const STATUSES = ["PENDING", "ACTIVE", "CANCELLED"] as const;
const STATUS_CHIP: Record<string, string> = {
  PENDING: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  ACTIVE: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  CANCELLED: "border-zinc-700 text-zinc-500",
};

function fmtDate(iso: unknown): string {
  if (!iso || typeof iso !== "string" && !(iso instanceof Date)) return "—";
  const d = new Date(iso as string | Date);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export default function MembershipsPage() {
  const [rows, setRows] = useState<MembershipRow[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  // Create form
  const [form, setForm] = useState({ name: "", email: "", phone: "", plan: "akash", utrRef: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const d = await getMemberships();
      setRows(d.memberships);
      setCounts(d.counts ?? {});
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load memberships.");
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
      const res = await createMembership({
        name: form.name,
        email: form.email,
        phone: form.phone,
        plan: form.plan,
        utrRef: form.utrRef || undefined,
      });
      if (res.success) {
        setNotice(`Ledger entry created for ${form.email} — grant when reconciled.`);
        setForm({ name: "", email: "", phone: "", plan: form.plan, utrRef: "" });
        await load();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed.");
    } finally {
      setBusy(false);
    }
  }, [form, load]);

  const onGrant = useCallback(async (m: MembershipRow) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const res = await grantMembership(m.id);
      if (res.success) {
        setNotice(`${m.name || m.email} granted ${m.plan}.`);
        await load();
      } else {
        setError(res.error ?? "Grant failed.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Grant failed.");
    } finally {
      setBusy(false);
    }
  }, [load]);

  const onCancel = useCallback(async (m: MembershipRow) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await cancelMembership(m.id);
      setNotice(`${m.name || m.email} marked CANCELLED (tier not auto-reverted).`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Cancel failed.");
    } finally {
      setBusy(false);
    }
  }, [load]);

  const pending = rows.filter((m) => m.status === "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Memberships</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Akash tier ledger — UPI manual rail → reconcile → grant. Grants elevate User.tier.
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

      {/* Manual ledger entry */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">New ledger entry</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Name"
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
          />
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="Email (required)"
            type="email"
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
          />
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="WhatsApp (optional)"
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
          />
          <select
            value={form.plan}
            onChange={(e) => setForm({ ...form, plan: e.target.value })}
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 focus:border-amber-500/40 focus:outline-none"
          >
            <option value="jal">jal — Water (₹499)</option>
            <option value="agni">agni — Fire (₹1,499)</option>
            <option value="akash">akash — Akash (₹4,999)</option>
          </select>
          <input
            value={form.utrRef}
            onChange={(e) => setForm({ ...form, utrRef: e.target.value })}
            placeholder="UPI ref / UTR"
            className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-amber-500/40 focus:outline-none"
          />
        </div>
        <button
          onClick={onCreate}
          disabled={busy || !form.email.includes("@")}
          className="mt-3 rounded-lg bg-amber-500/20 px-4 py-2 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Create entry
        </button>
      </div>

      {/* Ledger table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase tracking-wider text-zinc-500">
              <th className="px-4 py-3 font-medium">Seeker</th>
              <th className="px-4 py-3 font-medium">Plan</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">UTR</th>
              <th className="px-4 py-3 font-medium">Requested</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-500">Loading ledger…</td></tr>
            )}
            {!loading && rows.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-500">No membership requests yet — the pricing page UPI flow lands here.</td></tr>
            )}
            {!loading && rows.map((m) => (
              <tr key={m.id} className="border-b border-zinc-800/60 last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-200">{m.name || "—"}{m.userName ? <span className="text-zinc-600"> · {m.userName}</span> : null}</p>
                  <p className="text-xs text-zinc-500">{m.email}{m.phone ? ` · ${m.phone}` : ""}</p>
                </td>
                <td className="px-4 py-3 text-zinc-300">{m.plan}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full border px-2.5 py-0.5 text-xs ${STATUS_CHIP[m.status] ?? ""}`}>{m.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-400">{m.utrRef || "—"}</td>
                <td className="px-4 py-3 text-xs text-zinc-500">{fmtDate(m.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {m.status !== "ACTIVE" && (
                      <button
                        onClick={() => onGrant(m)}
                        disabled={busy}
                        className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Grant
                      </button>
                    )}
                    {m.status !== "CANCELLED" && (
                      <button
                        onClick={() => onCancel(m)}
                        disabled={busy}
                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pending.length > 0 && (
        <p className="text-xs text-zinc-600">
          {pending.length} pending request{pending.length === 1 ? "" : "s"} — verify the UTR in your UPI app, then Grant. No console account yet? Share a Golden Key first.
        </p>
      )}
    </div>
  );
}

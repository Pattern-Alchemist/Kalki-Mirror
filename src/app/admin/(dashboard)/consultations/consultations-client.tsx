"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateConsultationStatus, scheduleConsultation, type ConsultationRow } from "./actions";

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-amber-500/10 text-amber-400",
  ACKNOWLEDGED: "bg-blue-500/10 text-blue-400",
  SCHEDULED: "bg-violet-500/10 text-violet-400",
  COMPLETED: "bg-emerald-500/10 text-emerald-400",
  CANCELLED: "bg-zinc-800 text-zinc-500",
};

const NEXT_STATUS: Record<string, string> = {
  NEW: "ACKNOWLEDGED",
  ACKNOWLEDGED: "SCHEDULED",
  SCHEDULED: "COMPLETED",
};

export function ConsultationsClient({
  initialConsultations,
  totalPages,
  currentPage,
  currentStatus,
}: {
  initialConsultations: ConsultationRow[];
  totalPages: number;
  currentPage: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scheduleId, setScheduleId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [noteId, setNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const [statusFilter, setStatusFilter] = useState(currentStatus);

  function applyFilter() {
    const params = new URLSearchParams();
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    startTransition(() => router.push(`/admin/consultations?${params.toString()}`));
  }

  function handleStatusAdvance(id: string, currentStatus: string) {
    const next = NEXT_STATUS[currentStatus];
    if (!next) return;
    startTransition(async () => {
      await updateConsultationStatus(id, next);
      router.refresh();
    });
  }

  function handleSchedule(id: string) {
    if (!scheduleDate) return;
    startTransition(async () => {
      await scheduleConsultation(id, scheduleDate);
      setScheduleId(null);
      setScheduleDate("");
      router.refresh();
    });
  }

  function handleCancel(id: string) {
    startTransition(async () => {
      await updateConsultationStatus(id, "CANCELLED");
      router.refresh();
    });
  }

  function handleSaveNote(id: string) {
    const c = initialConsultations.find(x => x.id === id);
    if (!c) return;
    startTransition(async () => {
      await updateConsultationStatus(id, c.status, noteText || undefined);
      setNoteId(null);
      setNoteText("");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="NEW">New</option>
          <option value="ACKNOWLEDGED">Acknowledged</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button onClick={applyFilter} disabled={isPending} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-700 disabled:opacity-50">
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-500">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Email</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Request</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Scheduled</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Date</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {initialConsultations.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-600">No consultation requests.</td></tr>
            )}
            {initialConsultations.map((c) => (
              <tr key={c.id} className="transition hover:bg-zinc-900/30">
                <td className="px-4 py-3">
                  <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)} className="text-left font-medium text-zinc-200 hover:text-amber-400 transition">
                    {c.name}
                  </button>
                </td>
                <td className="px-4 py-3 text-zinc-400">{c.email}</td>
                <td className="max-w-xs truncate px-4 py-3 text-zinc-400">{c.request}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[c.status] || STATUS_STYLES.NEW}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-zinc-500">
                  {c.scheduledFor ? new Date(c.scheduledFor).toLocaleDateString() : "—"}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {NEXT_STATUS[c.status] && (
                      <button
                        onClick={() => handleStatusAdvance(c.id, c.status)}
                        disabled={isPending}
                        className="text-xs text-amber-500 hover:text-amber-400 disabled:opacity-50"
                      >
                        → {NEXT_STATUS[c.status]}
                      </button>
                    )}
                    {c.status === "ACKNOWLEDGED" && (
                      <button
                        onClick={() => setScheduleId(c.id)}
                        disabled={isPending}
                        className="text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50"
                      >
                        Schedule
                      </button>
                    )}
                    {c.status !== "CANCELLED" && c.status !== "COMPLETED" && (
                      <button
                        onClick={() => handleCancel(c.id)}
                        disabled={isPending}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => { setNoteId(noteId === c.id ? null : c.id); setNoteText(c.notes || ""); }}
                      className="text-xs text-zinc-500 hover:text-zinc-300"
                    >
                      Note
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded detail */}
      {expandedId && (() => {
        const c = initialConsultations.find(x => x.id === expandedId);
        if (!c) return null;
        return (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-3">
            <div className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs text-zinc-600">Name</p><p className="text-sm text-zinc-200">{c.name}</p></div>
              <div><p className="text-xs text-zinc-600">Email</p><p className="text-sm text-zinc-200">{c.email}</p></div>
              <div><p className="text-xs text-zinc-600">User ID</p><p className="text-sm text-zinc-400 font-mono">{c.userId || "Guest"}</p></div>
              <div><p className="text-xs text-zinc-600">Submitted</p><p className="text-sm text-zinc-200">{new Date(c.createdAt).toLocaleString()}</p></div>
            </div>
            <div><p className="text-xs text-zinc-600">Request</p><p className="mt-1 text-sm text-zinc-300 whitespace-pre-wrap">{c.request}</p></div>
            {c.notes && <div><p className="text-xs text-zinc-600">Notes</p><p className="mt-1 text-sm text-zinc-400 whitespace-pre-wrap">{c.notes}</p></div>}
          </div>
        );
      })()}

      {/* Schedule modal */}
      {scheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setScheduleId(null)}>
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-medium text-zinc-200">Schedule Consultation</h3>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setScheduleId(null)} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">Cancel</button>
              <button onClick={() => handleSchedule(scheduleId)} disabled={isPending || !scheduleDate} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50">
                {isPending ? "Scheduling…" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note modal */}
      {noteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => { setNoteId(null); setNoteText(""); }}>
          <div className="w-full max-w-sm rounded-xl border border-zinc-700 bg-zinc-900 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-medium text-zinc-200">Edit Notes</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-amber-500/50 focus:outline-none resize-none"
              placeholder="Add internal notes…"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setNoteId(null); setNoteText(""); }} className="rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700">Cancel</button>
              <button onClick={() => handleSaveNote(noteId)} disabled={isPending} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-amber-500 disabled:opacity-50">
                Save
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
              <button
                key={p}
                onClick={() => {
                  const params = new URLSearchParams();
                  if (statusFilter !== "ALL") params.set("status", statusFilter);
                  if (p > 1) params.set("page", String(p));
                  router.push(`/admin/consultations?${params.toString()}`);
                }}
                className={`rounded px-2.5 py-1 text-xs transition ${p === currentPage ? "bg-amber-500/10 text-amber-400" : "hover:bg-zinc-800 text-zinc-400"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
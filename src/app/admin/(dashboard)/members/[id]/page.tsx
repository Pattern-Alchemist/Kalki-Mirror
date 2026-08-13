import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getMemberTimeline } from "../actions";
import { MemberTimeline } from "./timeline-client";

export const dynamic = "force-dynamic";

const TIER_BADGE: Record<string, string> = {
  prithvi: "bg-emerald-500/10 text-emerald-400",
  jal: "bg-blue-500/10 text-blue-400",
  agni: "bg-orange-500/10 text-orange-400",
  akash: "bg-violet-500/10 text-violet-400",
};

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    notFound();
  }

  const [user, timeline] = await Promise.all([
    db.user.findUnique({
      where: { id },
      include: {
        streaks: { orderBy: { lastPracticedAt: "desc" } },
        resolutions: { orderBy: { resolvedAt: "desc" } },
        keysGenerated: {
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { usages: true } } },
        },
        keysUsed: {
          orderBy: { usedAt: "desc" },
          include: { code: { select: { code: true } } },
        },
      },
    }),
    getMemberTimeline(id).catch(() => ({
      auditEvents: [],
      streaks: [],
      resolutions: [],
      keyUsages: [],
    })),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="space-y-4">
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 transition-colors hover:text-amber-400"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Members
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">
              {user.name || "Unnamed"}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">{user.email}</p>
          </div>
          <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400">
            {user.role}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TIER_BADGE[user.tier] || "text-zinc-400"}`}
          >
            {user.tier}
          </span>
        </div>
      </div>

      {/* ── Profile Card ── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Profile
        </h2>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="ID" value={user.id} mono />
          <Field label="Email" value={user.email} />
          <Field label="Name" value={user.name} />
          <Field label="Tier" value={user.tier} />
          <Field label="Role" value={user.role} />
          <Field label="Natal Moon Lng" value={user.natalMoonLng?.toString() ?? "—"} />
          <Field label="Birth Date" value={fmtDate(user.birthDate)} />
          <Field label="Birth Place" value={user.birthPlace} />
          <Field label="Latitude" value={user.latitude?.toString() ?? "—"} />
          <Field label="Longitude" value={user.longitude?.toString() ?? "—"} />
          <Field label="Timezone" value={user.timezone} />
          <Field label="Invited By Code" value={user.invitedByCode} />
          <Field label="Gold Keys Remaining" value={String(user.goldKeysRemaining)} />
          <Field label="Created At" value={formatDate(user.createdAt)} />
          <Field label="Last Transmission" value={formatDate(user.lastTransmissionDate)} />
        </div>
      </section>

      {/* ── A11: Activity Timeline ── */}
      <MemberTimeline timeline={JSON.parse(JSON.stringify(timeline))} userId={id} />

      {/* ── Sadhana Streaks ── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Sadhana Streaks
        </h2>
        {user.streaks.length === 0 ? (
          <p className="text-sm text-zinc-600">No streaks recorded.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-4 py-3 font-medium text-zinc-500">Practice</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Current</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Longest</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Total Days</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Last Practiced</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {user.streaks.map((s) => (
                  <tr key={s.id} className="transition hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-medium text-zinc-200">{s.practiceName}</td>
                    <td className="px-4 py-3 tabular-nums text-amber-400">{s.currentStreak}</td>
                    <td className="px-4 py-3 tabular-nums text-zinc-300">{s.longestStreak}</td>
                    <td className="px-4 py-3 tabular-nums text-zinc-400">{s.totalDays}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(s.lastPracticedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Pattern Resolutions ── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Pattern Resolutions
        </h2>
        {user.resolutions.length === 0 ? (
          <p className="text-sm text-zinc-600">No resolutions recorded.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-4 py-3 font-medium text-zinc-500">Pattern</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Recognized</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Resolved</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Days to Resolve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {user.resolutions.map((r) => (
                  <tr key={r.id} className="transition hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-medium text-zinc-200">{r.patternName}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{fmtDate(r.recognizedAt)}</td>
                    <td className="px-4 py-3 text-xs text-zinc-400">{fmtDate(r.resolvedAt)}</td>
                    <td className="px-4 py-3 tabular-nums text-amber-400">{r.daysToResolve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Keys Generated ── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Keys Generated
        </h2>
        {user.keysGenerated.length === 0 ? (
          <p className="text-sm text-zinc-600">No keys generated.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-4 py-3 font-medium text-zinc-500">Code</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Tier Granted</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Active</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Uses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {user.keysGenerated.map((k) => (
                  <tr key={k.id} className="transition hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-mono text-xs text-amber-400">{k.code}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TIER_BADGE[k.tierGranted] || "text-zinc-400"}`}>
                        {k.tierGranted}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {k.active ? (
                        <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="inline-flex h-2 w-2 rounded-full bg-zinc-600" />
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-zinc-400">
                      {k._count.usages}/{k.maxUses}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Keys Used ── */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          Keys Used
        </h2>
        {user.keysUsed.length === 0 ? (
          <p className="text-sm text-zinc-600">No keys used.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50">
                  <th className="px-4 py-3 font-medium text-zinc-500">Code</th>
                  <th className="px-4 py-3 font-medium text-zinc-500">Used At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {user.keysUsed.map((u) => (
                  <tr key={u.id} className="transition hover:bg-zinc-900/30">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-300">{u.code.code}</td>
                    <td className="px-4 py-3 text-xs text-zinc-500">{formatDate(u.usedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Tiny field display helper ── */
function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd
        className={`mt-0.5 text-sm text-zinc-200 ${
          mono ? "font-mono text-xs text-zinc-400 break-all" : ""
        }`}
      >
        {value || "—"}
      </dd>
    </div>
  );
}
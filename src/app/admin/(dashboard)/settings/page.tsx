import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getCorpusStats } from "@/lib/static-db";
import { SecuritySection } from "./security-section";
import { TwoFactorSection } from "./two-factor-section";
import { WebhookSection } from "./webhook-section";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const [userCount, keyCount, consultationCount, contentCount, auditCount] =
    await Promise.all([
      db.user.count(),
      db.inviteCode.count(),
      db.consultation.count(),
      db.contentEntry.count(),
      db.adminAuditLog.count(),
    ]);

  let corpusStats: Awaited<ReturnType<typeof getCorpusStats>> | null = null;
  try {
    corpusStats = await getCorpusStats();
  } catch {
    // static-db may not be available in all environments
  }

  const role = (session?.user as unknown as { role: string })?.role || "—";

  // Recent audit events for security section
  const recentAudits = await db.adminAuditLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      action: true,
      entity: true,
      actorId: true,
      createdAt: true,
    },
  });

  const isSuperAdmin = role === "SUPERADMIN";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Archivist console configuration</p>
      </div>

      {/* Current session */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Current Session</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-600">Email</p>
            <p className="mt-0.5 text-sm text-zinc-300">{session?.user?.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-600">Name</p>
            <p className="mt-0.5 text-sm text-zinc-300">{session?.user?.name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-600">Role</p>
            <p className="mt-0.5 text-sm text-amber-400">{role}</p>
          </div>
        </div>
      </section>

      {/* Security section — E10 */}
      <SecuritySection audits={JSON.parse(JSON.stringify(recentAudits))} />

      {/* A1: 2FA/TOTP */}
      <TwoFactorSection />

      {/* A14: Webhook integrations (SUPERADMIN only) */}
      {isSuperAdmin && <WebhookSection />}

      {/* Database stats */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Database Summary</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatBlock label="Users" value={userCount} />
          <StatBlock label="Invite Codes" value={keyCount} />
          <StatBlock label="Consultations" value={consultationCount} />
          <StatBlock label="Content Entries" value={contentCount} />
          <StatBlock label="Audit Events" value={auditCount} />
        </div>
      </section>

      {/* Corpus health */}
      {corpusStats && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">RAG Corpus Health</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatBlock label="Total Chunks" value={corpusStats.total} />
            <StatBlock label="With Embeddings" value={corpusStats.withEmbeddings} />
            <StatBlock label="Source" value={corpusStats.source.split("(")[0].trim()} />
          </div>
          <div className="flex flex-wrap gap-3">
            {Object.entries(corpusStats.cautionBreakdown).map(([k, v]) => (
              <span key={k} className="rounded-full border border-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                {k}: {v as number}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Seed admin instructions */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Seed Admin Account</h2>
        <p className="text-xs text-zinc-500">First-time setup: run locally to create an admin user.</p>
        <code className="block rounded-lg bg-zinc-950 p-3 text-xs text-zinc-400">
          node scripts/seed-admin.cjs [email] [password]
        </code>
      </section>

      {/* Environment checklist */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-4">
        <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Environment Variables</h2>
        <div className="space-y-2">
          <EnvCheck name="NEXTAUTH_SECRET" isSet={!!process.env.NEXTAUTH_SECRET} />
          <EnvCheck name="NEXTAUTH_URL" isSet={!!process.env.NEXTAUTH_URL} />
          <EnvCheck name="DATABASE_URL" isSet={!!process.env.DATABASE_URL} />
          <EnvCheck name="TURSO_DATABASE_URL" isSet={!!process.env.TURSO_DATABASE_URL} />
          <EnvCheck name="TURSO_AUTH_TOKEN" isSet={!!process.env.TURSO_AUTH_TOKEN} />
          <EnvCheck name="CLOUDINARY_CLOUD_NAME" isSet={!!process.env.CLOUDINARY_CLOUD_NAME} />
          <EnvCheck name="ALLOWED_ADMIN_IPS" isSet={!!process.env.ALLOWED_ADMIN_IPS} />
          <EnvCheck name="SENTRY_DSN" isSet={!!process.env.SENTRY_DSN} />
        </div>
      </section>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-xs text-zinc-600">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-zinc-200">{value}</p>
    </div>
  );
}

function EnvCheck({ name, isSet }: { name: string; isSet: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-950 px-3 py-2">
      <code className="text-xs text-zinc-400">{name}</code>
      <span className={`text-xs font-medium ${isSet ? "text-emerald-400" : "text-red-400"}`}>
        {isSet ? "Set" : "Missing"}
      </span>
    </div>
  );
}
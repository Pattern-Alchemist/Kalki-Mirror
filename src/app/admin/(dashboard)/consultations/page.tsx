import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ConsultationsPage() {
  const consultations = await db.consultation.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Consultations</h1>
        <p className="mt-1 text-sm text-zinc-500">{consultations.length} total requests</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="px-4 py-3 font-medium text-zinc-500">Name</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Email</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Request</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Status</th>
              <th className="px-4 py-3 font-medium text-zinc-500">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {consultations.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-600">No consultation requests.</td></tr>
            )}
            {consultations.map((c) => (
              <tr key={c.id} className="transition hover:bg-zinc-900/30">
                <td className="px-4 py-3 font-medium text-zinc-200">{c.name}</td>
                <td className="px-4 py-3 text-zinc-400">{c.email}</td>
                <td className="max-w-xs truncate px-4 py-3 text-zinc-400">{c.request}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.status === "NEW" ? "bg-amber-500/10 text-amber-400" :
                    c.status === "SCHEDULED" ? "bg-blue-500/10 text-blue-400" :
                    c.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400" :
                    "bg-zinc-800 text-zinc-500"
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
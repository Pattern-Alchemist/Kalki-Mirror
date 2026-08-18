export default function AuditLoading() {
  return (
    <div className="space-y-8 p-1">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-4 w-64 rounded bg-zinc-800/60 animate-pulse" />
      </div>

      {/* Filter row */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-40 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="h-9 w-36 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="h-9 w-32 rounded-lg bg-zinc-800 animate-pulse" />
        </div>

        {/* Log entries - 8 rows with timestamp, action, actor columns */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
          {/* Column headers */}
          <div className="flex items-center gap-4 border-b border-zinc-800 px-5 py-3">
            <div className="h-3 w-28 rounded bg-zinc-700 animate-pulse" />
            <div className="h-3 w-40 rounded bg-zinc-700 animate-pulse" />
            <div className="h-3 w-28 rounded bg-zinc-700 animate-pulse" />
            <div className="ml-auto h-3 w-20 rounded bg-zinc-700 animate-pulse" />
          </div>

          {/* Log rows */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-zinc-800/50 px-5 py-3 last:border-b-0 animate-pulse"
            >
              <div className="h-3 w-28 rounded bg-zinc-800" />
              <div className="flex-1">
                <div className="h-3.5 w-48 rounded bg-zinc-700" />
                <div className="mt-1.5 h-2.5 w-64 rounded bg-zinc-800" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-zinc-700" />
                <div className="h-3 w-20 rounded bg-zinc-800" />
              </div>
              <div className="ml-auto h-5 w-16 rounded-full bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

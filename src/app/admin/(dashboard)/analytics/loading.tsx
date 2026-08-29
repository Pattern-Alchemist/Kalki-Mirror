export default function AnalyticsLoading() {
  return (
    <div className="space-y-8 p-1">
      {/* Header + controls skeleton */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-64 animate-pulse rounded-lg bg-zinc-800" />
          <div className="h-4 w-96 animate-pulse rounded bg-zinc-800/60" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 animate-pulse rounded-lg bg-zinc-800/70" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-800/70" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-zinc-800/70" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
            <div className="h-3 w-24 rounded bg-zinc-700" />
            <div className="mt-3 h-8 w-16 rounded bg-zinc-700" />
            <div className="mt-2 h-3 w-28 rounded bg-zinc-800" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="h-3 w-48 rounded bg-zinc-700" />
        <div className="mt-4 h-56 w-full rounded bg-zinc-800/50" />
      </div>

      {/* Table + side stack skeletons */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="h-3 w-40 rounded bg-zinc-700" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} className="h-5 w-full rounded bg-zinc-800/60" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, k) => (
            <div key={k} className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
              <div className="h-3 w-36 rounded bg-zinc-700" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-5 w-full rounded bg-zinc-800/60" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity feed skeleton */}
      <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/30 p-6">
        <div className="h-3 w-32 rounded bg-zinc-700" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 6 }).map((_, j) => (
            <div key={j} className="h-6 w-full rounded bg-zinc-800/50" />
          ))}
        </div>
      </div>
    </div>
  );
}

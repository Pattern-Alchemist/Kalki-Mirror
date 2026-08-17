export default function OverviewLoading() {
  return (
    <div className="space-y-8 p-1">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-56 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-4 w-80 rounded bg-zinc-800/60 animate-pulse" />
      </div>

      {/* Stat cards grid */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 animate-pulse"
            >
              <div className="h-3 w-24 rounded bg-zinc-700" />
              <div className="mt-3 h-8 w-16 rounded bg-zinc-700" />
              <div className="mt-2 h-3 w-32 rounded bg-zinc-800" />
            </div>
          ))}
        </div>

        {/* Quick action cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 animate-pulse"
            >
              <div className="h-5 w-5 rounded bg-zinc-700" />
              <div className="mt-3 h-4 w-28 rounded bg-zinc-700" />
              <div className="mt-2 h-3 w-36 rounded bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

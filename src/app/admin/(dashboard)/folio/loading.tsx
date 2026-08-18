export default function FolioLoading() {
  return (
    <div className="space-y-8 p-1">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-40 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-4 w-64 rounded bg-zinc-800/60 animate-pulse" />
      </div>

      {/* Search bar */}
      <div className="space-y-4">
        <div className="h-10 w-full max-w-md rounded-lg bg-zinc-800/60 animate-pulse" />

        {/* Chunk cards grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-40 rounded bg-zinc-700" />
                  <div className="h-3 w-56 rounded bg-zinc-800" />
                </div>
                <div className="h-5 w-12 rounded bg-zinc-700" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full rounded bg-zinc-800" />
                <div className="h-3 w-full rounded bg-zinc-800" />
                <div className="h-3 w-3/4 rounded bg-zinc-800" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-3 w-20 rounded bg-zinc-800" />
                <div className="h-3 w-16 rounded bg-zinc-800" />
                <div className="ml-auto h-3 w-24 rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

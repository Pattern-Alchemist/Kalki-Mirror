export default function ConsultationsLoading() {
  return (
    <div className="space-y-8 p-1">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-52 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-4 w-72 rounded bg-zinc-800/60 animate-pulse" />
      </div>

      {/* Filter tabs */}
      <div className="space-y-4">
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-9 w-24 rounded-lg bg-zinc-800 animate-pulse"
            />
          ))}
        </div>

        {/* Consultation cards */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-36 rounded bg-zinc-700" />
                  <div className="h-3 w-48 rounded bg-zinc-800" />
                </div>
                <div className="h-5 w-16 rounded-full bg-zinc-700" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="h-3 w-full max-w-lg rounded bg-zinc-800" />
                <div className="h-3 w-full max-w-md rounded bg-zinc-800" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-3 w-24 rounded bg-zinc-800" />
                <div className="h-3 w-20 rounded bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

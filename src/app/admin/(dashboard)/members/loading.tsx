export default function MembersLoading() {
  return (
    <div className="space-y-8 p-1">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-4 w-72 rounded bg-zinc-800/60 animate-pulse" />
      </div>

      {/* Search bar */}
      <div className="space-y-4">
        <div className="h-10 w-full max-w-md rounded-lg bg-zinc-800/60 animate-pulse" />

        {/* Table skeleton */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30">
          {/* Table header */}
          <div className="flex items-center gap-4 border-b border-zinc-800 px-5 py-3">
            <div className="h-3 w-28 rounded bg-zinc-700 animate-pulse" />
            <div className="h-3 w-36 rounded bg-zinc-700 animate-pulse" />
            <div className="h-3 w-24 rounded bg-zinc-700 animate-pulse" />
            <div className="h-3 w-20 rounded bg-zinc-700 animate-pulse" />
            <div className="ml-auto h-3 w-16 rounded bg-zinc-700 animate-pulse" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-zinc-800/50 px-5 py-3 last:border-b-0 animate-pulse"
            >
              <div className="h-8 w-8 rounded-full bg-zinc-700" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-28 rounded bg-zinc-700" />
                <div className="h-2.5 w-36 rounded bg-zinc-800" />
              </div>
              <div className="h-3 w-24 rounded bg-zinc-700" />
              <div className="h-5 w-16 rounded-full bg-zinc-700" />
              <div className="h-3 w-20 rounded bg-zinc-700" />
              <div className="ml-auto h-6 w-6 rounded bg-zinc-700" />
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-40 rounded bg-zinc-800/60 animate-pulse" />
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-8 w-8 rounded bg-zinc-800 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContentLoading() {
  return (
    <div className="space-y-8 p-1">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-4 w-72 rounded bg-zinc-800/60 animate-pulse" />
      </div>

      {/* Filter row */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-40 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="h-9 w-36 rounded-lg bg-zinc-800 animate-pulse" />
          <div className="ml-auto h-9 w-28 rounded-lg bg-zinc-800 animate-pulse" />
        </div>

        {/* Content rows */}
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-4 animate-pulse"
            >
              <div className="h-10 w-10 rounded-lg bg-zinc-700" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 w-48 rounded bg-zinc-700" />
                <div className="h-3 w-64 rounded bg-zinc-800" />
              </div>
              <div className="h-3 w-20 rounded bg-zinc-800" />
              <div className="h-5 w-16 rounded-full bg-zinc-700" />
              <div className="h-3 w-16 rounded bg-zinc-800" />
              <div className="ml-auto h-7 w-7 rounded bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

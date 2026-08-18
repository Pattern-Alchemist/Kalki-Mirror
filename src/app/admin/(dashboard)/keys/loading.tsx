export default function KeysLoading() {
  return (
    <div className="space-y-8 p-1">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-36 rounded-lg bg-zinc-800 animate-pulse" />
        <div className="h-4 w-64 rounded bg-zinc-800/60 animate-pulse" />
      </div>

      {/* Stats row - 3 cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 animate-pulse"
          >
            <div className="h-3 w-20 rounded bg-zinc-700" />
            <div className="mt-3 h-8 w-14 rounded bg-zinc-700" />
          </div>
        ))}
      </div>

      {/* Key rows */}
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/30 px-5 py-3 animate-pulse"
          >
            <div className="h-4 w-4 rounded bg-zinc-700" />
            <div className="h-3.5 w-52 rounded bg-zinc-700 font-mono" />
            <div className="h-3 w-20 rounded bg-zinc-800" />
            <div className="h-5 w-14 rounded-full bg-zinc-700" />
            <div className="h-3 w-24 rounded bg-zinc-800" />
            <div className="ml-auto h-6 w-6 rounded bg-zinc-700" />
          </div>
        ))}
      </div>
    </div>
  );
}

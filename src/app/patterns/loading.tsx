export default function PatternsLoading() {
  return (
    <div className="min-h-screen bg-deep-black pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-32 bg-zinc-800 rounded" />
          <div className="h-12 w-80 bg-zinc-800 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-panel p-6 space-y-3">
                <div className="h-3 w-20 bg-zinc-800 rounded" />
                <div className="h-6 w-56 bg-zinc-800 rounded" />
                <div className="h-3 w-full bg-zinc-800 rounded" />
                <div className="h-3 w-2/3 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

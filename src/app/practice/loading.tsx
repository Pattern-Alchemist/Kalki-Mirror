export default function PracticeLoading() {
  return (
    <div className="min-h-screen bg-deep-black pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-28 bg-zinc-800 rounded" />
          <div className="h-12 w-72 bg-zinc-800 rounded" />
          <div className="h-4 w-96 bg-zinc-800 rounded mt-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-panel p-6 space-y-3">
                <div className="h-3 w-16 bg-zinc-800 rounded" />
                <div className="h-6 w-48 bg-zinc-800 rounded" />
                <div className="h-3 w-full bg-zinc-800 rounded" />
                <div className="h-3 w-3/4 bg-zinc-800 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConsultationsLoading() {
  return (
    <div className="min-h-screen bg-deep-black pt-32 pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-28 bg-zinc-800 rounded" />
          <div className="h-12 w-96 bg-zinc-800 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mt-16">
            <div className="md:col-span-2">
              <div className="w-full aspect-[3/4] bg-zinc-800 rounded" />
            </div>
            <div className="md:col-span-3 space-y-4">
              <div className="h-3 w-20 bg-zinc-800 rounded" />
              <div className="h-8 w-64 bg-zinc-800 rounded" />
              <div className="h-3 w-full bg-zinc-800 rounded" />
              <div className="h-3 w-full bg-zinc-800 rounded" />
              <div className="h-3 w-2/3 bg-zinc-800 rounded" />
            </div>
          </div>
          <div className="space-y-4 mt-16">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel p-8 h-24" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArchetypesLoading() {
  return (
    <div className="min-h-screen bg-deep-black pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="animate-pulse space-y-8">
          <div className="h-4 w-32 bg-zinc-800 rounded" />
          <div className="h-16 w-[500px] bg-zinc-800 rounded" />
          <div className="h-5 w-96 bg-zinc-800 rounded mt-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-chip p-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-20 bg-zinc-800 rounded" />
                  <div className="space-y-2 flex-1">
                    <div className="h-6 w-40 bg-zinc-800 rounded" />
                    <div className="h-3 w-24 bg-zinc-800 rounded" />
                  </div>
                </div>
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

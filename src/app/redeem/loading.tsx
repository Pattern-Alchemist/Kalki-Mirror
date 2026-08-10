export default function RedeemLoading() {
  return (
    <div className="min-h-screen bg-deep-black pt-32 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
        <div className="max-w-xl mx-auto animate-pulse space-y-8">
          {/* Section label */}
          <div className="h-4 w-28 bg-zinc-800 rounded" />

          {/* Title */}
          <div className="h-12 w-72 bg-zinc-800 rounded" />

          {/* Subtitle */}
          <div className="h-4 w-96 bg-zinc-800 rounded" />

          {/* Tier info card */}
          <div className="glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-zinc-800 rounded" />
                <div className="h-7 w-32 bg-zinc-800 rounded" />
              </div>
              <div className="text-right space-y-2">
                <div className="h-3 w-28 bg-zinc-800 rounded" />
                <div className="h-7 w-8 bg-zinc-800 rounded" />
              </div>
            </div>
          </div>

          {/* Redemption card */}
          <div className="glass-panel p-6 md:p-8 space-y-6">
            <div className="h-3 w-20 bg-zinc-800 rounded" />
            <div className="h-12 w-full bg-zinc-800/50 rounded-sm" />
            <div className="h-12 w-full bg-zinc-800 rounded-sm" />
          </div>

          {/* Bottom link */}
          <div className="flex flex-col items-center gap-2 pt-4">
            <div className="h-4 w-32 bg-zinc-800 rounded" />
            <div className="h-4 w-40 bg-zinc-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Admin loading state — matches the dark admin theme.
 * Without this, the root loading.tsx (SiddhiCardSkeleton) would
 * show the public-facing card grid skeleton during BAILOUT or navigation.
 */
export default function AdminLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="w-full max-w-sm space-y-8 animate-pulse">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full border border-amber-500/30 bg-amber-500/10" />
          <div className="mx-auto h-6 w-40 rounded bg-zinc-800" />
          <div className="mx-auto mt-2 h-4 w-48 rounded bg-zinc-800/60" />
        </div>
        <div className="space-y-4">
          <div className="h-10 rounded-lg bg-zinc-800" />
          <div className="h-10 rounded-lg bg-zinc-800" />
          <div className="h-10 rounded-lg bg-amber-600/30" />
        </div>
      </div>
    </div>
  );
}

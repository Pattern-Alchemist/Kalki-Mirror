import { Skeleton } from '@/components/ui/Skeleton';

export default function DossierLoading() {
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-16">
        <Skeleton className="h-3 w-20 mb-8" />
        <Skeleton className="h-10 w-80 mb-4" />
        <Skeleton className="h-4 w-full max-w-2xl mb-2" />
        <Skeleton className="h-4 w-3/4 max-w-2xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 space-y-8">
        {/* Transit inputs */}
        <div className="glass-panel p-6 space-y-4">
          <Skeleton className="h-5 w-40" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full rounded-sm" />
            <Skeleton className="h-12 w-full rounded-sm" />
          </div>
          <Skeleton className="h-12 w-48 rounded-sm" />
        </div>

        {/* Result area */}
        <div className="space-y-4">
          <Skeleton className="h-px w-full" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

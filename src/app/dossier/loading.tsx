import { Skeleton } from '@/components/ui/Skeleton';

export default function DossierLoading() {
  return (
    <div className="min-h-screen bg-deep-black">
      {/* Hero skeleton */}
      <div className="relative min-h-[90vh] md:min-h-[100vh] bg-deep-black">
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/30 to-deep-black/40" />
        <div className="absolute inset-0 flex items-end pb-20 md:pb-28 z-10">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10 w-full">
            <Skeleton className="h-3 w-52 mb-4" />
            <Skeleton className="h-16 w-96 mb-6" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </div>
        </div>
      </div>

      {/* Lookup skeleton */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-3 w-40 mb-6" />
          <div className="glass-panel p-6 md:p-8 space-y-4">
            <Skeleton className="h-3 w-36" />
            <Skeleton className="h-12 w-full rounded-sm" />
            <Skeleton className="h-10 w-40 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

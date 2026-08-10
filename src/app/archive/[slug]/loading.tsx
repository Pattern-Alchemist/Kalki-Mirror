import { Skeleton } from '@/components/ui/Skeleton';

export default function SiddhiFolioLoading() {
  return (
    <div className="min-h-screen bg-deep-black">
      {/* Header skeleton */}
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-8">
        <Skeleton className="h-3 w-20 mb-8" />
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <Skeleton className="h-10 w-72 mb-3" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full shrink-0 mt-2" />
        </div>
        <Skeleton className="h-3 w-full max-w-2xl mt-6" />
        <Skeleton className="h-3 w-5/6 max-w-2xl mt-2" />
      </div>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="h-px bg-gold/10" />
      </div>

      {/* Body skeleton */}
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-12 space-y-10">
        {/* Authenticity + metadata row */}
        <div className="flex flex-wrap gap-6">
          <Skeleton className="h-20 w-48 rounded-sm" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Content blocks */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="h-px bg-gold/5" />

        <div className="space-y-4">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-9/10" />
        </div>

        <div className="h-px bg-gold/5" />

        <div className="space-y-4">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-7/8" />
        </div>
      </div>
    </div>
  );
}

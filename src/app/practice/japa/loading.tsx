import { Skeleton } from '@/components/ui/Skeleton';

export default function JapaLoading() {
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-8">
        <Skeleton className="h-3 w-28 mb-8" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
        {/* Counter circle */}
        <div className="flex justify-center mb-12">
          <Skeleton className="h-[240px] w-[240px] rounded-full" />
        </div>
        {/* Controls */}
        <div className="flex justify-center gap-4 mb-12">
          <Skeleton className="h-12 w-28 rounded-sm" />
          <Skeleton className="h-12 w-28 rounded-sm" />
          <Skeleton className="h-12 w-28 rounded-sm" />
        </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full rounded-sm" />
          <Skeleton className="h-20 w-full rounded-sm" />
          <Skeleton className="h-20 w-full rounded-sm" />
        </div>
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/Skeleton';

export default function TimerLoading() {
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-8">
        <Skeleton className="h-3 w-28 mb-8" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-4 w-full max-w-lg" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10">
        {/* Timer display */}
        <div className="flex justify-center mb-12">
          <Skeleton className="h-[140px] w-[320px] rounded-sm" />
        </div>
        {/* Controls */}
        <div className="flex justify-center gap-4 mb-12">
          <Skeleton className="h-12 w-28 rounded-sm" />
          <Skeleton className="h-12 w-28 rounded-sm" />
        </div>
        {/* Duration presets */}
        <div className="flex justify-center gap-3 mb-12">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-16 rounded-sm" />
          ))}
        </div>
      </div>
    </div>
  );
}

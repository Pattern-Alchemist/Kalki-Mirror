import { SiddhiCardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-20 md:py-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <SiddhiCardSkeleton />
          <SiddhiCardSkeleton />
          <SiddhiCardSkeleton />
        </div>
      </div>
    </div>
  );
}

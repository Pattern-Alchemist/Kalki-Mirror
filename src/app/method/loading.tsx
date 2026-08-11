import { Skeleton } from '@/components/ui/Skeleton';

export default function MethodLoading() {
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-16">
        <Skeleton className="h-3 w-28 mb-8" />
        <Skeleton className="h-10 w-72 mb-4" />
        <Skeleton className="h-4 w-full max-w-2xl mb-2" />
        <Skeleton className="h-4 w-5/6 max-w-2xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 space-y-10">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-3/4" />
            {i < 3 && <div className="h-px bg-gold/5 mt-8" />}
          </div>
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/Skeleton';

export default function ResearchLoading() {
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-16">
        <Skeleton className="h-3 w-32 mb-8" />
        <Skeleton className="h-10 w-80 mb-4" />
        <Skeleton className="h-4 w-full max-w-2xl mb-2" />
        <Skeleton className="h-4 w-3/4 max-w-2xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel p-5 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}

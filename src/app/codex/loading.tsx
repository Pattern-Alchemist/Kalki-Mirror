import { Skeleton } from '@/components/ui/Skeleton';

export default function CodexLoading() {
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-16">
        <Skeleton className="h-3 w-24 mb-8" />
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-4 w-full max-w-2xl mb-2" />
        <Skeleton className="h-4 w-5/6 max-w-2xl" />
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-10 space-y-8">
        <div className="glass-panel p-6 space-y-3">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="glass-panel p-6 space-y-3">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-9/10" />
        </div>
      </div>
    </div>
  );
}

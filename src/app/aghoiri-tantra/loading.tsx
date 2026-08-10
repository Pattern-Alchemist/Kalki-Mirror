import { Skeleton } from '@/components/ui/Skeleton';

export default function AghoriTantraLoading() {
  return (
    <div className="min-h-screen bg-deep-black">
      <div className="h-[80vh] bg-foreground/5" />
      <div className="max-w-3xl mx-auto px-6 lg:px-10 space-y-6 py-16">
        <Skeleton className="h-8 w-48 gold-shimmer" />
        <Skeleton className="h-6 w-72" />
        <Skeleton className="h-64 w-full gold-shimmer" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

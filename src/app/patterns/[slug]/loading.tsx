import { Skeleton } from '@/components/ui/Skeleton';

export default function PatternFolioLoading() {
  return (
    <div className="min-h-screen bg-deep-black">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 lg:px-10 pt-32 pb-8">
        <Skeleton className="h-3 w-24 mb-8" />
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <Skeleton className="h-10 w-72 mb-3" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full shrink-0 mt-2" />
        </div>
        <Skeleton className="h-4 w-full max-w-2xl mt-6" />
        <Skeleton className="h-4 w-5/6 max-w-2xl mt-2" />
      </div>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6 lg:px-10">
        <div className="h-px bg-gold/10" />
      </div>

      {/* Body */}
      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-12 space-y-10">
        <div className="space-y-4">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        <div className="h-px bg-gold/5" />

        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-9/10" />
        </div>
      </div>
    </div>
  );
}

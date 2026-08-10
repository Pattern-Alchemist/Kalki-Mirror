'use client';

import { cn } from '@/lib/utils';

/**
 * Kalki-themed shimmer skeleton.
 * Uses the brand's gold-tinted shimmer on dark surface backgrounds.
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface rounded-sm',
        className
      )}
      {...props}
    >
      {/* Shimmer sweep */}
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.06), transparent)',
          animation: 'skeleton-shimmer 1.8s ease-in-out infinite',
        }}
      />
    </div>
  );
}

/**
 * SiddhiCard skeleton — mirrors the card layout for smooth placeholder.
 */
export function SiddhiCardSkeleton() {
  return (
    <div className="glass-chip flex flex-col">
      <div className="p-6 md:p-8 flex flex-col gap-4 flex-1">
        {/* Title + lock */}
        <div className="flex items-start gap-2.5">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-7 w-7 rounded-full shrink-0" />
        </div>
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-16 w-full mt-1" />
        {/* Bottom metadata row */}
        <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gold/5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3.5 w-20" />
          <div className="flex-1" />
          <Skeleton className="h-2 w-16 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-3.5 w-24" />
          <div className="flex-1" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * PatternCard skeleton — mirrors the pattern card layout.
 */
export function PatternCardSkeleton() {
  return (
    <div className="glass-chip flex flex-col">
      <div className="p-6 md:p-8">
        <Skeleton className="h-7 w-36 mb-2" />
        <Skeleton className="h-4 w-56 mb-6" />
        <div className="h-px bg-gold/5 mb-5" />
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
        </div>
        <div className="mt-5 pt-3 border-t border-gold/5">
          <Skeleton className="h-3.5 w-48" />
        </div>
      </div>
    </div>
  );
}

/**
 * AI text block skeleton — for AI explainer/reading content.
 */
export function AIBlockSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="glass-panel p-6 space-y-4">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-6 w-48" />
      <div className="h-px bg-gold/5" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${85 - i * 8}%` }}
          />
        ))}
      </div>
    </div>
  );
}

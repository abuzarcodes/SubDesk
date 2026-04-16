'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Range Selector Skeleton */}
      <div className="flex gap-2">
        {['7D', '30D', '90D'].map((label) => (
          <Skeleton key={label} className="h-9 w-16 rounded-lg" />
        ))}
      </div>

      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-3"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-20" />
          </div>
        ))}
      </div>

      {/* Revenue Chart Skeleton (full width) */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>

      {/* Two Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4"
          >
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-[240px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Plan Performance Skeleton (full width) */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>
    </div>
  );
}

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-1 inline-block">
        <Skeleton className="h-8 w-48 mb-1" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="space-y-6">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 md:p-6 flex justify-between gap-4 h-[104px]">
              <div className="flex flex-col gap-2 w-1/2 justify-center">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-7 w-3/4" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column (Previews) */}
          <div className="rounded-xl border bg-card p-4 md:p-6 h-80 flex flex-col gap-4">
            <Skeleton className="h-6 w-1/3 mb-2" />
            <div className="flex flex-col divide-y divide-border h-full">
               {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-4 h-16">
                  <div className="flex flex-col gap-2 w-1/2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                  <div className="flex flex-col gap-2 items-end w-1/4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (Upcoming) */}
          <div className="rounded-xl border bg-card p-4 md:p-6 h-80 flex flex-col gap-4">
            <div className="flex justify-between mb-2">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-5 w-16" />
            </div>
            <div className="flex flex-col divide-y divide-border h-full">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between items-center py-4 h-16">
                  <div className="flex flex-col gap-2 w-1/2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                  <Skeleton className="h-4 w-1/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className="md:col-span-2 rounded-xl border bg-card p-4 md:p-6 h-64 flex flex-col gap-4">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <div className="flex flex-col gap-6 relative">
              <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border"></div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 relative z-10 w-full">
                  <Skeleton className="h-7 w-7 rounded-full shrink-0" />
                  <div className="flex flex-col gap-2 w-1/3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

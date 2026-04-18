import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="rounded-xl border bg-card shadow-sm p-4 md:p-6 lg:col-span-2">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
      
      <div className="rounded-xl border bg-card shadow-sm p-4 md:p-6">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>

      <div className="rounded-xl border bg-card shadow-sm p-4 md:p-6">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </div>
  );
}

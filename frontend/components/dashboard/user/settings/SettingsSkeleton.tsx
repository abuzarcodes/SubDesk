import { Skeleton } from "@/components/ui/skeleton"

export function SettingsSkeleton() {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 md:p-6 mb-8 max-w-xl mx-auto">
      <Skeleton className="h-6 w-1/3 mb-6" />
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-32 mt-4" />
      </div>
    </div>
  );
}

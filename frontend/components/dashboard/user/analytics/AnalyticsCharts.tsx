"use client";

import { useUserAnalytics } from "@/hooks/use-user-analytics";
import { RangeSelector } from "@/components/dashboard/user/analytics/RangeSelector";
import { SpendTrendChart } from "@/components/dashboard/user/analytics/SpendTrendChart";
import { GrowthChart } from "@/components/dashboard/user/analytics/GrowthChart";
import { CancellationChart } from "@/components/dashboard/user/analytics/CancellationChart";
import { AnalyticsSkeleton } from "@/components/dashboard/user/analytics/AnalyticsSkeleton";
import { EmptyState } from "@/components/dashboard/user/analytics/EmptyState";
import { Button } from "@/components/ui/button";

export function AnalyticsCharts() {
  const { data, loading, error, range, setRange } = useUserAnalytics();

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start md:items-end flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Insights into your subscription activity
            </p>
          </div>
          <RangeSelector range={range} onRangeChange={setRange} />
        </div>
        <AnalyticsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-start md:items-end flex-col md:flex-row gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">
              Insights into your subscription activity
            </p>
          </div>
          <RangeSelector range={range} onRangeChange={setRange} />
        </div>
        <div className="mt-6 flex flex-col gap-6 items-center border rounded-xl p-12 bg-destructive/10 text-destructive">
          <p className="font-semibold">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const hasData = data && (
    (data.spendTrend?.length ?? 0) > 0 ||
    (data.subscriptionGrowth?.length ?? 0) > 0 ||
    (data.cancellations?.length ?? 0) > 0
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-start md:items-end flex-col md:flex-row gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Insights into your subscription activity
          </p>
        </div>
        <RangeSelector range={range} onRangeChange={setRange} />
      </div>

      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          <SpendTrendChart data={data.spendTrend || []} />
          <GrowthChart data={data.subscriptionGrowth || []} />
          <CancellationChart data={data.cancellations || []} />
        </div>
      )}
    </div>
  );
}

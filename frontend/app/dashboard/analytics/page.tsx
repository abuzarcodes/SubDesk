'use client';

import { useAnalytics } from '@/hooks/use-analytics';
import { AnalyticsSkeleton } from '@/components/analytics/AnalyticsSkeleton';
import { RangeSelector } from '@/components/analytics/RangeSelector';
import { AnalyticsSummary } from '@/components/analytics/AnalyticsSummary';
import { RevenueChart } from '@/components/analytics/RevenueChart';
import { CustomerGrowthChart } from '@/components/analytics/CustomerGrowthChart';
import { ChurnChart } from '@/components/analytics/ChurnChart';
import { PlanPerformanceChart } from '@/components/analytics/PlanPerformanceChart';
import { AlertCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const {
    range,
    setRange,
    summary,
    revenueData,
    customerGrowth,
    churnData,
    planPerformance,
    loading,
    error,
  } = useAnalytics();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your business performance
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <AnalyticsSkeleton />
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Range Selector */}
          <RangeSelector range={range} onRangeChange={setRange} />

          {/* KPI Summary Cards */}
          {summary && <AnalyticsSummary data={summary} />}

          {/* Revenue Chart — Full Width */}
          {revenueData && <RevenueChart data={revenueData} />}

          {/* Customer Growth + Churn — 2 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {customerGrowth && <CustomerGrowthChart data={customerGrowth} />}
            {churnData && <ChurnChart data={churnData} />}
          </div>

          {/* Plan Performance — Full Width */}
          {planPerformance && <PlanPerformanceChart data={planPerformance} />}
        </div>
      )}
    </div>
  );
}

'use client';

import { Users, CreditCard, IndianRupee, TrendingDown } from 'lucide-react';
import type { AnalyticsSummaryData } from '@/hooks/use-analytics';

interface AnalyticsSummaryProps {
  data: AnalyticsSummaryData;
}

const KPI_CONFIG = [
  {
    key: 'totalCustomers' as const,
    label: 'Total Customers',
    icon: Users,
    format: (v: number) => v.toLocaleString(),
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    key: 'activeSubscriptions' as const,
    label: 'Active Subscriptions',
    icon: CreditCard,
    format: (v: number) => v.toLocaleString(),
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
  },
  {
    key: 'mrr' as const,
    label: 'Monthly Recurring Revenue',
    icon: IndianRupee,
    format: (v: number) =>
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      }).format(v),
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
  },
  {
    key: 'churnRate' as const,
    label: 'Churn Rate',
    icon: TrendingDown,
    format: (v: number) => `${(v * 100).toFixed(2)}%`,
    iconColor: 'text-destructive',
    iconBg: 'bg-destructive/10',
  },
];

export function AnalyticsSummary({ data }: AnalyticsSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_CONFIG.map((kpi) => {
        const Icon = kpi.icon;
        const value = data[kpi.key];

        return (
          <div
            key={kpi.key}
            className="rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.iconBg}`}
              >
                <Icon className={`h-4 w-4 ${kpi.iconColor}`} />
              </div>
            </div>
            <p className="text-2xl font-semibold text-foreground">
              {kpi.format(value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

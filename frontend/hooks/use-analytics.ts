'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export type AnalyticsRange = '7d' | '30d' | '90d';

export interface AnalyticsSummaryData {
  totalCustomers: number;
  activeSubscriptions: number;
  mrr: number;
  churnRate: number;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

export interface PlanPerformanceItem {
  planId: number;
  name: string;
  subscribers: number;
  revenue: number;
  churnRate: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string | string[];
    fill?: boolean;
    tension?: number;
    borderWidth?: number;
    borderRadius?: number;
    yAxisID?: string;
  }[];
}

interface UseAnalyticsReturn {
  range: AnalyticsRange;
  setRange: (range: AnalyticsRange) => void;
  summary: AnalyticsSummaryData | null;
  revenueData: ChartData | null;
  customerGrowth: ChartData | null;
  churnData: ChartData | null;
  planPerformance: ChartData | null;
  loading: boolean;
  error: string | null;
}

// ── Constants ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3030/api';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API Error: ${res.status}`);
  }
  return res.json();
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildTimeSeriesChart(
  data: TimeSeriesPoint[],
  label: string,
  color: string,
  type: 'line' | 'bar' = 'line'
): ChartData {
  const labels = data.map((d) => formatDateLabel(d.date));
  const values = data.map((d) => d.value);

  if (type === 'bar') {
    return {
      labels,
      datasets: [
        {
          label,
          data: values,
          backgroundColor: color,
          borderColor: 'transparent',
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    };
  }

  return {
    labels,
    datasets: [
      {
        label,
        data: values,
        borderColor: color,
        backgroundColor: color + '1A', // 10% opacity
        fill: true,
        tension: 0.35,
        borderWidth: 2,
      },
    ],
  };
}

function buildPlanPerformanceChart(data: PlanPerformanceItem[]): ChartData {
  return {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'Subscribers',
        data: data.map((d) => d.subscribers),
        backgroundColor: 'rgb(0, 173, 181)',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 6,
        yAxisID: 'ySubscribers',
      },
      {
        label: 'Revenue ($)',
        data: data.map((d) => d.revenue),
        backgroundColor: 'rgba(0, 173, 181, 0.4)',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 6,
        yAxisID: 'yRevenue',
      },
    ],
  };
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAnalytics(): UseAnalyticsReturn {
  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [summary, setSummary] = useState<AnalyticsSummaryData | null>(null);
  const [revenueData, setRevenueData] = useState<ChartData | null>(null);
  const [customerGrowth, setCustomerGrowth] = useState<ChartData | null>(null);
  const [churnData, setChurnData] = useState<ChartData | null>(null);
  const [planPerformance, setPlanPerformance] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [summaryRes, revenueRes, customersRes, plansRes, churnRes] =
        await Promise.all([
          fetchJSON<{ success: boolean; data: AnalyticsSummaryData }>(
            `${API_BASE}/analytics/summary`
          ),
          fetchJSON<{ success: boolean; data: TimeSeriesPoint[] }>(
            `${API_BASE}/analytics/revenue?range=${range}`
          ),
          fetchJSON<{ success: boolean; data: TimeSeriesPoint[] }>(
            `${API_BASE}/analytics/customers?range=${range}`
          ),
          fetchJSON<{ success: boolean; data: PlanPerformanceItem[] }>(
            `${API_BASE}/analytics/plans`
          ),
          fetchJSON<{ success: boolean; data: TimeSeriesPoint[] }>(
            `${API_BASE}/analytics/churn?range=${range}`
          ),
        ]);

      // Set summary
      setSummary(summaryRes.data);

      // Transform time-series into chart data
      setRevenueData(
        buildTimeSeriesChart(revenueRes.data, 'Revenue', 'rgb(0, 173, 181)', 'line')
      );
      setCustomerGrowth(
        buildTimeSeriesChart(customersRes.data, 'New Customers', 'rgb(0, 173, 181)', 'line')
      );
      setChurnData(
        buildTimeSeriesChart(churnRes.data, 'Cancellations', 'rgb(220, 53, 69)', 'bar')
      );

      // Transform plan performance
      setPlanPerformance(buildPlanPerformanceChart(plansRes.data));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    range,
    setRange,
    summary,
    revenueData,
    customerGrowth,
    churnData,
    planPerformance,
    loading,
    error,
  };
}

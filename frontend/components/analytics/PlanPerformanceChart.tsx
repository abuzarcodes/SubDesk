'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ChartData } from '@/hooks/use-analytics';
import { Layers } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface PlanPerformanceChartProps {
  data: ChartData;
}

export function PlanPerformanceChart({ data }: PlanPerformanceChartProps) {
  const hasData = data.labels.length > 0;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Plan Performance
      </h3>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Layers className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      ) : (
        <div className="h-[280px]">
          <Bar
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                intersect: false,
                mode: 'index',
              },
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  align: 'end',
                  labels: {
                    color: 'rgba(128, 128, 128, 0.8)',
                    font: { size: 12 },
                    usePointStyle: true,
                    pointStyle: 'rectRounded',
                    padding: 16,
                  },
                },
                tooltip: {
                  backgroundColor: 'rgba(34, 40, 49, 0.9)',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  borderColor: 'rgba(0, 173, 181, 0.3)',
                  borderWidth: 1,
                  cornerRadius: 8,
                  padding: 10,
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: {
                    color: 'rgba(128, 128, 128, 0.7)',
                    font: { size: 12 },
                  },
                  border: { display: false },
                },
                ySubscribers: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(128, 128, 128, 0.1)',
                  },
                  ticks: {
                    color: 'rgba(128, 128, 128, 0.7)',
                    font: { size: 11 },
                    precision: 0,
                  },
                  title: {
                    display: true,
                    text: 'Subscribers',
                    color: 'rgba(128, 128, 128, 0.7)',
                    font: { size: 10 },
                  },
                  border: { display: false },
                },
                yRevenue: {
                  type: 'linear',
                  display: true,
                  position: 'right',
                  beginAtZero: true,
                  grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis
                  },
                  ticks: {
                    color: 'rgba(128, 128, 128, 0.7)',
                    font: { size: 11 },
                    callback: (value) => `₹${value}`,
                  },
                  title: {
                    display: true,
                    text: 'Revenue',
                    color: 'rgba(128, 128, 128, 0.7)',
                    font: { size: 10 },
                  },
                  border: { display: false },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
}

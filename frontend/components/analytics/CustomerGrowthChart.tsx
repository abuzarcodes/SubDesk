'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { ChartData } from '@/hooks/use-analytics';
import { Users } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface CustomerGrowthChartProps {
  data: ChartData;
}

export function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  const hasData = data.datasets.some((ds) => ds.data.some((v) => v > 0));

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200">
      <h3 className="text-base font-semibold text-foreground mb-4">
        Customer Growth
      </h3>
      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Users className="h-8 w-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      ) : (
        <div className="h-[240px]">
          <Line
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: {
                intersect: false,
                mode: 'index',
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(34, 40, 49, 0.9)',
                  titleColor: '#fff',
                  bodyColor: '#fff',
                  borderColor: 'rgba(0, 173, 181, 0.3)',
                  borderWidth: 1,
                  cornerRadius: 8,
                  padding: 10,
                  callbacks: {
                    label: (ctx) =>
                      `New Customers: ${ctx.parsed.y}`,
                  },
                },
              },
              scales: {
                x: {
                  grid: { display: false },
                  ticks: {
                    color: 'rgba(128, 128, 128, 0.7)',
                    font: { size: 11 },
                    maxTicksLimit: 8,
                  },
                  border: { display: false },
                },
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(128, 128, 128, 0.1)',
                  },
                  ticks: {
                    color: 'rgba(128, 128, 128, 0.7)',
                    font: { size: 11 },
                    stepSize: 1,
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

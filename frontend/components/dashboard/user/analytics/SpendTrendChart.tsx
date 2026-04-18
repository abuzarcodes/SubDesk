"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface SpendTrendChartProps {
  data: { date: string; value: number }[];
}

export function SpendTrendChart({ data }: SpendTrendChartProps) {
  const labels = data.map((d) => new Date(d.date).toLocaleDateString("en-IN"));
  const values = data.map((d) => d.value);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Spend",
        data: values,
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.1)",
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 2,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `₹${context.raw.toLocaleString("en-IN")}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(var(--muted))",
        },
        ticks: {
          callback: (value: any) => `₹${value.toLocaleString("en-IN")}`,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 md:p-6 lg:col-span-2">
      <h3 className="text-lg font-medium mb-4">Daily Spend (₹)</h3>
      <div className="h-[300px]">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
}

"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface GrowthChartProps {
  data: { date: string; value: number }[];
}

export function GrowthChart({ data }: GrowthChartProps) {
  const labels = data.map((d) => new Date(d.date).toLocaleDateString("en-IN"));
  const values = data.map((d) => d.value);

  const chartData = {
    labels,
    datasets: [
      {
        label: "New Subscriptions",
        data: values,
        backgroundColor: "hsl(var(--primary))",
        borderRadius: 4,
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
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "hsl(var(--muted))",
        },
        ticks: {
          stepSize: 1,
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
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 md:p-6">
      <h3 className="text-lg font-medium mb-4">Subscription Growth</h3>
      <div className="h-[300px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

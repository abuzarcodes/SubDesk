import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 md:p-6 flex justify-between items-start gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <span className="text-xl font-semibold">{value}</span>
      </div>
      {icon && (
        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
    </div>
  );
}

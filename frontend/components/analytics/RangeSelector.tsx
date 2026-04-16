'use client';

import type { AnalyticsRange } from '@/hooks/use-analytics';

interface RangeSelectorProps {
  range: AnalyticsRange;
  onRangeChange: (range: AnalyticsRange) => void;
}

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
];

export function RangeSelector({ range, onRangeChange }: RangeSelectorProps) {
  return (
    <div className="flex gap-1.5 p-1 rounded-lg bg-muted/50 w-fit" role="group" aria-label="Date range selector">
      {RANGES.map((item) => {
        const isActive = range === item.value;
        return (
          <button
            key={item.value}
            onClick={() => onRangeChange(item.value)}
            className={`
              px-4 py-1.5 text-sm font-medium rounded-md
              transition-all duration-200 cursor-pointer
              ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }
            `}
            aria-pressed={isActive}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

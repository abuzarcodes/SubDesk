'use client';

import { ReactNode } from 'react';

interface PlanGridProps {
  columns: 1 | 2 | 3 | 4;
  children: ReactNode;
}

export function PlanGrid({ columns, children }: PlanGridProps) {
  // Mobile always 1 col
  // Tablet usually 2 col (unless grid is 1 col)
  // Desktop respects the column count
  
  let gridColsClass = "grid-cols-1";
  
  if (columns === 1) {
    gridColsClass = "grid-cols-1 max-w-xl mx-auto";
  } else if (columns === 2) {
    gridColsClass = "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto";
  } else if (columns === 3) {
    gridColsClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto";
  } else if (columns === 4) {
    gridColsClass = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto";
  }

  return (
    <div className={`grid gap-8 ${gridColsClass}`}>
      {children}
    </div>
  );
}

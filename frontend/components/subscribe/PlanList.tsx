'use client';

import { ReactNode } from 'react';

export function PlanList({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
      {children}
    </div>
  );
}

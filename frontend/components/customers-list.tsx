'use client';

import type { Subscription } from '@/lib/api';

interface CustomersListProps {
  subscriptions: Subscription[];
}

export function CustomersList({ subscriptions }: CustomersListProps) {
  if (subscriptions.length === 0) {
    return (
      <div className="rounded-lg border border-border border-dashed bg-card/50 p-8 text-center">
        <p className="text-muted-foreground">No customers yet. Share your subscription link to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Customer</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Email</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Plan</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Price</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {subscriptions.map((sub) => (
            <tr
              key={sub.id}
              className="transition-colors hover:bg-muted/50"
            >
              <td className="px-4 py-3 text-sm text-foreground">{sub.customer_name}</td>
              <td className="px-4 py-3 text-sm text-muted-foreground">{sub.customer_email}</td>
              <td className="px-4 py-3 text-sm text-foreground font-medium">{sub.plan_name}</td>
              <td className="px-4 py-3 text-sm text-foreground">${Number(sub.plan_price).toFixed(2)}</td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-100">
                  {sub.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

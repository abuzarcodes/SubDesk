import React from 'react';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-xl border border-dashed bg-card/50">
      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <Receipt className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
      <p className="text-muted-foreground mb-8 max-w-sm">
        You haven't made any payments or subscribed to any plans yet. Your transactions will appear here.
      </p>
      <Button asChild>
        <Link href="/dashboard/subscriptions">Explore Plans</Link>
      </Button>
    </div>
  );
}

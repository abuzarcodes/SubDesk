import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center bg-card border border-dashed border-border rounded-xl shadow-sm p-12 text-center h-[50vh]">
      <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
        <CreditCard className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-medium text-foreground mb-2">No Subscriptions Yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        You don't have any active subscriptions. Browse available plans or check your invitations.
      </p>
      <Button asChild>
        <Link href="/dashboard/subscriptions">
          Browse Plans
        </Link>
      </Button>
    </div>
  );
}

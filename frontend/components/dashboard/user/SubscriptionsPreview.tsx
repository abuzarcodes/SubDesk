import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard } from 'lucide-react';

interface SubscriptionsPreviewProps {
  subscriptions: Array<{
    id: number;
    plan_name: string;
    business_name: string;
    price: number;
    status: string;
    expires_at: string | null;
  }>;
}

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'default';
    case 'paused':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function SubscriptionsPreview({ subscriptions }: SubscriptionsPreviewProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm flex flex-col h-full overflow-hidden">
      <div className="p-4 md:p-6 pb-4 border-b border-border">
        <h3 className="text-lg font-medium text-foreground">Your Subscriptions</h3>
      </div>
      <div className="flex-1 p-0">
        {subscriptions.length === 0 ? (
          <div className="text-muted-foreground text-sm italic p-6 text-center">No subscriptions found.</div>
        ) : (
          <div className="divide-y divide-border flex flex-col">
            {subscriptions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="flex justify-between items-center py-3 px-4 md:px-6 hover:bg-muted/50 transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-sm text-foreground">{sub.plan_name}</span>
                  <span className="text-xs text-muted-foreground">{sub.business_name}</span>
                  {sub.expires_at && (
                    <span className="text-xs text-muted-foreground/70 mt-1">
                      Expires: {new Date(sub.expires_at).toLocaleDateString('en-IN')}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-semibold text-sm text-foreground">
                    ₹{sub.price.toLocaleString('en-IN')}
                  </span>
                  <Badge variant={getStatusVariant(sub.status) as any} className="uppercase tracking-wider text-[10px]">
                    {sub.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="p-2 border-t border-border text-center bg-muted/20">
        <Button variant="ghost" size="sm" asChild className="gap-1 w-full text-xs text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/subscriptions">
            View all subscriptions <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

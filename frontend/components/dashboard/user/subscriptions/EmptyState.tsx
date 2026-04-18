import React from 'react';
import { PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyState({ hasFilters, onClearFilters }: EmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-t">
        <div className="rounded-full bg-muted p-4 mb-4">
          <PackageOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No matches found</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          We could not find any subscriptions matching your current filters.
        </p>
        <Button variant="outline" className="mt-6" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-t">
      <div className="rounded-full bg-muted p-4 mb-4">
        <PackageOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold">No Subscriptions Yet</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm">
        You are not subscribed to any plans. Browse available plans to get started.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Browse Plans</Link>
      </Button>
    </div>
  );
}

import React from 'react';
import { UserSubscriptionItem } from '@/lib/api';
import { SubscriptionRow } from './SubscriptionRow';
import { SubscriptionSkeleton } from './SubscriptionSkeleton';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

interface SubscriptionsTableProps {
  data: UserSubscriptionItem[];
  isLoading: boolean;
  selectedIds: Set<number>;
  onToggleSelection: (id: number) => void;
  onSelectAll: (ids: number[]) => void;
  onAction: (id: number, action: 'pause' | 'resume' | 'cancel') => Promise<boolean>;
  onViewDetails: (id: number) => void;
}

export function SubscriptionsTable({
  data, isLoading, selectedIds, onToggleSelection, onSelectAll, onAction, onViewDetails
}: SubscriptionsTableProps) {
  const isAllSelected = data.length > 0 && selectedIds.size === data.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectAll(data.map(d => d.id));
    } else {
      onSelectAll([]);
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">
              <Checkbox 
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                disabled={isLoading || data.length === 0}
              />
            </TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Business</TableHead>
            <TableHead>Price (₹)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Billing</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <SubscriptionSkeleton />
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No active rows match.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <SubscriptionRow 
                key={item.id} 
                item={item} 
                isSelected={selectedIds.has(item.id)}
                onToggle={() => onToggleSelection(item.id)}
                onAction={onAction}
                onViewDetails={() => onViewDetails(item.id)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

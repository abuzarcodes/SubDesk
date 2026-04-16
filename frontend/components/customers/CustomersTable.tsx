import React from 'react';
import { CustomerItem } from '@/lib/api';
import { CustomerRow } from './CustomerRow';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

interface CustomersTableProps {
  data: CustomerItem[];
  isLoading: boolean;
  selectedIds: Set<number>;
  onToggleSelection: (id: number) => void;
  onSelectAll: (ids: number[]) => void;
  onAction: (id: number, action: 'pause' | 'resume' | 'cancel') => Promise<boolean>;
  onRemove: (id: number) => Promise<boolean>;
  onViewDetails: (id: number) => void;
}

export function CustomersTable({
  data, isLoading, selectedIds, onToggleSelection, onSelectAll, onAction, onRemove, onViewDetails
}: CustomersTableProps) {
  const isAllSelected = data.length > 0 && selectedIds.size === data.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectAll(data.map(d => d.subscription_id));
    } else {
      onSelectAll([]);
    }
  };

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
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
            <TableHead>Customer</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 10 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-3 w-[100px]" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-md inline-block" /></TableCell>
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                No customers found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <CustomerRow 
                key={item.subscription_id} 
                item={item} 
                isSelected={selectedIds.has(item.subscription_id)}
                onToggle={() => onToggleSelection(item.subscription_id)}
                onAction={onAction}
                onRemove={onRemove}
                onViewDetails={() => onViewDetails(item.subscription_id)}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

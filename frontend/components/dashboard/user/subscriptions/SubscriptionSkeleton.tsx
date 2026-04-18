import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export function SubscriptionSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-4 rounded" /></TableCell>
          <TableCell>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </TableCell>
          <TableCell>
             <Skeleton className="h-4 w-[150px]" />
          </TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-8 w-8 rounded-md inline-block" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

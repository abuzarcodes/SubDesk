import React from 'react';
import { UserTransaction } from '@/lib/api';
import { TransactionRow } from './TransactionRow';
import { BillingSkeleton } from './BillingSkeleton';
import { EmptyState } from './EmptyState';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TransactionsTableProps {
  transactions: UserTransaction[];
  isLoading: boolean;
}

export function TransactionsTable({ transactions, isLoading }: TransactionsTableProps) {
  if (isLoading) {
    return <BillingSkeleton />;
  }

  if (transactions.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden flex-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan Name</TableHead>
            <TableHead>Business Name</TableHead>
            <TableHead>Amount (₹)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => (
            <TransactionRow key={t.id} transaction={t} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

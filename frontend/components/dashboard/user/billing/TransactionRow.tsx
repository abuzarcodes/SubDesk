import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { UserTransaction } from '@/lib/api';

interface TransactionRowProps {
  transaction: UserTransaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'captured':
        return <Badge variant="default">Paid</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">{transaction.plan_name}</TableCell>
      <TableCell>{transaction.business_name}</TableCell>
      <TableCell>₹{transaction.amount.toLocaleString("en-IN")}</TableCell>
      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
      <TableCell className="text-right">
        {new Date(transaction.created_at).toLocaleDateString("en-IN")}
      </TableCell>
    </TableRow>
  );
}

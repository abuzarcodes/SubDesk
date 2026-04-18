"use client";

import React from 'react';
import { BillingSummaryCards } from '@/components/dashboard/user/billing/BillingSummaryCards';
import { TransactionsTable } from '@/components/dashboard/user/billing/TransactionsTable';
import { useUserBilling } from '@/hooks/use-user-billing';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

export default function UserBillingPage() {
  const { 
    summary, transactions, loading, error, pagination, refetch 
  } = useUserBilling();

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Billing</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your payments and spending
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
          <Button variant="outline" size="sm" onClick={refetch} className="shrink-0 border-destructive text-destructive hover:bg-destructive/10">
            <RefreshCcw className="h-3 w-3 mr-2" /> Try Again
          </Button>
        </div>
      ) : null}

      <div className="space-y-6">
        <BillingSummaryCards summary={summary} />

        <div className="flex flex-col min-h-[400px]">
          <h3 className="text-lg font-medium mb-4">Transaction History</h3>
          <TransactionsTable 
            transactions={transactions}
            isLoading={loading}
          />

          {pagination.totalPages > 1 && transactions.length > 0 && (
            <div className="flex items-center justify-between pt-6 select-none border-t mt-4 border-t-muted">
              <div className="text-sm text-muted-foreground hidden sm:block">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <Pagination className="justify-end sm:justify-center">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => pagination.page > 1 && pagination.setPage(pagination.page - 1)}
                      className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => pagination.page < pagination.totalPages && pagination.setPage(pagination.page + 1)}
                      className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}  
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from 'react';
import { SubscriptionFilters } from '@/components/dashboard/user/subscriptions/SubscriptionFilters';
import { SubscriptionsTable } from '@/components/dashboard/user/subscriptions/SubscriptionsTable';
import { BulkActionsBar } from '@/components/dashboard/user/subscriptions/BulkActionsBar';
import { SubscriptionDetailsModal } from '@/components/dashboard/user/subscriptions/SubscriptionDetailsModal';
import { EmptyState } from '@/components/dashboard/user/subscriptions/EmptyState';
import { useUserSubscriptions } from '@/hooks/use-user-subscriptions';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';

export default function UserSubscriptionsPage() {
  const { 
    data, pagination, isLoading, error, filters, actions, selection 
  } = useUserSubscriptions();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [viewSubscriptionId, setViewSubscriptionId] = useState<number | null>(null);

  const { toast } = useToast();

  const handleError = (msg: string) => {
    toast({
      variant: 'destructive',
      title: 'Action Failed',
      description: msg,
    });
  };

  const openDetails = (id: number) => {
    setViewSubscriptionId(id);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setModalOpen(false);
    setTimeout(() => setViewSubscriptionId(null), 300);
  };

  const hasActiveFilters = !!(filters.search || (filters.status && filters.status !== 'all'));
  const showEmptyState = !isLoading && data.length === 0;

  return (
    <div className="flex flex-col flex-1 p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Subscriptions</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage all your subscriptions
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
          <Button variant="outline" size="sm" onClick={actions.fetchSubscriptions} className="shrink-0 border-destructive text-destructive hover:bg-destructive/10">
            <RefreshCcw className="h-3 w-3 mr-2" /> Try Again
          </Button>
        </div>
      ) : null}

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 md:p-6 flex flex-col min-h-[500px]">
        <SubscriptionFilters 
          search={filters.search}
          status={filters.status}
          onSearchChange={actions.setSearch}
          onStatusChange={actions.setStatus}
        />

        <BulkActionsBar 
          selectedIds={selection.selectedIds}
          data={data}
          onBulkAction={actions.handleBulkAction}
          onClearSelection={selection.clearSelection}
          onError={handleError}
        />

        {showEmptyState && !hasActiveFilters ? (
           <div className="flex border-t flex-1 h-full items-center justify-center pt-10">
             <EmptyState />
           </div>
        ) : showEmptyState && hasActiveFilters ? (
           <div className="flex border-t flex-1 h-full items-center justify-center pt-10">
             <EmptyState hasFilters onClearFilters={() => { actions.setSearch(''); actions.setStatus(''); }} />
           </div>
        ) : (
          <SubscriptionsTable 
            data={data}
            isLoading={isLoading}
            selectedIds={selection.selectedIds}
            onToggleSelection={selection.toggleSelection}
            onSelectAll={selection.selectAll}
            onAction={actions.handleAction}
            onViewDetails={openDetails}
          />
        )}

        {pagination.totalPages > 1 && data.length > 0 && (
          <div className="flex items-center justify-between pt-6 select-none border-t mt-4">
            <div className="text-sm text-muted-foreground hidden sm:block">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <Pagination className="justify-end sm:justify-center">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => pagination.page > 1 && actions.setPage(pagination.page - 1)}
                    className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => pagination.page < pagination.totalPages && actions.setPage(pagination.page + 1)}
                    className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}  
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <SubscriptionDetailsModal 
        id={viewSubscriptionId}
        isOpen={modalOpen}
        onClose={closeDetails}
        onError={handleError}
      />
    </div>
  );
}

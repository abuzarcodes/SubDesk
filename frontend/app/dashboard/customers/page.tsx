"use client";

import React, { useState, useEffect } from 'react';
import { CustomerFilters } from '@/components/customers/CustomerFilters';
import { CustomersTable } from '@/components/customers/CustomersTable';
import { BulkActionsBar } from '@/components/customers/BulkActionsBar';
import { CustomerDetailsModal } from '@/components/customers/CustomerDetailsModal';
import { ExportButton } from '@/components/customers/ExportButton';
import { useCustomers } from '@/hooks/use-customers';
import { apiClient, Plan } from '@/lib/api';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/components/ui/use-toast';

export default function CustomersPage() {
  const { 
    data, pagination, isLoading, error, setError, filters, actions, selection 
  } = useCustomers();
  
  const [plans, setPlans] = useState<Plan[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewCustomerId, setViewCustomerId] = useState<number | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Fetch plans once for filters
    apiClient.getMyPlans()
      .then(res => setPlans(res))
      .catch(() => {}); // gracefully ignore for now
  }, []);

  const handleError = (msg: string) => {
    toast({
      variant: 'destructive',
      title: 'Action Failed',
      description: msg,
    });
  };

  const openDetails = (id: number) => {
    setViewCustomerId(id);
    setModalOpen(true);
  };

  const closeDetails = () => {
    setModalOpen(false);
    // Let animation finish before clearing
    setTimeout(() => setViewCustomerId(null), 300);
  };

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Customers</h2>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage your subscribers and their plans
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ExportButton 
            filters={filters} 
            disabled={isLoading || data.length === 0} 
            onError={handleError} 
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center text-sm font-medium text-destructive">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
          <Button variant="outline" size="sm" onClick={actions.fetchCustomers} className="shrink-0 border-destructive text-destructive hover:bg-destructive/10">
            <RefreshCcw className="h-3 w-3 mr-2" /> Try Again
          </Button>
        </div>
      ) : null}

      <CustomerFilters 
        search={filters.search}
        status={filters.status}
        planId={filters.plan_id}
        onSearchChange={actions.setSearch}
        onStatusChange={actions.setStatus}
        onPlanChange={actions.setPlanId}
        plans={plans}
      />

      <BulkActionsBar 
        selectedIds={selection.selectedIds}
        data={data}
        onAction={actions.handleSubscriptionAction}
        onRemove={actions.handleRemoveCustomer}
        onClearSelection={selection.clearSelection}
        onError={handleError}
      />

      <CustomersTable 
        data={data}
        isLoading={isLoading}
        selectedIds={selection.selectedIds}
        onToggleSelection={selection.toggleSelection}
        onSelectAll={selection.selectAll}
        onAction={actions.handleSubscriptionAction}
        onRemove={actions.handleRemoveCustomer}
        onViewDetails={openDetails}
      />

      {data.length === 0 && !isLoading && (filters.search || (filters.status && filters.status !== 'all') || (filters.plan_id && filters.plan_id !== 'all')) && (
        <div className="text-center py-6 text-sm text-muted-foreground animate-in fade-in">
          No results match your current filters.
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between py-4 select-none">
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

      <CustomerDetailsModal 
        id={viewCustomerId}
        isOpen={modalOpen}
        onClose={closeDetails}
        onError={handleError}
      />
    </div>
  );
}

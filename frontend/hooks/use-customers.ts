import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { apiClient, CustomerItem, PaginatedCustomers } from '@/lib/api';

export function useCustomers() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // State mapped from API
  const [data, setData] = useState<CustomerItem[]>([]);
  const [pagination, setPagination] = useState<PaginatedCustomers['pagination']>({
    page: 1, limit: 10, total: 0, totalPages: 1
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Prevent race conditions
  const abortControllerRef = useRef<AbortController | null>(null);

  // Derived state from URL
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(50, Math.max(10, Number(searchParams.get('limit')) || 10));
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const plan_id = searchParams.get('plan_id') || '';

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await apiClient.getCustomers({
        page, limit, search, status, plan_id
      }, abortControllerRef.current.signal);
      
      if (response.success) {
        setData(response.data);
        setPagination(response.pagination);
      } else {
        setError("Failed to load customers.");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Ignored 
      setError(err.message || 'An error occurred fetching customers.');
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [page, limit, search, status, plan_id]);

  useEffect(() => {
    fetchCustomers();
    // Clear selections on filter/page change per requirements
    setSelectedIds(new Set()); 
  }, [fetchCustomers]);

  // Actions
  const updateUrl = useCallback((newParams: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    // Use shallow push to avoid full page reload but update URL + trigger searchParams
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const setPage = (newPage: number) => updateUrl({ page: newPage });
  const setLimit = (newLimit: number) => updateUrl({ limit: newLimit, page: 1 });
  const setSearch = (newSearch: string) => updateUrl({ search: newSearch, page: 1 });
  const setStatus = (newStatus: string) => updateUrl({ status: newStatus, page: 1 });
  const setPlanId = (newPlan: string) => updateUrl({ plan_id: newPlan, page: 1 });

  const handleSubscriptionAction = useCallback(async (id: number, action: 'pause' | 'resume' | 'cancel') => {
    try {
      await apiClient.updateSubscriptionStatus(id, action);
      // refetch on mutation
      await fetchCustomers();
      return true;
    } catch (err: any) {
      throw err; // Component might want to handle it locally alongside showing the broad error?
    }
  }, [fetchCustomers]);

  const handleRemoveCustomer = useCallback(async (id: number) => {
    try {
      await apiClient.removeCustomer(id);
      await fetchCustomers();
      return true;
    } catch (err: any) {
      throw err;
    }
  }, [fetchCustomers]);

  const toggleSelection = useCallback((id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: number[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  return {
    data,
    pagination,
    isLoading,
    error,
    setError,
    filters: { page, limit, search, status, plan_id },
    actions: {
      setPage, setLimit, setSearch, setStatus, setPlanId,
      handleSubscriptionAction, handleRemoveCustomer,
      fetchCustomers
    },
    selection: {
      selectedIds,
      toggleSelection,
      selectAll,
      clearSelection
    }
  };
}

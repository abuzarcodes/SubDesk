import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { apiClient, UserSubscriptionItem, PaginatedUserSubscriptions } from '@/lib/api';

export function useUserSubscriptions() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // State mapped from API
  const [data, setData] = useState<UserSubscriptionItem[]>([]);
  const [pagination, setPagination] = useState<PaginatedUserSubscriptions['pagination']>({
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

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await apiClient.getUserSubscriptions({
        page, limit, search, status
      }, abortControllerRef.current.signal);
      
      if (response.success) {
        setData(response.data);
        setPagination(response.pagination);
      } else {
        setError("Failed to load subscriptions.");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Ignored 
      setError(err.message || 'An error occurred fetching subscriptions.');
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [page, limit, search, status]);

  useEffect(() => {
    fetchSubscriptions();
    // Clear selections on filter/page change per requirements
    setSelectedIds(new Set()); 
  }, [fetchSubscriptions]);

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
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  const setPage = (newPage: number) => updateUrl({ page: newPage });
  const setLimit = (newLimit: number) => updateUrl({ limit: newLimit, page: 1 });
  const setSearch = (newSearch: string) => updateUrl({ search: newSearch, page: 1 });
  const setStatus = (newStatus: string) => updateUrl({ status: newStatus, page: 1 });

  const handleAction = useCallback(async (id: number, action: 'pause' | 'resume' | 'cancel') => {
    try {
      await apiClient.updateUserSubscriptionStatus(id, action);
      await fetchSubscriptions();
      return true;
    } catch (err: any) {
      throw err;
    }
  }, [fetchSubscriptions]);

  const handleBulkAction = useCallback(async (ids: number[], action: 'pause' | 'cancel') => {
    try {
      await apiClient.bulkUpdateUserSubscriptions(ids, action);
      await fetchSubscriptions();
      setSelectedIds(new Set());
      return true;
    } catch (err: any) {
      throw err;
    }
  }, [fetchSubscriptions]);

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
    filters: { page, limit, search, status },
    actions: {
      setPage, setLimit, setSearch, setStatus,
      handleAction, handleBulkAction,
      fetchSubscriptions
    },
    selection: {
      selectedIds,
      toggleSelection,
      selectAll,
      clearSelection
    }
  };
}

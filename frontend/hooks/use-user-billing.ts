import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { apiClient, UserBillingSummary, UserTransaction, PaginatedUserTransactions } from '@/lib/api';

export function useUserBilling() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [summary, setSummary] = useState<UserBillingSummary | null>(null);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [pagination, setPagination] = useState<PaginatedUserTransactions['pagination']>({
    page: 1, limit: 10, total: 0, totalPages: 1
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(50, Math.max(10, Number(searchParams.get('limit')) || 10));

  const fetchBillingData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const [summaryRes, transactionsRes] = await Promise.all([
        apiClient.getUserBillingSummary(abortControllerRef.current.signal),
        apiClient.getUserTransactions({ page, limit }, abortControllerRef.current.signal)
      ]);
      
      if (summaryRes.success && transactionsRes.success) {
        setSummary(summaryRes.data);
        setTransactions(transactionsRes.data);
        setPagination(transactionsRes.pagination);
      } else {
        setError("Failed to load billing information.");
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return; 
      setError(err.message || 'An error occurred fetching billing information.');
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [page, limit]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

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

  return {
    summary,
    transactions,
    loading,
    error,
    pagination: {
      ...pagination,
      setPage
    },
    refetch: fetchBillingData
  };
}

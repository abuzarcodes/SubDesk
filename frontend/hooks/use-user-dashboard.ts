import { useState, useCallback, useEffect } from 'react';
import { apiClient, UserDashboardSummary } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useUserDashboard() {
  const [data, setData] = useState<UserDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getDashboardSummary();
      if (response.success) {
        setData(response.data);
      } else {
        setError("Failed to load dashboard data.");
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching dashboard data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const refetch = () => {
    fetchDashboardData();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}

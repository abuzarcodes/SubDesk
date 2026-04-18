import { useState, useEffect } from "react";
import { apiClient, AnalyticsData } from "@/lib/api";

export function useUserAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.getUserAnalytics(range);
        if (res.success) {
          setData(res.data);
        } else {
          setError("Failed to load analytics");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [range]);

  return { data, loading, error, range, setRange };
}

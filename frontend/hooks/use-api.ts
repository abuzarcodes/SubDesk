import { useState, useCallback } from 'react';

export function useApi<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  if (immediate) {
    // Execute on mount - only do this once
    const executed = (asyncFunction as any).__executed;
    if (!executed) {
      (asyncFunction as any).__executed = true;
      execute();
    }
  }

  return { data, loading, error, execute };
}

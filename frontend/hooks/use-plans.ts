'use client';

import { useState, useCallback } from 'react';
import { apiClient, Plan } from '@/lib/api';
import { toast } from 'sonner';

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.getMyPlans();
      setPlans(data);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  }, []);

  const createPlan = useCallback(async (data: Partial<Plan>) => {
    setSaving(true);
    try {
      const newPlan = await apiClient.createPlan(data);
      setPlans((prev) => [...prev, newPlan]);
      toast.success('Plan created successfully!');
      return newPlan;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create plan');
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const updatePlan = useCallback(async (planId: number, data: Partial<Plan>) => {
    setSaving(true);
    try {
      const updated = await apiClient.updatePlan(planId, data);
      setPlans((prev) => prev.map((p) => (p.id === planId ? updated : p)));
      toast.success('Plan updated successfully!');
      return updated;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update plan');
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const deletePlan = useCallback(async (planId: number) => {
    try {
      await apiClient.deletePlan(planId);
      setPlans((prev) => prev.filter((p) => p.id !== planId));
      toast.success('Plan deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete plan');
      throw error;
    }
  }, []);

  return {
    plans,
    loading,
    saving,
    fetchPlans,
    createPlan,
    updatePlan,
    deletePlan,
  };
}

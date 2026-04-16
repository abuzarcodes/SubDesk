'use client';

import { useEffect, useState } from 'react';
import { usePlans } from '@/hooks/use-plans';
import { PlanCard } from '@/components/dashboard/PlanCard';
import { CreatePlanModal } from '@/components/dashboard/CreatePlanModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, CreditCard } from 'lucide-react';
import type { Plan } from '@/lib/api';

export default function PlansPage() {
  const { plans, loading, saving, fetchPlans, createPlan, updatePlan, deletePlan } = usePlans();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setModalOpen(true);
  };

  const handleModalSubmit = async (data: Partial<Plan>) => {
    if (editingPlan) {
      await updatePlan(editingPlan.id, data);
    } else {
      await createPlan(data);
    }
    setEditingPlan(null);
  };

  const handleModalClose = (open: boolean) => {
    setModalOpen(open);
    if (!open) setEditingPlan(null);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your subscription plans
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingPlan(null);
            setModalOpen(true);
          }}
          className="gap-2 rounded-xl transition-all duration-200 hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3.5 w-3/5" />
              </div>
              <div className="pt-3 border-t border-border/50 flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-16 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-base font-semibold text-foreground mb-1">No plans yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Create your first plan to start accepting subscriptions from your customers.
          </p>
          <Button
            className="mt-6 gap-2 rounded-xl"
            onClick={() => {
              setEditingPlan(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Create Your First Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={handleEdit}
              onDelete={deletePlan}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <CreatePlanModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        onSubmit={handleModalSubmit}
        editingPlan={editingPlan}
        isLoading={saving}
      />
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { PlanForm } from '@/components/plan-form';
import type { Plan } from '@/lib/api';

interface CreatePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Partial<Plan>) => Promise<void>;
  editingPlan?: Plan | null;
  isLoading?: boolean;
}

export function CreatePlanModal({
  open,
  onOpenChange,
  onSubmit,
  editingPlan,
  isLoading = false,
}: CreatePlanModalProps) {
  const handleSubmit = async (data: Partial<Plan>) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-xl font-semibold">
            {editingPlan ? 'Edit Plan' : 'Create New Plan'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editingPlan
              ? 'Update the details of your subscription plan.'
              : 'Set up a new subscription plan for your customers.'}
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <PlanForm
            key={editingPlan?.id ?? 'new'}
            onSubmit={handleSubmit}
            initialPlan={editingPlan || undefined}
            isLoading={isLoading}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

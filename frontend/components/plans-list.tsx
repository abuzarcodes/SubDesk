'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { Plan } from '@/lib/api';
import { formatINR } from '@/lib/formatCurrency';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface PlansListProps {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (planId: number) => Promise<void>;
  isLoading?: boolean;
}

export function PlansList({ plans, onEdit, onDelete, isLoading = false }: PlansListProps) {
  if (plans.length === 0) {
    return (
      <div className="rounded-lg border border-border border-dashed bg-card/50 p-8 text-center">
        <p className="text-muted-foreground">No plans yet. Create your first plan to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-sm"
        >
          <div className="flex-1 space-y-1">
            <h4 className="font-medium text-foreground">{plan.name}</h4>
            <div className="text-sm text-muted-foreground">
              {formatINR(Number(plan.price))} / {plan.billing_cycle}
            </div>
            {plan.description && (
              <p className="text-xs text-muted-foreground line-clamp-1">{plan.description}</p>
            )}
            {plan.features && plan.features.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {plan.features.slice(0, 3).map((f, i) => (
                  <span key={i} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary uppercase">
                    {f}
                  </span>
                ))}
                {plan.features.length > 3 && (
                  <span className="text-[10px] text-muted-foreground">+{plan.features.length - 3} more</span>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(plan)}
              disabled={isLoading}
              className="h-9 w-9"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isLoading}
                  className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {plan.name}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(plan.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  );
}

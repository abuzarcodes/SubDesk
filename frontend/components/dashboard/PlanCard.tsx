'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Check, Tag } from 'lucide-react';
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

interface PlanCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (planId: number) => Promise<void>;
  compact?: boolean;
}

export function PlanCard({ plan, onEdit, onDelete, compact = false }: PlanCardProps) {
  const hasDiscount = plan.discount && plan.discount > 0;
  const discountedPrice = hasDiscount
    ? plan.price * (1 - (plan.discount || 0) / 100)
    : plan.price;

  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:scale-[1.01]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-semibold text-foreground truncate">{plan.name}</h4>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-foreground">
              {formatINR(Number(discountedPrice))}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatINR(Number(plan.price))}
              </span>
            )}
            <span className="text-sm text-muted-foreground">/ {plan.billing_cycle}</span>
          </div>
        </div>

        {hasDiscount && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Tag className="h-3 w-3" />
            {Number(Number(plan.discount).toFixed(2))}% off
          </span>
        )}
      </div>

      {/* Description */}
      {plan.description && (
        <p className={`text-sm text-muted-foreground mb-3 ${compact ? 'line-clamp-1' : 'line-clamp-2'}`}>
          {plan.description}
        </p>
      )}

      {/* Features */}
      {plan.features && plan.features.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {plan.features.slice(0, compact ? 2 : 4).map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{f}</span>
            </div>
          ))}
          {plan.features.length > (compact ? 2 : 4) && (
            <p className="text-xs text-muted-foreground/70 pl-5.5">
              +{plan.features.length - (compact ? 2 : 4)} more features
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-border/50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(plan)}
          className="flex-1 h-8 text-xs gap-1.5 transition-all duration-200"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete &ldquo;{plan.name}&rdquo;?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. All subscriptions associated with this plan may be affected.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(plan.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Plan
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

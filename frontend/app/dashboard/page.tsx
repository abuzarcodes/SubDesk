'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { usePlans } from '@/hooks/use-plans';
import { apiClient } from '@/lib/api';
import { PlanCard } from '@/components/dashboard/PlanCard';
import { CreatePlanModal } from '@/components/dashboard/CreatePlanModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Check, Palette, Plus, ArrowRight, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import type { Plan } from '@/lib/api';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { plans, loading, saving, fetchPlans, createPlan, updatePlan, deletePlan } = usePlans();

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlans();
    loadProfile();
  }, [fetchPlans]);

  const loadProfile = async () => {
    try {
      const data = await apiClient.getPageConfig();
      setProfile(data.profile);
    } catch {
      // Silently fail for profile
    } finally {
      setProfileLoading(false);
    }
  };

  const publicIdentifier = profile?.slug || user?.id;

  const copyShareLink = () => {
    const link = `${window.location.origin}/subscribe/${publicIdentifier}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard!');
  };

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

  const previewPlans = plans.slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your subscription business
        </p>
      </div>

      {/* Share Link Card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Share Your Plans</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Share this link with your customers to let them subscribe
            </p>
          </div>
          <div className="flex gap-2">
            {profileLoading ? (
              <Skeleton className="h-10 flex-1 rounded-lg" />
            ) : (
              <code className="flex-1 rounded-lg bg-muted/50 px-4 py-2.5 text-sm text-foreground break-all font-mono">
                {typeof window !== 'undefined' ? window.location.origin : ''}/subscribe/{publicIdentifier}
              </code>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              className="gap-2 h-10 px-4 shrink-0 transition-all duration-200"
              disabled={profileLoading}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          onClick={() => {
            setEditingPlan(null);
            setModalOpen(true);
          }}
          className="h-12 gap-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
        >
          <Plus className="h-4 w-4" />
          Create Plan
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/customize')}
          className="h-12 gap-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02]"
        >
          <Palette className="h-4 w-4" />
          Customize Page
        </Button>
      </div>

      {/* Plans Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-foreground">Your Plans</h2>
          {plans.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/plans')}
              className="gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View All Plans
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="pt-3 border-t border-border/50 flex gap-2">
                  <Skeleton className="h-8 flex-1" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : previewPlans.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
            <CreditCard className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No plans yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Create your first plan to get started.
            </p>
            <Button
              size="sm"
              className="mt-4 gap-1.5"
              onClick={() => {
                setEditingPlan(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previewPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={handleEdit}
                onDelete={deletePlan}
                compact
              />
            ))}
          </div>
        )}

        {plans.length > 0 && plans.length <= 3 && (
          <div className="text-center pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/plans')}
              className="gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              View All Plans
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Plan Modal */}
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

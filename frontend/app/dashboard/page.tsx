'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiClient, Plan } from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { PlanForm } from '@/components/plan-form';
import { PlansList } from '@/components/plans-list';
import { CustomersList } from '@/components/customers-list';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Subscription } from '@/lib/api';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'business') {
      router.push('/login');
      return;
    }

    loadData();
  }, [user, authLoading, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansData, subsData] = await Promise.all([
        apiClient.getMyPlans(),
        apiClient.getBusinessSubscriptions(),
      ]);
      setPlans(plansData);
      setSubscriptions(subsData);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (data: Partial<Plan>) => {
    setIsSaving(true);
    try {
      const newPlan = await apiClient.createPlan(data);
      setPlans([...plans, newPlan]);
      toast.success('Plan created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePlan = async (data: Partial<Plan>) => {
    if (!editingPlan) return;

    setIsSaving(true);
    try {
      const updated = await apiClient.updatePlan(editingPlan.id, data);
      setPlans(plans.map((p) => (p.id === editingPlan.id ? updated : p)));
      setEditingPlan(null);
      toast.success('Plan updated successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    try {
      await apiClient.deletePlan(planId);
      setPlans(plans.filter((p) => p.id !== planId));
      toast.success('Plan deleted successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete plan');
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/subscribe/${user?.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Link copied to clipboard!');
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Manage your subscription plans and customers</p>
          </div>

          {/* Share Link */}
          <div className="mb-8 rounded-lg border border-border bg-card p-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground">Share Your Plans</h3>
              <p className="text-sm text-muted-foreground">
                Share this link with your customers to let them subscribe to your plans
              </p>
              <div className="flex gap-2">
                <code className="flex-1 rounded-lg bg-muted/50 px-4 py-2 text-sm text-foreground break-all">
                  {`${typeof window !== 'undefined' ? window.location.origin : ''}/subscribe/${user?.id}`}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyShareLink}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied
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

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Plans Section */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="plans" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="plans">Plans</TabsTrigger>
                  <TabsTrigger value="customers">Customers</TabsTrigger>
                </TabsList>

                <TabsContent value="plans" className="space-y-4">
                  <PlansList
                    plans={plans}
                    onEdit={setEditingPlan}
                    onDelete={handleDeletePlan}
                    isLoading={isSaving}
                  />
                </TabsContent>

                <TabsContent value="customers">
                  <CustomersList subscriptions={subscriptions} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Form Section */}
            <div>
              <PlanForm
                onSubmit={editingPlan ? handleUpdatePlan : handleCreatePlan}
                initialPlan={editingPlan || undefined}
                isLoading={isSaving}
              />
              {editingPlan && (
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => setEditingPlan(null)}
                >
                  Cancel Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

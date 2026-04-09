'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { apiClient, BusinessWithPlans } from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SubscribePage() {
  const params = useParams();
  const businessId = params.businessId as string;
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<BusinessWithPlans | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribingTo, setSubscribingTo] = useState<number | null>(null);

  useEffect(() => {
    loadPlans();
  }, [businessId]);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const result = await apiClient.getBusinessPlans(Number(businessId));
      setData(result);
      console.log(result);
    } catch (error) {
      toast.error('Failed to load plans');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: number) => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'customer') {
      toast.error('Only customers can subscribe to plans');
      return;
    }

    setSubscribingTo(planId);
    try {
      await apiClient.subscribe(planId, Number(businessId));
      toast.success('Subscribed successfully!');
      router.push('/my-subscriptions');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to subscribe');
    } finally {
      setSubscribingTo(null);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <LoadingSpinner />
      </>
    );
  }

  if (!data || data.plans.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-background">
          <div className="flex flex-col items-center justify-center px-4 py-20">
            <div className="text-center space-y-4 max-w-md">
              <h1 className="text-2xl font-bold text-foreground">No Plans Available</h1>
              <p className="text-muted-foreground">
                This business hasn&apos;t created any subscription plans yet.
              </p>
              <Button onClick={() => router.push('/')}>Go Home</Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
          <div className="mb-12 text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">
              {data.business.name}
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose a plan that works for you
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {data.plans.map((plan) => (
              <Card
                key={plan.id}
                className="flex flex-col overflow-hidden border border-border hover:border-primary/50 transition-all"
              >
                <div className="flex-1 space-y-6 p-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        ${Number(plan.price).toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">/ {plan.billing_cycle}</span>
                    </div>
                    {plan.description && (
                      <p className="text-sm text-muted-foreground pt-2">{plan.description}</p>
                    )}
                  </div>

                  {/* Features and Benefits */}
                  <div className="space-y-4 pt-4 border-t border-border/50">
                    {plan.features && plan.features.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features</p>
                        <div className="grid grid-cols-1 gap-2">
                          {plan.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <Check className="h-4 w-4 text-primary shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(plan.benefits_available || plan.benefits_not_available) && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Benefits</p>
                        <div className="space-y-2">
                          {plan.benefits_available?.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                                <Check className="h-3 w-3" />
                              </div>
                              <span>{b}</span>
                            </div>
                          ))}
                          {plan.benefits_not_available?.map((b, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground/60">
                              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground/50">
                                <X className="h-3 w-3" />
                              </div>
                              <span className="line-through">{b}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-6">
                    <Button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribingTo === plan.id}
                      className="w-full"
                    >
                      {subscribingTo === plan.id ? 'Subscribing...' : 'Subscribe Now'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

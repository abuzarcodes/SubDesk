'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { apiClient, Subscription } from '@/lib/api';
import { Navbar } from '@/components/navbar';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function MySubscriptionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'customer') {
      router.push('/login');
      return;
    }

    loadSubscriptions();
  }, [user, authLoading, router]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getMySubscriptions();
      setSubscriptions(data);
    } catch (error) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
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
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="mb-8 space-y-4">
            <h1 className="text-3xl font-bold text-foreground">My Subscriptions</h1>
            <p className="text-muted-foreground">Manage all your active subscriptions</p>
          </div>

          {subscriptions.length === 0 ? (
            <div className="rounded-lg border border-border border-dashed bg-card/50 p-12 text-center space-y-4">
              <p className="text-muted-foreground text-lg">You don&apos;t have any subscriptions yet</p>
              <Button onClick={() => router.push('/')}>
                Browse Available Plans
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.map((sub) => (
                <Card key={sub.id} className="border border-border overflow-hidden hover:border-primary/50 transition-all">
                  <div className="p-6 space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{sub.business_name}</p>
                      <h3 className="text-xl font-bold text-foreground">{sub.plan_name}</h3>
                      {/* We'd need to fetch the full plan details or include description in the subscription view if we want it here. 
                          For now, just sticking to what we have or adding it to the sub interface if needed. */}
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">
                        ${Number(sub.plan_price).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {sub.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

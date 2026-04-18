'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useUserDashboard } from '@/hooks/use-user-dashboard';

import { StatsCard } from '@/components/dashboard/user/StatsCard';
import { SubscriptionsPreview } from '@/components/dashboard/user/SubscriptionsPreview';
import { UpcomingPayments } from '@/components/dashboard/user/UpcomingPayments';
import { RecentActivity } from '@/components/dashboard/user/RecentActivity';
import { DashboardSkeleton } from '@/components/dashboard/user/DashboardSkeleton';
import { EmptyState } from '@/components/dashboard/user/EmptyState';
import { Button } from '@/components/ui/button';

import { Activity, CreditCard, CalendarDays } from 'lucide-react';

export default function UserOverviewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading, error, refetch } = useUserDashboard();

  useEffect(() => {
    // If auth is loaded and user is not a customer, redirect
    if (user && user.role !== 'customer') {
      router.replace('/dashboard');
    }
  }, [user, router]);

  // If loading auth or if user is business (and redirect is in-flight), don't render dashboard
  if (!user || user.role !== 'customer') {
    return null; 
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8 space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Overview of your subscriptions</p>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-6 flex flex-col items-center justify-center text-center h-64 gap-4">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="default" onClick={refetch}>
            Retry
          </Button>
        </div>
      ) : !data ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard 
              title="Active Subscriptions" 
              value={data.stats.activeSubscriptions} 
              icon={<Activity className="h-4 w-4 text-muted-foreground" />} 
            />
            <StatsCard 
              title="Monthly Spend" 
              value={`₹${data.stats.monthlySpend.toLocaleString('en-IN')}`} 
              icon={<CreditCard className="h-4 w-4 text-muted-foreground" />} 
            />
            <StatsCard 
              title="Upcoming Payments" 
              value={data.stats.upcomingPayments} 
              icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} 
            />
          </div>

          {!data.stats.activeSubscriptions && data.subscriptionsPreview.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SubscriptionsPreview subscriptions={data.subscriptionsPreview} />
                <UpcomingPayments payments={data.upcomingPayments} />
              </div>

              <RecentActivity activity={data.recentActivity} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

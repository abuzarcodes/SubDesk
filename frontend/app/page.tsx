'use client';

import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const features = [
  'Create and manage subscription plans',
  'Track customer subscriptions',
  'View real-time analytics',
  'Share subscription links',
];

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'business') {
        router.push('/dashboard');
      } else {
        router.push('/my-subscriptions');
      }
    }
  }, [user, router]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
        <div className="mx-auto max-w-6xl px-4 py-20 md:py-32">
          <div className="grid gap-12 md:gap-20">
            {/* Hero Section */}
            <div className="flex flex-col gap-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl">
                  Subscription Management
                  <span className="block text-primary">Made Simple</span>
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                  Create, manage, and track subscription plans with ease. The modern platform for subscription businesses.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row justify-center">
                <Link href="/register">
                  <Button size="lg" className="gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                    <p className="text-sm font-medium text-foreground">{feature}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center md:p-12">
              <h2 className="text-2xl font-bold text-foreground md:text-3xl">
                Ready to get started?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Join businesses managing subscriptions with SubTrckr
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row justify-center">
                <Link href="/register?role=business">
                  <Button size="lg">For Businesses</Button>
                </Link>
                <Link href="/register?role=customer">
                  <Button size="lg" variant="outline">
                    For Customers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { apiClient, PublicPageData } from '@/lib/api';
import { DEFAULT_CONFIG } from '@/lib/theme';
import { SubscribeThemeProvider } from '@/components/subscribe/SubscribeThemeProvider';
import { BrandHeader } from '@/components/subscribe/BrandHeader';
import { PlanSection } from '@/components/subscribe/PlanSection';
import { toast } from 'sonner';

import { Suspense } from 'react';
import { LoadingSpinner } from '@/components/loading-spinner';

function SubscribePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const identifier = params.identifier as string;
  const isPreview = searchParams?.get('preview') === 'true';

  const [data, setData] = useState<PublicPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const result = await apiClient.getPublicSubscribePage(identifier);
        setData(result);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load public page:', err);
        setError(err.message || 'Page not found');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [identifier]);

  // Listener for live profile updates (from dashboard preview)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'SUBDESK_PROFILE_UPDATE' && event.data.payload) {
        setData(prev => prev ? ({
          ...prev,
          business: {
            ...prev.business,
            ...event.data.payload
          }
        }) : null);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Loading Skeleton State
  if (loading) {
    return (
      <SubscribeThemeProvider initialConfig={DEFAULT_CONFIG}>
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
          <BrandHeader isLoading={true} />
          <div className="mt-12 opacity-50 distribute-center">
             <div className="flex justify-center flex-wrap gap-8 animate-pulse text-[var(--sub-muted)]">
                 Loading subscription plans...
             </div>
          </div>
        </div>
      </SubscribeThemeProvider>
    );
  }

  // Error State
  if (error || !data) {
    return (
      <SubscribeThemeProvider initialConfig={DEFAULT_CONFIG}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">{error === 'Page not found' ? 'Page Not Found' : 'Error'}</h1>
          <p className="text-[var(--sub-muted)] mb-8 max-w-md">
            {error || "We couldn't load the subscription plans at this time."}
          </p>
        </div>
      </SubscribeThemeProvider>
    );
  }

  // Ensure there's a fallback config if entirely null
  const activeConfig = data.config || DEFAULT_CONFIG;

  return (
    <SubscribeThemeProvider key={loading ? 'loading' : 'ready'} initialConfig={activeConfig}>
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-20">
        <BrandHeader 
          displayName={data.business.display_name}
          logoUrl={data.business.logo_url}
          tagline={data.business.tagline}
        />

        <div className="mt-12 md:mt-16">
          <PlanSection 
            plans={data.plans}
            businessId={data.business.id}
            isPreview={isPreview}
          />
        </div>
      </div>
    </SubscribeThemeProvider>
  );
}

export default function SubscribePage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SubscribePageContent />
    </Suspense>
  );
}

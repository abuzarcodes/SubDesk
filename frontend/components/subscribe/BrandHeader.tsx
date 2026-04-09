'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { Building2 } from 'lucide-react';

interface BrandHeaderProps {
  displayName?: string;
  logoUrl?: string;
  tagline?: string;
  isLoading?: boolean;
}

export function BrandHeader({ displayName, logoUrl, tagline, isLoading }: BrandHeaderProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
      {logoUrl ? (
        <img 
          src={logoUrl} 
          alt={`${displayName} logo`} 
          className="h-20 w-20 rounded-full object-cover border-2 border-[var(--sub-card)] shadow-sm"
        />
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--sub-card)] shadow-sm">
          <Building2 className="h-10 w-10 text-[var(--sub-muted)]" />
        </div>
      )}
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--sub-primary)] to-[var(--sub-accent)]">
          {displayName}
        </h1>
        {tagline && (
          <p className="text-[var(--sub-muted)] text-lg max-w-md mx-auto">
            {tagline}
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { BusinessProfile } from '@/lib/theme';
import { ProfileForm } from '@/components/ProfileForm';
import { ProfilePreview } from '@/components/ProfilePreview';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ProfilePage() {
  const [draftProfile, setDraftProfile] = useState<BusinessProfile>({
    display_name: '',
    slug: '',
    logo_url: '',
    tagline: '',
    support_email: '',
  });
  const [savedProfile, setSavedProfile] = useState<BusinessProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getPageConfig();
      setDraftProfile(data.profile);
      setSavedProfile(data.profile);
    } catch (error: any) {
      toast({
        title: 'Error fetching profile',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = (data: Partial<BusinessProfile>) => {
    setDraftProfile((prev) => ({ ...prev, ...data }));
  };

  const handleSave = async () => {
    if (!draftProfile.display_name || !draftProfile.slug) {
      toast({
        title: 'Validation Error',
        description: 'Business Name and Slug are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.updateProfile(draftProfile);
      setSavedProfile(draftProfile);
      toast({
        title: 'Profile Saved',
        description: 'Your business profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving profile',
        description: error.message || 'Failed to update profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (savedProfile) {
      setDraftProfile(savedProfile);
    }
  };

  const isDirty = JSON.stringify(draftProfile) !== JSON.stringify(savedProfile);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-64" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
      </div>
      
      <ProfileForm
        profile={draftProfile}
        onUpdate={handleUpdate}
        onSave={handleSave}
        onReset={handleReset}
        isDirty={isDirty}
        isLoading={isSaving}
      />
    </div>
  );
}

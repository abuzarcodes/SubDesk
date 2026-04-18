"use client";

import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import type { BusinessProfile } from "@/lib/theme";
import { ProfileForm } from "@/components/ProfileForm";

import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ProfilePage() {
  const [draftProfile, setDraftProfile] = useState<BusinessProfile>({
    display_name: "",
    slug: "",
    logo_url: "",
    tagline: "",
    support_email: "",
  });
  const [savedProfile, setSavedProfile] = useState<BusinessProfile | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getPageConfig();
      setDraftProfile(data.profile);
      setSavedProfile(data.profile);
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
        description: error.message || "Something went wrong",
        variant: "destructive",
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
        title: "Validation Error",
        description: "Business Name and Slug are required",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await apiClient.updateProfile(draftProfile);
      setSavedProfile(draftProfile);
      toast({
        title: "Profile Saved",
        description: "Your business profile has been updated successfully.",
      });
      setOpen(false); // Close dialog on success
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = () => {
    if (savedProfile) {
        setDraftProfile(savedProfile);
    }
    setOpen(true);
  }

  const isDirty = JSON.stringify(draftProfile) !== JSON.stringify(savedProfile);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="space-y-6">
          <Skeleton className="h-6 w-1/3 mb-6" />
          <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4 md:p-6 mb-8 max-w-xl mx-auto space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:px-6 md:py-8 w-full">
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Business Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your customer-facing business profile</p>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm max-w-2xl mx-auto overflow-hidden">
        <div className="p-4 md:p-6 pb-2 md:pb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Business Information</h2>
            <Button variant="outline" size="sm" onClick={handleEditClick}>
                Edit Profile
            </Button>
        </div>
        <div className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Business Name</p>
              <p className="text-sm font-medium mt-1">{savedProfile?.display_name || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unique Slug</p>
              <p className="text-sm font-medium mt-1">{savedProfile?.slug || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tagline</p>
              <p className="text-sm font-medium mt-1">{savedProfile?.tagline || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Support Email</p>
              <p className="text-sm font-medium mt-1">{savedProfile?.support_email || '—'}</p>
            </div>
            {savedProfile?.logo_url && (
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium text-muted-foreground mb-2">Logo preview</p>
                <div className="w-16 h-16 rounded-xl border border-border bg-card p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  <img src={savedProfile.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              </div>
            )}
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Business Profile</DialogTitle>
              <DialogDescription>
                Customize how your business appears to your customers. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <ProfileForm
                profile={draftProfile}
                onUpdate={handleUpdate}
                onSave={handleSave}
                onCancel={() => setOpen(false)}
                isDirty={isDirty}
                isLoading={isSaving}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

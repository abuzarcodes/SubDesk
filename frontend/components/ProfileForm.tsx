'use client';

import React from 'react';
import type { BusinessProfile } from '@/lib/theme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { formatSlug } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, RotateCcw, Globe, Mail, Quote, Layout } from 'lucide-react';

interface ProfileFormProps {
  profile: BusinessProfile;
  onUpdate: (data: Partial<BusinessProfile>) => void;
  onSave: () => void;
  onReset: () => void;
  isDirty: boolean;
  isLoading?: boolean;
}

export function ProfileForm({
  profile,
  onUpdate,
  onSave,
  onReset,
  isDirty,
  isLoading = false,
}: ProfileFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'slug') {
      onUpdate({ [name]: formatSlug(value) });
    } else {
      onUpdate({ [name]: value });
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-2xl font-bold text-slate-900">Profile Settings</CardTitle>
        <CardDescription>
          Customize how your business appears to your customers.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="display_name" className="text-sm font-semibold text-slate-700">
              Business Name
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Layout size={18} />
              </div>
              <Input
                id="display_name"
                name="display_name"
                value={profile.display_name || ''}
                onChange={handleChange}
                placeholder="e.g. Gym Pro"
                className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="logo_url" className="text-sm font-semibold text-slate-700">
              Logo URL
            </Label>
            <div className="flex gap-3 items-start">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Globe size={18} />
                </div>
                <Input
                  id="logo_url"
                  name="logo_url"
                  value={profile.logo_url || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/logo.png"
                  className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>
              {profile.logo_url && (
                <div className="w-11 h-11 rounded-xl border border-slate-200 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  <img src={profile.logo_url} alt="Logo preview" className="max-w-full max-h-full object-contain" />
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tagline" className="text-sm font-semibold text-slate-700">
              Tagline
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Quote size={18} />
              </div>
              <Input
                id="tagline"
                name="tagline"
                value={profile.tagline || ''}
                onChange={handleChange}
                placeholder="Stay fit, stay healthy"
                className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="support_email" className="text-sm font-semibold text-slate-700">
              Support Email
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={18} />
              </div>
              <Input
                id="support_email"
                name="support_email"
                type="email"
                value={profile.support_email || ''}
                onChange={handleChange}
                placeholder="support@company.com"
                className="pl-10 h-11 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug" className="text-sm font-semibold text-slate-700">
              Unique URL Slug
            </Label>
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <Globe size={18} />
                </div>
                <Input
                  id="slug"
                  name="slug"
                  value={profile.slug || ''}
                  onChange={handleChange}
                  placeholder="gym-pro"
                  className="pl-10 h-11 rounded-xl border-slate-200 font-mono text-sm focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 font-medium px-1">
                Your public page will be: <span className="text-indigo-600">subtrckr.com/subscribe/{profile.slug || '{slug}'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 bordert-t border-slate-100">
          <Button
            onClick={onSave}
            disabled={!isDirty || isLoading || !profile.display_name || !profile.slug}
            className="flex-1 h-11 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-lg shadow-indigo-200 disabled:shadow-none disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save size={18} />
                Save Changes
              </div>
            )}
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            disabled={!isDirty || isLoading}
            className="h-11 px-4 rounded-xl border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-all"
          >
            <RotateCcw size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

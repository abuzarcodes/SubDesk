"use client"

import { useUserSettings } from "@/hooks/use-user-settings"
import { SettingsHeader } from "@/components/dashboard/user/settings/SettingsHeader"
import { SettingsSkeleton } from "@/components/dashboard/user/settings/SettingsSkeleton"
import { ProfileCard } from "@/components/dashboard/user/settings/ProfileCard"

export default function SettingsPage() {
  const state = useUserSettings();

  return (
    <div className="w-full">
      <SettingsHeader />
      
      {state.loading ? (
        <SettingsSkeleton />
      ) : (
        <ProfileCard state={state} />
      )}
    </div>
  );
}

import { useState } from "react"
import { ProfileForm } from "./ProfileForm"
import { useUserSettings } from "@/hooks/use-user-settings"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function ProfileCard({ state }: { state: ReturnType<typeof useUserSettings> }) {
  const [open, setOpen] = useState(false);

  const handleEditClick = () => {
    // Reset form to current profile when opening modal
    if (state.profile) {
        state.setFormData({ username: state.profile.username, email: state.profile.email });
    }
    setOpen(true);
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm max-w-xl mx-auto overflow-hidden">
      <div className="p-4 md:p-6 pb-2 md:pb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Profile Information</h2>
          <Button variant="outline" size="sm" onClick={handleEditClick}>
              Edit Profile
          </Button>
      </div>
      <div className="p-4 md:p-6 pt-0 md:pt-0 space-y-4">
        {state.success && <p className="text-sm text-green-500 font-medium">Profile updated successfully</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Username</p>
            <p className="text-sm font-medium mt-1">{state.profile?.username || '—'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email Address</p>
            <p className="text-sm font-medium mt-1">{state.profile?.email || '—'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <p className="text-sm font-medium mt-1 capitalize">{state.profile?.role || 'User'}</p>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm 
            state={state} 
            onSuccess={() => setOpen(false)} 
            onCancel={() => setOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

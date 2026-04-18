import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useUserSettings } from "@/hooks/use-user-settings"

export function ProfileForm({ 
  state, 
  onSuccess,
  onCancel
}: { 
  state: ReturnType<typeof useUserSettings>,
  onSuccess: () => void,
  onCancel: () => void
}) {
  const { formData, setFormData, handleSubmit, saving, error } = state;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isSuccess = await handleSubmit(e);
    if (isSuccess) {
      onSuccess();
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-sm font-medium">Username</Label>
        <Input 
          id="username"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          placeholder="your username"
          disabled={saving}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
        <Input 
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="you@example.com"
          disabled={saving}
        />
      </div>
      
      {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

      <div className="pt-4 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

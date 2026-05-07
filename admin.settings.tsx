import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace preferences.</p>
      </div>
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Account</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Name</Label><Input defaultValue={user?.name} className="mt-1.5" /></div>
          <div><Label>Email</Label><Input defaultValue={user?.email} className="mt-1.5" /></div>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-semibold text-lg">Preferences</h2>
        <div className="flex items-center justify-between"><div><div className="font-medium">Email notifications</div><div className="text-xs text-muted-foreground">Get task & deadline alerts.</div></div><Switch defaultChecked /></div>
        <div className="flex items-center justify-between"><div><div className="font-medium">AI assistant suggestions</div><div className="text-xs text-muted-foreground">Surface smart task tips.</div></div><Switch defaultChecked /></div>
        <div className="flex items-center justify-between"><div><div className="font-medium">Weekly digest</div><div className="text-xs text-muted-foreground">Summary every Monday.</div></div><Switch /></div>
      </div>
      <Button onClick={() => toast.success("Settings saved")} className="bg-aurora text-primary-foreground shadow-glow">Save changes</Button>
    </div>
  );
}

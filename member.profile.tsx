import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/member/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const url = URL.createObjectURL(f);
      setAvatar(url);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Update your personal details.</p>
      </div>
      <div className="glass-card rounded-2xl p-6 flex items-center gap-5">
        <div className="relative">
          <Avatar className="h-20 w-20">
            {avatar && <AvatarImage src={avatar} />}
            <AvatarFallback className="bg-aurora text-primary-foreground text-xl">{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <label className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer shadow-glow">
            <Camera className="h-4 w-4" />
            <input type="file" accept="image/*" className="hidden" onChange={onPick} />
          </label>
        </div>
        <div>
          <div className="font-display font-semibold text-xl">{user?.name}</div>
          <div className="text-sm text-muted-foreground">{user?.email}</div>
        </div>
      </div>
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Full name</Label><Input defaultValue={user?.name} className="mt-1.5" /></div>
          <div><Label>Email</Label><Input defaultValue={user?.email} className="mt-1.5" /></div>
        </div>
        <div><Label>Bio</Label><Textarea rows={3} placeholder="A short bio about you..." className="mt-1.5" /></div>
      </div>
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-semibold">Change password</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Current</Label><Input type="password" className="mt-1.5" /></div>
          <div><Label>New password</Label><Input type="password" className="mt-1.5" /></div>
        </div>
      </div>
      <Button onClick={() => toast.success("Profile updated")} className="bg-aurora text-primary-foreground shadow-glow">Save</Button>
    </div>
  );
}

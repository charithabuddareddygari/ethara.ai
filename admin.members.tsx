import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Member } from "@/lib/mock-data";
import { useWorkspaceData } from "@/lib/workspace-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/members")({
  component: AdminMembers,
});

function AdminMembers() {
  const { members: list, addMember, removeMember } = useWorkspaceData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });

  const add = () => {
    if (!form.name || !form.email) return toast.error("All fields required");
    addMember({ name: form.name, email: form.email });
    setOpen(false); setForm({ name: "", email: "" });
    toast.success("Member added");
  };
  const remove = (id: string) => { removeMember(id); toast.success("Member removed"); };
  const verified = list.filter((m) => m.verified === true);
  const pending = list.filter((m) => m.verified !== true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            {list.length} total • {verified.length} verified • {pending.length} pending verification
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-aurora text-primary-foreground shadow-glow"><UserPlus className="h-4 w-4 mr-2" /> Add Member</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add team member</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={add} className="bg-aurora text-primary-foreground">Add</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((m) => (
          <div key={m.id} className="glass-card rounded-2xl p-5 hover:shadow-glow transition-all">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12"><AvatarFallback className="bg-aurora text-primary-foreground">{m.name.split(" ").map((s) => s[0]).join("")}</AvatarFallback></Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold">{m.name}</div>
                <div className="text-xs text-muted-foreground truncate">{m.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={m.verified === true ? "default" : "outline"} className="capitalize">
                  {m.verified === true ? "verified" : "pending"}
                </Badge>
                <Badge variant={m.role === "admin" ? "default" : "secondary"} className="capitalize">{m.role}</Badge>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{m.tasksAssigned} active tasks</span>
              <Button size="sm" variant="ghost" onClick={() => remove(m.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { type Project } from "@/lib/mock-data";
import { useWorkspaceData } from "@/lib/workspace-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/projects")({
  component: AdminProjects,
});

function AdminProjects() {
  const { projects: list, createProject, updateProject, deleteProject } = useWorkspaceData();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({ name: "", description: "", dueDate: "" });

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Name required");
    if (editing) {
      updateProject({ ...editing, ...form });
      toast.success("Project updated");
    } else {
      const created = await createProject({
        name: form.name,
        description: form.description,
        dueDate: form.dueDate || "2026-12-31",
      });
      if (!created) {
        toast.error("Unable to create project. Please try again.");
        return;
      }
      toast.success("Project created");
    }
    setOpen(false); setEditing(null); setForm({ name: "", description: "", dueDate: "" });
  };

  const remove = (id: string) => { deleteProject(id); toast.success("Deleted"); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Create, assign, and track projects across your team.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm({ name: "", description: "", dueDate: "" }); }} className="bg-aurora text-primary-foreground shadow-glow">
              <Plus className="h-4 w-4 mr-2" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Edit project" : "Create project"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div><Label>Due date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={submit} className="bg-aurora text-primary-foreground">{editing ? "Save" : "Create"}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => (
          <div key={p.id} className="glass-card rounded-2xl p-5 hover:shadow-glow transition-all">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-semibold text-lg">{p.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{p.description}</p>
              </div>
              <Badge variant={p.status === "completed" ? "default" : p.status === "on-hold" ? "secondary" : "outline"} className="capitalize">{p.status}</Badge>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-1.5"><span className="text-muted-foreground">Progress</span><span className="font-medium">{p.progress}%</span></div>
              <Progress value={p.progress} className="h-2" />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {p.members} members</span>
              <span>Due {p.dueDate}</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditing(p); setForm({ name: p.name, description: p.description, dueDate: p.dueDate }); setOpen(true); }}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="ghost" onClick={() => remove(p.id)} className="text-destructive hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

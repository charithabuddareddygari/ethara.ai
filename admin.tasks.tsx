import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Task } from "@/lib/mock-data";
import { useWorkspaceData } from "@/lib/workspace-store";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/tasks")({
  component: AdminTasks,
});

function AdminTasks() {
  const { tasks: list, projects, members, createTask, updateTaskStatus } = useWorkspaceData();
  const verifiedMembers = members.filter((m) => m.verified === true);
  const memberLoad = verifiedMembers
    .map((m) => ({
      ...m,
      openTasks: list.filter(
        (t) =>
          t.assignee.toLowerCase() === m.email.toLowerCase() &&
          (t.status === "pending" || t.status === "in-progress"),
      ).length,
    }))
    .sort((a, b) => a.openTasks - b.openTasks);
  const recommendedAssignee = memberLoad[0];
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    project: "",
    assignee: "",
    priority: "medium" as Task["priority"],
    dueDate: "",
  });

  const create = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    const created = await createTask({
      title: form.title,
      project: form.project || projects[0]?.name || "General",
      assignee: form.assignee || verifiedMembers[0]?.email || "unassigned@ethara.ai",
      priority: form.priority,
      dueDate: form.dueDate || "2026-12-31",
    });
    if (!created) {
      toast.error("Unable to create task. Please try again.");
      return;
    }
    setOpen(false);
    setForm({ title: "", project: "", assignee: "", priority: "medium", dueDate: "" });
    toast.success("Task created");
  };

  const updateStatus = (id: string, status: Task["status"]) => updateTaskStatus(id, status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">Assign and track tasks across all projects.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-aurora text-primary-foreground shadow-glow"><Plus className="h-4 w-4 mr-2" /> New Task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create task</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {recommendedAssignee && (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
                  <div className="text-sm font-medium">AI Assignment Recommendation</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Recommended member: {recommendedAssignee.name} ({recommendedAssignee.openTasks} open tasks)
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => setForm({ ...form, assignee: recommendedAssignee.email })}
                  >
                    Use Recommendation
                  </Button>
                </div>
              )}
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Project</Label>
                  <Select value={form.project} onValueChange={(v) => setForm({ ...form, project: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Assignee</Label>
                  <Select value={form.assignee} onValueChange={(v) => setForm({ ...form, assignee: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {verifiedMembers.map((m) => (
                        <SelectItem key={m.id} value={m.email}>
                          {m.name} ({m.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Task["priority"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Due date</Label><Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>
              </div>
            </div>
            <DialogFooter><Button onClick={create} className="bg-aurora text-primary-foreground">Create</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead><TableHead>Project</TableHead><TableHead>Assignee</TableHead>
              <TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Due</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-medium">{t.title}</TableCell>
                <TableCell className="text-muted-foreground">{t.project}</TableCell>
                <TableCell>
                  {members.find((m) => m.email?.toLowerCase() === t.assignee.toLowerCase())?.name ?? t.assignee}
                </TableCell>
                <TableCell><Badge variant={t.priority === "high" ? "destructive" : t.priority === "medium" ? "default" : "secondary"} className="capitalize">{t.priority}</Badge></TableCell>
                <TableCell>
                  <Select value={t.status} onValueChange={(v) => updateStatus(t.id, v as Task["status"])}>
                    <SelectTrigger className="w-36 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Not Completed</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground">{t.dueDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

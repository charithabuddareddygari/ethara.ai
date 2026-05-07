import { createFileRoute } from "@tanstack/react-router";
import { FolderKanban, ListTodo, CheckCircle2, Clock, Users, AlertTriangle, Bell, Brain, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TaskProgressChart, ProjectAnalyticsChart, ProductivityChart } from "@/components/dashboard/Charts";
import { useAuth } from "@/lib/auth";
import { useWorkspaceData } from "@/lib/workspace-store";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { user } = useAuth();
  const { projects, tasks, members, notifications } = useWorkspaceData();
  const completed = tasks.filter((t) => t.status === "completed").length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const overdue = tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "completed").length;
  const aiProductivityScore = Math.round((completed / Math.max(tasks.length, 1)) * 100);
  const monthlyProgress = Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / Math.max(projects.length, 1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Welcome back, {user?.name} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening across your workspace today.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Projects" value={projects.length} icon={FolderKanban} accent="primary" />
        <StatCard title="Total Tasks" value={tasks.length} icon={ListTodo} accent="accent" />
        <StatCard title="Completed Tasks" value={completed} icon={CheckCircle2} accent="chart-3" />
        <StatCard title="Pending Tasks" value={pending} icon={Clock} accent="chart-4" />
        <StatCard title="Overdue Tasks" value={overdue} icon={AlertTriangle} accent="primary" />
        <StatCard title="Team Members" value={members.length} icon={Users} accent="chart-5" />
        <StatCard title="AI Productivity Score" value={`${aiProductivityScore}%`} icon={Brain} accent="accent" />
        <StatCard title="Monthly Progress" value={`${monthlyProgress}%`} icon={TrendingUp} accent="chart-3" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <TaskProgressChart />
        <ProductivityChart />
      </div>
      <ProjectAnalyticsChart />

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-display font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
              <div className="h-9 w-9 rounded-full bg-aurora flex items-center justify-center shrink-0"><Bell className="h-4 w-4 text-primary-foreground" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{n.title}</div>
                <div className="text-sm text-muted-foreground">{n.message}</div>
              </div>
              <div className="text-xs text-muted-foreground">{n.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

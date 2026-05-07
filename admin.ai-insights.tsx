import { createFileRoute } from "@tanstack/react-router";
import { Lightbulb, AlertTriangle, Brain, TrendingUp } from "lucide-react";
import { useWorkspaceData } from "@/lib/workspace-store";

export const Route = createFileRoute("/_authenticated/admin/ai-insights")({
  component: AdminAiInsights,
});

function AdminAiInsights() {
  const { projects, tasks, members } = useWorkspaceData();
  const delayedTasks = tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== "completed");
  const completionRate = Math.round(
    (tasks.filter((t) => t.status === "completed").length / Math.max(tasks.length, 1)) * 100,
  );
  const verifiedMembers = members.filter((m) => m.verified === true && m.role === "member");
  const teamLoad = Math.round(tasks.length / Math.max(verifiedMembers.length, 1));
  const deadlineRisk = projects.filter((p) => p.progress < 50).length;
  const tasksByMember = verifiedMembers.map((m) => ({
    member: m,
    openTasks: tasks.filter(
      (t) =>
        t.assignee.toLowerCase() === m.email.toLowerCase() &&
        (t.status === "pending" || t.status === "in-progress"),
    ).length,
  }));
  const leastLoaded = [...tasksByMember].sort((a, b) => a.openTasks - b.openTasks)[0];
  const mostLoaded = [...tasksByMember].sort((a, b) => b.openTasks - a.openTasks)[0];
  const urgentPending = tasks
    .filter((t) => t.status !== "completed")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">AI Insights</h1>
        <p className="text-muted-foreground mt-1">Smart productivity analysis, alerts, and recommendations.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard icon={Brain} title="Productivity Analysis" value={`${completionRate}%`} note="Current completion rate" />
        <InsightCard icon={AlertTriangle} title="Delayed Task Alerts" value={delayedTasks.length} note="Tasks needing attention" />
        <InsightCard icon={TrendingUp} title="Deadline Prediction" value={`${100 - deadlineRisk * 12}%`} note="On-time confidence score" />
        <InsightCard icon={Lightbulb} title="Smart Suggestions" value={teamLoad} note="Avg tasks per member" />
      </div>

      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-display font-semibold mb-3">AI Recommendations</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            - Best member for next assignment:{" "}
            <span className="font-medium text-foreground">
              {leastLoaded ? `${leastLoaded.member.name} (${leastLoaded.openTasks} open tasks)` : "No verified members available"}
            </span>
          </li>
          <li>
            - Highest workload now:{" "}
            <span className="font-medium text-foreground">
              {mostLoaded ? `${mostLoaded.member.name} (${mostLoaded.openTasks} open tasks)` : "No workload data"}
            </span>
          </li>
          <li>- Projects below 50% progress: <span className="font-medium text-foreground">{deadlineRisk}</span></li>
          <li>
            - Next urgent tasks:{" "}
            <span className="font-medium text-foreground">
              {urgentPending.length > 0 ? urgentPending.map((t) => `${t.title} (${t.dueDate})`).join(", ") : "No pending urgent tasks"}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function InsightCard({
  icon: Icon,
  title,
  value,
  note,
}: {
  icon: typeof Brain;
  title: string;
  value: string | number;
  note: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 hover:shadow-glow transition-all">
      <div className="h-10 w-10 rounded-xl bg-aurora flex items-center justify-center mb-3">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
      <div className="text-sm text-muted-foreground">{title}</div>
      <div className="font-display text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{note}</div>
    </div>
  );
}

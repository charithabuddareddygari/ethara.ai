import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useWorkspaceData } from "@/lib/workspace-store";

const tooltipStyle = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)" },
};

export function TaskProgressChart() {
  const { tasks } = useWorkspaceData();
  const statusCount = tasks.reduce(
    (acc, task) => {
      if (task.status === "completed") acc.completed += 1;
      if (task.status === "pending" || task.status === "in-progress") acc.pending += 1;
      return acc;
    },
    { completed: 0, pending: 0 },
  );
  const taskProgressData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => ({
    day,
    completed: Math.max(0, Math.round((statusCount.completed * (idx + 1)) / 7)),
    pending: Math.max(0, Math.round((statusCount.pending * (7 - idx)) / 7)),
  }));

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-display font-semibold mb-4">Task Progress (last 7 days)</h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={taskProgressData}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.6} /><stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} /></linearGradient>
            <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.6} /><stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip {...tooltipStyle} />
          <Area type="monotone" dataKey="completed" stroke="var(--color-chart-1)" fill="url(#g1)" strokeWidth={2} />
          <Area type="monotone" dataKey="pending" stroke="var(--color-chart-2)" fill="url(#g2)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProjectAnalyticsChart() {
  const { projects } = useWorkspaceData();
  const projectAnalyticsData = projects.map((p) => ({
    name: p.name.split(" ")[0],
    progress: p.progress,
  }));

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-display font-semibold mb-4">Project Progress</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={projectAnalyticsData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="progress" fill="var(--color-chart-1)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProductivityChart() {
  const { tasks } = useWorkspaceData();
  const completed = tasks.filter((t) => t.status === "completed").length;
  const total = Math.max(tasks.length, 1);
  const productivity = Math.round((completed / total) * 100);
  const productivityData = [
    { week: "W1", productivity: Math.max(30, productivity - 22) },
    { week: "W2", productivity: Math.max(35, productivity - 15) },
    { week: "W3", productivity: Math.max(40, productivity - 10) },
    { week: "W4", productivity: Math.max(45, productivity - 6) },
    { week: "W5", productivity: Math.max(50, productivity - 3) },
    { week: "W6", productivity },
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-display font-semibold mb-4">Weekly Productivity</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={productivityData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--muted-foreground)" fontSize={12} />
          <Tooltip {...tooltipStyle} />
          <Line type="monotone" dataKey="productivity" stroke="var(--color-chart-2)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-chart-2)" }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

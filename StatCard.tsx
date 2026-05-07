import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  accent?: "primary" | "accent" | "chart-3" | "chart-4" | "chart-5";
}

export function StatCard({ title, value, icon: Icon, hint, accent = "primary" }: Props) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    accent: "bg-accent/15 text-accent",
    "chart-3": "bg-chart-3/15 text-chart-3",
    "chart-4": "bg-chart-4/15 text-chart-4",
    "chart-5": "bg-chart-5/15 text-chart-5",
  };
  return (
    <div className="glass-card rounded-2xl p-5 hover:shadow-glow hover:-translate-y-0.5 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="font-display text-3xl font-bold mt-1">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className={`h-11 w-11 rounded-xl ${colorMap[accent]} flex items-center justify-center`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

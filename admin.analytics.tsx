import { createFileRoute } from "@tanstack/react-router";
import { TaskProgressChart, ProjectAnalyticsChart, ProductivityChart } from "@/components/dashboard/Charts";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: () => (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights powered by your team's activity.</p>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <TaskProgressChart />
        <ProductivityChart />
      </div>
      <ProjectAnalyticsChart />
    </div>
  ),
});

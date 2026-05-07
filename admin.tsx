import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LayoutDashboard, FolderKanban, ListTodo, Users, BarChart3, Settings, Brain, FileText } from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/dashboard/DashboardShell";
import { getStoredUser } from "@/lib/auth";

const items: NavItem[] = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "AI Insights", url: "/admin/ai-insights", icon: Brain },
  { title: "Projects", url: "/admin/projects", icon: FolderKanban },
  { title: "Tasks", url: "/admin/tasks", icon: ListTodo },
  { title: "Team Members", url: "/admin/members", icon: Users },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Reports", url: "/admin/reports", icon: FileText },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => {
    const u = getStoredUser();
    if (u && u.role !== "admin") throw redirect({ to: "/member" });
  },
  component: () => (
    <DashboardShell items={items} brandHref="/admin">
      <Outlet />
    </DashboardShell>
  ),
});

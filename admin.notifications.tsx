import { createFileRoute } from "@tanstack/react-router";
import { Bell, Calendar, Users, Trash2 } from "lucide-react";
import { useWorkspaceData } from "@/lib/workspace-store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const iconFor = (t: string) => (t === "deadline" ? Calendar : t === "team" ? Users : Bell);

export const Route = createFileRoute("/_authenticated/admin/notifications")({
  component: AdminNotifications,
});

function AdminNotifications() {
  const { notifications, deleteNotification } = useWorkspaceData();
  return (
  <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-1">Recent updates from across your workspace.</p>
      </div>
      <div className="glass-card rounded-2xl divide-y divide-border/50">
        {notifications.map((n) => {
          const Icon = iconFor(n.type);
          return (
            <div key={n.id} className="flex items-start gap-4 p-5 hover:bg-muted/20 transition-colors">
              <div className="h-10 w-10 rounded-full bg-aurora flex items-center justify-center shrink-0"><Icon className="h-4 w-4 text-primary-foreground" /></div>
              <div className="flex-1">
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{n.message}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">{n.time}</div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    deleteNotification(n.id);
                    toast.success("Notification deleted");
                  }}
                  title="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

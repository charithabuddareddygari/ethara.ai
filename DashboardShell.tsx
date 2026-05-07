import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Search, Sparkles, Trash2, type LucideIcon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceData } from "@/lib/workspace-store";
import logoWhiteText from "@/assets/logo-white-text.png";
import { toast } from "sonner";

export interface NavItem { title: string; url: string; icon: LucideIcon }

function AppSidebar({ items, brandHref }: { items: NavItem[]; brandHref: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 flex items-center gap-2">
          <Link to={brandHref} className="flex items-center gap-2">
            {!collapsed ? (
              <img src={logoWhiteText} alt="Ethara.AI" className="h-9 w-auto" />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-aurora flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </Link>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = path === item.url || (item.url !== brandHref && path.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={active}>
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function TopBar() {
  const { user, logout } = useAuth();
  const { notifications, deleteNotification } = useWorkspaceData();
  const navigate = useNavigate();
  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-border/50 backdrop-blur-xl bg-background/70 flex items-center px-4 gap-3">
      <SidebarTrigger />
      <div className="relative max-w-sm flex-1 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search anything..." className="pl-9 bg-muted/30" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground">{notifications.length}</Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.slice(0, 4).map((n) => (
              <DropdownMenuItem key={n.id} className="py-2">
                <div className="flex items-start gap-2 w-full">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{n.title}</div>
                    <div className="text-xs text-muted-foreground">{n.message}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const deleted = await deleteNotification(n.id);
                      if (!deleted) {
                        toast.error("Unable to delete notification");
                        return;
                      }
                      toast.success("Notification deleted");
                    }}
                    title="Delete notification"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:bg-muted/40 rounded-full p-1 pr-3 transition-colors">
              <Avatar className="h-8 w-8"><AvatarFallback className="bg-aurora text-primary-foreground text-xs">{initials}</AvatarFallback></Avatar>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-medium leading-tight">{user?.name}</div>
                <div className="text-[11px] text-muted-foreground capitalize leading-tight">{user?.role}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/" }); }}>
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function DashboardShell({ items, brandHref, children }: { items: NavItem[]; brandHref: string; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar items={items} brandHref={brandHref} />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 lg:p-8 bg-hero relative overflow-x-hidden">
            <div className="relative animate-fade-up">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

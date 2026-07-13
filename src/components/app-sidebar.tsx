import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Video, BarChart3, Sparkles } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const items = [
  { title: "Setup Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Interview Room", url: "/interview", icon: Video },
  { title: "Performance Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="font-display text-lg font-bold leading-none">VibeCoach</p>
            <p className="mt-1 text-xs text-muted-foreground">AI Interview Prep</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
            JD
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Jordan Doe</p>
            <p className="truncate text-xs text-muted-foreground">Pro plan</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

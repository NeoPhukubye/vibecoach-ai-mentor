import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Video, BarChart3, Sparkles, LogOut, LogIn, Hand } from "lucide-react";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useSignLanguage } from "@/lib/sign-language-context";
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
import { Button } from "@/components/ui/button";

const items = [
  { title: "Setup Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Interview Room", url: "/interview", icon: Video },
  { title: "Performance Analytics", url: "/analytics", icon: BarChart3 },
];

export function AppSidebar({ onOpenAccessibility }: { onOpenAccessibility?: () => void }) {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const isActive = (path: string) => currentPath === path;
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { settings, toggleEnabled } = useSignLanguage();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? "Guest";
  const initials = (displayName as string)
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

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

        <SidebarGroup>
          <SidebarGroupLabel>Accessibility</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Sign Language Mode"
                  onClick={onOpenAccessibility}
                  className="flex items-center gap-3"
                >
                  <Hand className={`h-4 w-4 shrink-0 ${settings.enabled ? "text-primary" : ""}`} />
                  <span className="truncate">Sign Language</span>
                  {settings.enabled && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {user ? (
          <div className="space-y-3 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/20 text-sm font-semibold text-accent">
                {initials || "U"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">Signed in</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        ) : (
          <Button
            className="w-full gradient-primary group-data-[collapsible=icon]:hidden"
            size="sm"
            onClick={() => navigate({ to: "/auth" })}
          >
            <LogIn className="h-4 w-4" />
            Sign in
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PieChart, 
  Wallet, 
  Brain, 
  Mic, 
  Settings, 
  HelpCircle,
  TrendingUp,
  Target,
  BarChart3,
  CreditCard,
  Shield,
  Bell
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const mainNavItems = [
  { 
    title: 'Dashboard', 
    url: '/dashboard', 
    icon: LayoutDashboard,
    badge: '4'
  },
  { 
    title: 'Portfolio', 
    url: '/portfolio', 
    icon: PieChart,
    badge: 'New'
  },
  { 
    title: 'Budget', 
    url: '/budget', 
    icon: Wallet
  },
  { 
    title: 'Expenses', 
    url: '/expense-analytics', 
    icon: CreditCard
  },
  { 
    title: 'Goals', 
    url: '/goals', 
    icon: Target
  },
  { 
    title: 'Health Score', 
    url: '/health', 
    icon: Shield,
    badge: 'B+'
  },
];

const toolsNavItems = [
  { 
    title: 'Voice Assistant', 
    url: '/voice', 
    icon: Mic,
    badge: 'AI'
  },
  { 
    title: 'Knowledge Hub', 
    url: '/knowledge', 
    icon: Brain
  },
  { 
    title: 'Advisory', 
    url: '/advisory', 
    icon: HelpCircle
  },
];

const settingsNavItems = [
  { 
    title: 'Settings', 
    url: '/settings', 
    icon: Settings
  },
  { 
    title: 'Security', 
    url: '/security', 
    icon: Shield
  },
  { 
    title: 'Help', 
    url: '/help', 
    icon: HelpCircle
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  
  const getNavClassName = ({ isActive }: { isActive: boolean }) => 
    isActive 
      ? 'bg-gradient-primary text-foreground shadow-glow font-medium' 
      : 'text-sidebar-foreground hover:bg-muted/80 hover:text-foreground transition-colors';

  return (
    <Sidebar 
      className={collapsed ? "w-16" : "w-64"}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border/40 p-4">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 dark:text-white text-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gradient">Creda</h2>
              <p className="text-xs text-muted-foreground">AI Finance Assistant</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <TrendingUp className="w-5 h-5 dark:text-white text-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg">
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant={isActive(item.url) ? 'secondary' : 'outline'} 
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg">
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
                      {!collapsed && (
                        <div className="flex items-center justify-between flex-1">
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant={isActive(item.url) ? 'secondary' : 'outline'} 
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'sr-only' : ''}>
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild size="lg">
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className={`${collapsed ? 'mx-auto' : 'mr-3'} h-5 w-5`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        {!collapsed && (
          <div className="space-y-3">
            <div className="p-3 bg-gradient-card rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">Pro Tips</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Say "Hey Creda" to activate voice commands instantly!
              </p>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Mic className="h-4 w-4 mr-2" />
              Voice Assistant
            </Button>
          </div>
        )}
        {collapsed && (
          <Button variant="outline" size="icon" className="w-8 h-8 mx-auto">
            <Mic className="h-4 w-4" />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
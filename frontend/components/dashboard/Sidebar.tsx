'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/components/theme-provider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BarChart3,
  Palette,
  UserCircle,
  LogOut,
  Moon,
  Sun,
  Receipt,
} from 'lucide-react';

const BUSINESS_NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, exact: true },
  { title: 'Plans', href: '/dashboard/plans', icon: CreditCard },
  { title: 'Customers', href: '/dashboard/customers', icon: Users },
  { title: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { title: 'Customization', href: '/dashboard/customize', icon: Palette },
];

const CUSTOMER_NAV_ITEMS = [
  { title: 'Dashboard', href: '/dashboard/overview', icon: LayoutDashboard },
  { title: 'Subscriptions', href: '/dashboard/subscriptions', icon: CreditCard },
  { title: 'Billing', href: '/dashboard/billing', icon: Receipt },
  { title: 'Analytics', href: '/dashboard/user-analytics', icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = user?.role === 'customer' ? CUSTOMER_NAV_ITEMS : BUSINESS_NAV_ITEMS;
  const settingsHref = user?.role === 'business' ? '/dashboard/profile' : '/dashboard/settings';

  const isActive = (item: (typeof BUSINESS_NAV_ITEMS)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm">
            S
          </div>
          <span className="text-base font-semibold text-sidebar-foreground truncate group-data-[collapsible=icon]:hidden">
            SubDesk
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item)}
                    tooltip={item.title}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={user?.email || 'User'} className="cursor-default">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20 text-sidebar-primary text-[10px] font-bold uppercase">
                {user?.username?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-medium text-sidebar-foreground truncate">
                  {user?.username || 'User'}
                </span>
                <span className="text-[10px] text-sidebar-foreground/60 truncate">
                  {user?.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              onClick={toggleTheme}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === settingsHref}
              tooltip="Settings"
            >
              <Link href={settingsHref}>
                <UserCircle className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

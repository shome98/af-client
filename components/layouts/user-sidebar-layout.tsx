'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  RiDashboardLine,
  RiDatabase2Line,
  RiNoCreditCardLine,
  RiUserLine,
  RiLogoutCircleLine,
  RiAddCircleLine,
  RiPriceTag3Line,
  RiBox3Line,
  RiMoonLine,
  RiSunLine,
  RiCoupon3Line,
  RiUserSettingsLine,
  RiMoneyDollarCircleLine,
} from '@remixicon/react';

import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logoutUser } from '@/lib/store/auth-store';
import { cn } from '@/lib/utils';
import { USER_ROUTES, PUBLIC_ROUTES, ADMIN_ROUTES } from '@/constants/routes';
import { useTheme } from 'next-themes';

const userNavItems = [
  {
    title: 'Dashboard',
    href: USER_ROUTES.DASHBOARD,
    icon: RiDashboardLine,
  },
  {
    title: 'My APIs',
    href: USER_ROUTES.APIS,
    icon: RiDatabase2Line,
  },
  {
    title: 'Create API',
    href: USER_ROUTES.CREATE_API,
    icon: RiAddCircleLine,
  },
  {
    title: 'My Subscriptions',
    href: USER_ROUTES.SUBSCRIPTION,
    icon: RiNoCreditCardLine,
  },
  {
    title: 'Pricing',
    href: PUBLIC_ROUTES.PRICING,
    icon: RiPriceTag3Line,
  },
  {
    title: 'My Profile',
    href: USER_ROUTES.PROFILE,
    icon: RiUserLine,
  },
];

function UserSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group-data-[collapsible=icon]:p-0!"
            >
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <RiBox3Line className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ApiHub</span>
                  <span className="truncate text-xs text-muted-foreground">
                    API Factory
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={
                      pathname === item.href ||
                      pathname.startsWith(item.href + '/')
                    }
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {user?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin Controls</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="User Controls"
                    isActive={pathname === ADMIN_ROUTES.DASHBOARD}
                  >
                    <Link href={ADMIN_ROUTES.DASHBOARD}>
                      <RiDashboardLine className="size-4" />
                      <span>User Controls</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Tier Management"
                    isActive={pathname.startsWith(ADMIN_ROUTES.TIERS)}
                  >
                    <Link href={ADMIN_ROUTES.TIERS}>
                      <RiPriceTag3Line className="size-4" />
                      <span>Tier Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Discount Management"
                    isActive={pathname.startsWith(ADMIN_ROUTES.DISCOUNTS)}
                  >
                    <Link href={ADMIN_ROUTES.DISCOUNTS}>
                      <RiCoupon3Line className="size-4" />
                      <span>Discount Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Subscription Management"
                    isActive={pathname.startsWith(ADMIN_ROUTES.SUBSCRIPTIONS)}
                  >
                    <Link href={ADMIN_ROUTES.SUBSCRIPTIONS}>
                      <RiUserSettingsLine className="size-4" />
                      <span>Subscription Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip="Payment Management"
                    isActive={pathname.startsWith(ADMIN_ROUTES.PAYMENTS)}
                  >
                    <Link href={ADMIN_ROUTES.PAYMENTS}>
                      <RiMoneyDollarCircleLine className="size-4" />
                      <span>Payment Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="group-data-[collapsible=icon]:p-0!"
            >
              <div className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <span className="text-xs font-medium">
                    {getInitials(user?.name || user?.email || 'U')}
                  </span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {user?.name || user?.email}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Toggle Theme"
              onClick={toggleTheme}
            >
              <div className="flex items-center cursor-pointer">
                {theme === 'dark' ? (
                  <RiSunLine className="size-4" />
                ) : (
                  <RiMoonLine className="size-4" />
                )}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip="Logout"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <div className="flex items-center cursor-pointer">
                <RiLogoutCircleLine className="size-4" />
                <span>Logout</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

interface UserLayoutProps {
  children: React.ReactNode;
}

export function UserSidebarLayout({ children }: UserLayoutProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <UserSidebar />
        <SidebarInset className="bg-background">
          <header className="flex h-14 items-center gap-4 px-6">
            <SidebarTrigger />
          </header>
          <main className="flex-1 px-6 pb-6">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}

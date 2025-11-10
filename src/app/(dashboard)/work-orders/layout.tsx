"use client";

import { usePathname, useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, List, Calendar, CalendarClock } from 'lucide-react';
import type { JSX } from 'react';

interface WorkOrdersLayoutProps {
  children: React.ReactNode;
}

type TabValue = 'dashboard' | 'list' | 'calendar' | 'schedule';

/**
 * Work Orders Layout
 * Provides compact tab navigation for work order views
 * Follows Next.js App Router patterns and SOLID principles
 */
export default function WorkOrdersLayout({
  children,
}: WorkOrdersLayoutProps): JSX.Element {
  const pathname = usePathname();
  const router = useRouter();

  /**
   * Determine active tab based on current path
   * @returns Active tab value or null if not on main view
   */
  const getActiveTab = (): TabValue | null => {
    if (pathname === '/work-orders') return 'dashboard';
    if (pathname === '/work-orders/list') return 'list';
    if (pathname === '/work-orders/calendar') return 'calendar';
    if (pathname === '/work-orders/schedule') return 'schedule';
    // For other routes like /work-orders/[id], /work-orders/new, etc, don't show tabs
    return null;
  };

  const activeTab = getActiveTab();

  // Only show tabs for main work order views
  const showTabs = activeTab !== null;

  /**
   * Handle tab change navigation
   * @param value - Selected tab value
   */
  const handleTabChange = (value: string): void => {
    const routes: Record<TabValue, string> = {
      dashboard: '/work-orders',
      list: '/work-orders/list',
      calendar: '/work-orders/calendar',
      schedule: '/work-orders/schedule',
    };

    const route = routes[value as TabValue];
    if (route) {
      router.push(route);
    }
  };

  return (
    <div className="space-y-3">
      {showTabs && (
        <div className="border-b -mx-3 px-3 md:-mx-4 md:px-4">
          <Tabs value={activeTab || undefined} onValueChange={handleTabChange}>
            <TabsList className="h-8 bg-transparent border-b-0 w-full justify-start rounded-none p-0 gap-0.5">
              <TabsTrigger
                value="dashboard"
                className="gap-1 px-2.5 py-1 border-0 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:shadow-none rounded-none text-xs h-8"
              >
                <LayoutDashboard className="h-3 w-3" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="gap-1 px-2.5 py-1 border-0 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:shadow-none rounded-none text-xs h-8"
              >
                <List className="h-3 w-3" />
                <span className="hidden sm:inline">Lista</span>
              </TabsTrigger>
              <TabsTrigger
                value="calendar"
                className="gap-1 px-2.5 py-1 border-0 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:shadow-none rounded-none text-xs h-8"
              >
                <Calendar className="h-3 w-3" />
                <span className="hidden sm:inline">Calendario</span>
              </TabsTrigger>
              <TabsTrigger
                value="schedule"
                className="gap-1 px-2.5 py-1 border-0 border-b-2 border-transparent data-[state=active]:border-b-primary data-[state=active]:shadow-none rounded-none text-xs h-8"
              >
                <CalendarClock className="h-3 w-3" />
                <span className="hidden sm:inline">Programaciones</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}

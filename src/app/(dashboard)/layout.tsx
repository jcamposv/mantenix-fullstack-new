import { AppSidebar } from '@/components/app-sidebar';
import { DynamicBreadcrumbs } from '@/components/dynamic-breadcrumbs';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { PWABrandingUpdater } from '@/components/pwa-branding-updater';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUserWithRole } from '@/lib/auth-utils';
import type { CompanyBranding } from '@/types/branding';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

/**
 * Dashboard Layout
 * Main layout for authenticated dashboard pages
 * Optimized for minimal vertical space usage
 * Follows Next.js App Router Server Component patterns
 */

/**
 * Fetches company branding based on subdomain
 * Server-side function that runs on each request
 *
 * @returns Company branding or null if not found
 */
async function getCompanyBranding(): Promise<CompanyBranding | null> {
  try {
    const headersList = await headers();
    const host = headersList.get('host') || '';
    const subdomain = host.split('.')[0];

    // Only fetch if we have a subdomain (not just localhost or main domain)
    if (subdomain && subdomain !== 'localhost' && subdomain !== host) {
      const company = await prisma.company.findUnique({
        where: {
          subdomain: subdomain,
          isActive: true,
        },
        select: {
          name: true,
          logo: true,
          logoSmall: true,
          primaryColor: true,
          secondaryColor: true,
          backgroundColor: true,
        },
      });

      return company;
    }

    return null;
  } catch (error) {
    console.warn('Failed to fetch company branding:', error);
    return null;
  }
}

interface UserPermissions {
  isSuperAdmin: boolean;
  isGroupAdmin: boolean;
  isCompanyAdmin: boolean;
}

interface ServerSideData {
  user: Awaited<ReturnType<typeof getCurrentUserWithRole>>;
  availableCompanies: Array<{
    id: string;
    name: string;
    subdomain: string | null;
    logo: string | null;
    isActive: boolean;
  }> | null;
  companyFeatures: Array<{
    module: string;
    isEnabled: boolean;
  }> | null;
  userPermissions: UserPermissions;
}

/**
 * Fetches all server-side data needed for the dashboard layout
 * Includes user data, permissions, available companies, and features
 *
 * @returns Server-side data object
 */
async function getServerSideData(): Promise<ServerSideData> {
  try {
    const user = await getCurrentUserWithRole();

    if (!user) {
      return {
        user: null,
        availableCompanies: null,
        companyFeatures: null,
        userPermissions: {
          isSuperAdmin: false,
          isGroupAdmin: false,
          isCompanyAdmin: false,
        },
      };
    }

    const userPermissions: UserPermissions = {
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      isGroupAdmin: user.role === 'ADMIN_GRUPO',
      isCompanyAdmin: user.role === 'ADMIN_EMPRESA',
    };

    // Fetch companies based on user role
    let availableCompanies = null;
    if (userPermissions.isSuperAdmin) {
      // SUPER_ADMIN can see all companies
      availableCompanies = await prisma.company.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          subdomain: true,
          logo: true,
          isActive: true,
        },
        orderBy: {
          name: 'asc',
        },
      });
    } else if (userPermissions.isGroupAdmin) {
      // ADMIN_GRUPO can see companies in their group
      // First, try to get companyGroupId from user, or from their company
      let groupId = user.companyGroupId;

      if (!groupId && user.companyId) {
        // If user doesn't have companyGroupId directly, get it from their company
        const userCompany = await prisma.company.findUnique({
          where: { id: user.companyId },
          select: { companyGroupId: true },
        });
        groupId = userCompany?.companyGroupId ?? null;
      }

      if (groupId) {
        availableCompanies = await prisma.company.findMany({
          where: {
            companyGroupId: groupId,
            isActive: true,
          },
          select: {
            id: true,
            name: true,
            subdomain: true,
            logo: true,
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
        });
      }
    }

    // Fetch company features for the user's company
    let companyFeatures = null;
    const companyId = user.companyId || user.company?.id;
    if (companyId) {
      companyFeatures = await prisma.companyFeature.findMany({
        where: {
          companyId: companyId,
          isEnabled: true,
        },
        select: {
          module: true,
          isEnabled: true,
        },
      });
    }

    return {
      user,
      availableCompanies,
      companyFeatures,
      userPermissions,
    };
  } catch (error) {
    console.warn('Failed to fetch server side data:', error);
    return {
      user: null,
      availableCompanies: null,
      companyFeatures: null,
      userPermissions: {
        isSuperAdmin: false,
        isGroupAdmin: false,
        isCompanyAdmin: false,
      },
    };
  }
}

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Main Dashboard Layout Component
 * Server Component that provides the layout structure for all dashboard pages
 * Optimized for minimal vertical space while maintaining functionality
 */
export default async function DashboardLayout({
  children,
}: DashboardLayoutProps): Promise<JSX.Element> {
  const companyBranding = await getCompanyBranding();
  const { user, availableCompanies, companyFeatures, userPermissions } =
    await getServerSideData();

  return (
    <SidebarProvider>
      <AppSidebar
        companyBranding={companyBranding}
        availableCompanies={availableCompanies}
        serverUser={user}
        userPermissions={userPermissions}
        companyFeatures={companyFeatures}
      />
      <SidebarInset>
        {/* Optimized header - reduced from h-16 to h-12 for space efficiency */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-10">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger className="-ml-1 h-7 w-7" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumbs />
          </div>
        </header>
        {/* Optimized content container - reduced padding for more space */}
        <div className="flex flex-1 flex-col gap-3 p-3 pt-3">
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-lg md:min-h-min">
            <div className="h-full bg-white rounded-lg p-3 md:p-4">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
      <PWABrandingUpdater />
      <Toaster />
    </SidebarProvider>
  );
}

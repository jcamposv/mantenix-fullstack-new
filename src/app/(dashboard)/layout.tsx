import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { PWABrandingUpdater } from "@/components/pwa-branding-updater"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getCurrentUserWithRole } from "@/lib/auth-utils"
import type { CompanyBranding } from "@/types/branding"

export const dynamic = 'force-dynamic'

async function getCompanyBranding(): Promise<CompanyBranding | null> {
  try {
    const headersList = await headers()
    const host = headersList.get('host') || ''
    const subdomain = host.split('.')[0]
    
    // Only fetch if we have a subdomain (not just localhost or main domain)
    if (subdomain && subdomain !== 'localhost' && subdomain !== host) {
      const company = await prisma.company.findUnique({
        where: { 
          subdomain: subdomain,
          isActive: true 
        },
        select: {
          name: true,
          logo: true,
          logoSmall: true,
          primaryColor: true,
          secondaryColor: true,
          backgroundColor: true,
        }
      })

      return company
    }
    
    return null
  } catch (error) {
    console.warn('Failed to fetch company branding:', error)
    return null
  }
}

async function getServerSideData() {
  try {
    const user = await getCurrentUserWithRole()

    if (!user) {
      return {
        user: null,
        availableCompanies: null,
        companyFeatures: null,
        userPermissions: {
          isSuperAdmin: false,
          isGroupAdmin: false,
          isCompanyAdmin: false
        }
      }
    }

    const userPermissions = {
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      isGroupAdmin: user.role === 'ADMIN_GRUPO',
      isCompanyAdmin: user.role === 'ADMIN_EMPRESA'
    }

    // Fetch companies based on user role
    let availableCompanies = null
    if (userPermissions.isSuperAdmin) {
      // SUPER_ADMIN can see all companies
      availableCompanies = await prisma.company.findMany({
        where: {
          isActive: true
        },
        select: {
          id: true,
          name: true,
          subdomain: true,
          logo: true,
          isActive: true,
        },
        orderBy: {
          name: 'asc'
        }
      })
    } else if (userPermissions.isGroupAdmin) {
      // ADMIN_GRUPO can see companies in their group
      // First, try to get companyGroupId from user, or from their company
      let groupId = user.companyGroupId

      if (!groupId && user.companyId) {
        // If user doesn't have companyGroupId directly, get it from their company
        const userCompany = await prisma.company.findUnique({
          where: { id: user.companyId },
          select: { companyGroupId: true }
        })
        groupId = userCompany?.companyGroupId ?? null
      }

      if (groupId) {
        availableCompanies = await prisma.company.findMany({
          where: {
            companyGroupId: groupId,
            isActive: true
          },
          select: {
            id: true,
            name: true,
            subdomain: true,
            logo: true,
            isActive: true,
          },
          orderBy: {
            name: 'asc'
          }
        })
      }
    }

    // Fetch company features for the user's company
    let companyFeatures = null
    const companyId = user.companyId || user.company?.id
    if (companyId) {
      companyFeatures = await prisma.companyFeature.findMany({
        where: {
          companyId: companyId,
          isEnabled: true
        },
        select: {
          module: true,
          isEnabled: true
        }
      })
    }

    return {
      user,
      availableCompanies,
      companyFeatures,
      userPermissions
    }
  } catch (error) {
    console.warn('Failed to fetch server side data:', error)
    return {
      user: null,
      availableCompanies: null,
      companyFeatures: null,
      userPermissions: {
        isSuperAdmin: false,
        isGroupAdmin: false,
        isCompanyAdmin: false
      }
    }
  }
}

export default async function Page({ children }: { children: React.ReactNode }) {
  const companyBranding = await getCompanyBranding()
  const { user, availableCompanies, companyFeatures, userPermissions } = await getServerSideData()

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
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <DynamicBreadcrumbs />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" >
            <div className="h-full bg-white rounded-xl p-4">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
      <PWABrandingUpdater />
      <Toaster />
    </SidebarProvider>
  )
}

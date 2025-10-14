import { AppSidebar } from "@/components/app-sidebar"
import { DynamicBreadcrumbs } from "@/components/dynamic-breadcrumbs"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getCurrentUserWithRole } from "@/lib/auth-utils"
import type { CompanyBranding } from "@/types/branding"

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
        userPermissions: {
          isSuperAdmin: false,
          isCompanyAdmin: false
        }
      }
    }

    const userPermissions = {
      isSuperAdmin: user.role === 'SUPER_ADMIN',
      isCompanyAdmin: user.role === 'ADMIN_EMPRESA'
    }
    
    // Only fetch companies for super admin users
    let availableCompanies = null
    if (userPermissions.isSuperAdmin) {
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
    }
    
    return {
      user,
      availableCompanies,
      userPermissions
    }
  } catch (error) {
    console.warn('Failed to fetch server side data:', error)
    return {
      user: null,
      availableCompanies: null,
      userPermissions: {
        isSuperAdmin: false,
        isCompanyAdmin: false
      }
    }
  }
}

export default async function Page({ children }: { children: React.ReactNode }) {
  const companyBranding = await getCompanyBranding()
  const { user, availableCompanies, userPermissions } = await getServerSideData()
  
  return (
    <SidebarProvider>
      <AppSidebar 
        companyBranding={companyBranding} 
        availableCompanies={availableCompanies}
        serverUser={user}
        userPermissions={userPermissions}
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
      <Toaster />
    </SidebarProvider>
  )
}

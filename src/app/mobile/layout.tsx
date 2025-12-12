import { getCurrentUserWithRole } from "@/lib/auth-utils"
import { Toaster } from "@/components/ui/sonner"
import { PWABrandingUpdater } from "@/components/pwa-branding-updater"
import { PWAProvider } from "@/components/pwa/pwa-provider"
import { redirect } from "next/navigation"
import { MobileFooter, MobileFooterContent } from "@/components/mobile/mobile-footer"
import { MobileNavigation } from "@/components/mobile/mobile-nav-server"
import { MobileHeader } from "@/components/mobile/mobile-header"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { CompanyBranding } from "@/types/branding"
import type { AuthenticatedSession } from "@/types/auth.types"
import { getUserPermissions } from "@/server/helpers/permission-utils"
import { auth } from "@/lib/auth"

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

export default async function FieldLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Obtener branding de la empresa
  const companyBranding = await getCompanyBranding()

  // Get session first
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Verificar autenticación y roles permitidos para field
  const user = await getCurrentUserWithRole()

  if (!user || !user.role) {
    redirect('/auth/signin')
  }

  // Check if user has MOBILE interface type access
  const interfaceType = (user as { roleInterfaceType?: 'MOBILE' | 'DASHBOARD' | 'BOTH' }).roleInterfaceType
  if (interfaceType === 'DASHBOARD') {
    redirect('/dashboard')
  }

  // Get user permissions for navigation
  // Construct AuthenticatedSession from user object
  const authenticatedSession = { user: user as AuthenticatedSession['user'] }
  const permissions = await getUserPermissions(authenticatedSession)
  const isExternalUser = !!user.clientCompanyId

  return (
    <PWAProvider>
      <div className="min-h-screen flex flex-col bg-background">
        {/* Header móvil moderno */}
        <MobileHeader companyBranding={companyBranding} />

        {/* Contenido principal con padding bottom para el footer sticky */}
        <main className="flex-1 p-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
          {children}
        </main>

        {/* Navigation bottom bar sticky para móvil */}
        <MobileFooter>
          <MobileFooterContent>
            <MobileNavigation permissions={permissions} isExternalUser={isExternalUser} />
          </MobileFooterContent>
        </MobileFooter>

        <PWABrandingUpdater />
        <Toaster />
      </div>
    </PWAProvider>
  )
}
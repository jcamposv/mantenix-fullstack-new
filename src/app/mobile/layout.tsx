import { getCurrentUserWithRole } from "@/lib/auth-utils"
import { Toaster } from "@/components/ui/sonner"
import { PWABrandingUpdater } from "@/components/pwa-branding-updater"
import { redirect } from "next/navigation"
import { MobileFooter, MobileFooterContent } from "@/components/mobile/mobile-footer"
import { MobileNavigation } from "@/components/mobile/mobile-nav-server"
import { MobileHeader } from "@/components/mobile/mobile-header"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
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

export default async function FieldLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Obtener branding de la empresa
  const companyBranding = await getCompanyBranding()
  
  // Verificar autenticación y roles permitidos para field
  const user = await getCurrentUserWithRole()
  
  if (!user || !user.role) {
    redirect('/auth/signin')
  }

  // Solo ciertos roles pueden acceder a la interfaz field (mobile)
  const allowedRoles = [
    'OPERARIO', // Operario interno de planta
    'CLIENTE_OPERARIO',
    'CLIENTE_ADMIN_SEDE',
    'CLIENTE_ADMIN_GENERAL',
    'TECNICO',
    'SUPERVISOR',
    'ADMIN_EMPRESA',
    'SUPER_ADMIN'
  ]

  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard')
  }

  const externalUserRoles = ['CLIENTE_OPERARIO', 'CLIENTE_ADMIN_SEDE']
  if (externalUserRoles.includes(user.role)) {
    if (!user.siteId) {
      redirect('/dashboard?error=no-site-assigned')
    }
  }

  return (
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
          <MobileNavigation userRole={user.role} />
        </MobileFooterContent>
      </MobileFooter>

      <PWABrandingUpdater />
      <Toaster />
    </div>
  )
}
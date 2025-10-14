import { headers } from "next/headers"
import { getCurrentUserWithRole } from "@/lib/auth-utils"
import { Toaster } from "@/components/ui/sonner"
import { redirect } from "next/navigation"
import { MobileFooter, MobileFooterContent } from "@/components/mobile/mobile-footer"
import { MobileNavigation } from "@/components/mobile/mobile-nav"
import { MobileHeader } from "@/components/mobile/mobile-header"

export default async function FieldLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verificar autenticación y roles permitidos para field
  const user = await getCurrentUserWithRole()
  
  if (!user || !user.role) {
    redirect('/auth/signin')
  }

  // Solo ciertos roles pueden acceder a la interfaz field (mobile)
  const allowedRoles = [
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

  // Verificar que tenga sede asignada (excepto super admin y admin empresa)
  if (!['SUPER_ADMIN', 'ADMIN_EMPRESA', 'CLIENTE_ADMIN_GENERAL'].includes(user.role)) {
    if (!user.siteId) {
      redirect('/dashboard?error=no-site-assigned')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header móvil moderno */}
      <MobileHeader />

      {/* Contenido principal con padding bottom para el footer sticky */}
      <main className="flex-1 p-4 pb-[calc(5rem+env(safe-area-inset-bottom,0px))]">
        {children}
      </main>

      {/* Navigation bottom bar sticky para móvil */}
      <MobileFooter>
        <MobileFooterContent>
          <MobileNavigation />
        </MobileFooterContent>
      </MobileFooter>

      <Toaster />
    </div>
  )
}
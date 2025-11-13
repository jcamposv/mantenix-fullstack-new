"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Mobile Home - Router principal que redirige según rol
 *
 * Flujo de redirección por rol:
 * - OPERARIO → /mobile/assets (dashboard de máquinas)
 * - TECNICO/SUPERVISOR/JEFE_MANTENIMIENTO → /mobile/work-orders
 * - CLIENTE_* → /mobile/alerts (el layout ya valida EXTERNAL_CLIENT_MANAGEMENT feature)
 * - ADMIN_EMPRESA → /mobile/work-orders
 * - Default → /mobile/profile
 *
 * Nota: La validación de features se hace en el layout (Server Component)
 * que muestra/oculta navegación según features habilitados
 */
export default function MobilePage() {
  const { user: currentUser, loading: userLoading } = useCurrentUser()
  const router = useRouter()

  useEffect(() => {
    if (userLoading || !currentUser) return

    const userRole = currentUser.role

    // OPERARIO INTERNO: Dashboard de máquinas
    if (userRole === 'OPERARIO') {
      router.push('/mobile/assets')
      return
    }

    // TÉCNICO/SUPERVISOR/JEFE: Dashboard de órdenes de trabajo
    if (['TECNICO', 'SUPERVISOR', 'JEFE_MANTENIMIENTO'].includes(userRole || '')) {
      router.push('/mobile/work-orders')
      return
    }

    // USUARIOS EXTERNOS: Alertas (si tienen el feature, layout ya lo valida)
    const isExternalUser = ['CLIENTE_ADMIN_GENERAL', 'CLIENTE_ADMIN_SEDE', 'CLIENTE_OPERARIO'].includes(userRole || '')
    if (isExternalUser) {
      router.push('/mobile/alerts')
      return
    }

    // ADMIN_EMPRESA: Órdenes de trabajo
    if (userRole === 'ADMIN_EMPRESA') {
      router.push('/mobile/work-orders')
      return
    }

    // Default: Perfil
    router.push('/mobile/profile')
  }, [currentUser, userLoading, router])

  // Loading state
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Cargando...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/hooks/useCurrentUser"
import { usePermissions } from "@/hooks/usePermissions"
import { Card, CardContent } from "@/components/ui/card"

/**
 * Mobile Home - Router principal que redirige según permisos del usuario
 *
 * Lógica de redirección basada en permisos (en orden de prioridad):
 * 1. Operarios (assets.change_status) → /mobile/assets
 *    - Pueden cambiar estado de máquinas y crear OT sin asignar
 * 2. Técnicos/Mecánicos (work_orders.view_assigned) → /mobile/work-orders
 *    - Pueden ver y completar sus OT asignadas
 * 3. Clientes Externos (alerts.create + clientCompanyId) → /mobile/alerts
 *    - Pueden crear y ver alertas de su empresa cliente
 * 4. Fallback: Usar interfaceType para determinar destino
 */
export default function MobilePage() {
  const { user: currentUser, loading: userLoading } = useCurrentUser()
  const { hasPermission, loading: permissionsLoading } = usePermissions()
  const router = useRouter()

  useEffect(() => {
    if (userLoading || permissionsLoading || !currentUser) return

    const interfaceType = (currentUser as { roleInterfaceType?: 'MOBILE' | 'DASHBOARD' | 'BOTH' }).roleInterfaceType
    const isExternalUser = !!currentUser.clientCompanyId

    // Priority 1: Operarios - Assets/Máquinas
    // Pueden cambiar estado de assets y crear OT sin asignar
    if (hasPermission('assets.change_status')) {
      router.push('/mobile/assets')
      return
    }

    // Priority 2: Técnicos/Mecánicos - Órdenes de Trabajo
    // Pueden ver sus OT asignadas y completarlas
    if (hasPermission('work_orders.view_assigned') || hasPermission('work_orders.complete')) {
      router.push('/mobile/work-orders')
      return
    }

    // Priority 3: Clientes Externos - Alertas
    // Pueden crear alertas de su empresa cliente
    if (isExternalUser && hasPermission('alerts.create')) {
      router.push('/mobile/alerts')
      return
    }

    // Priority 4: InterfaceType fallback
    if (interfaceType === 'MOBILE' || interfaceType === 'BOTH') {
      router.push('/mobile/work-orders')
      return
    }

    // Si solo tiene DASHBOARD, redirigir al dashboard principal
    if (interfaceType === 'DASHBOARD') {
      router.push('/')
      return
    }

    // Fallback final: Órdenes de trabajo
    router.push('/mobile/work-orders')
  }, [currentUser, userLoading, permissionsLoading, hasPermission, router])

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

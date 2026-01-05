/**
 * Client Dashboard Component
 *
 * Dashboard for external client users
 * - CLIENTE_ADMIN_GENERAL (all sites)
 * - CLIENTE_ADMIN_SEDE (specific site)
 *
 * Under 200 lines - Composition pattern
 */

'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { WorkOrderStats as ClientStats } from './work-order-stats'
import { CriticalOrders } from './critical-orders'
import { SiteMetrics } from './site-metrics'
import { DashboardLoading } from '../shared/dashboard-loading'
import { DashboardError } from '../shared/dashboard-error'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

// NOTA DE NEGOCIO: Se eliminó ProviderPerformance de esta vista.
// Las métricas de rendimiento del proveedor (SLA, tiempos de respuesta/resolución,
// calidad de servicio) son información interna que NO debe exponerse al cliente.
// El cliente solo ve métricas operativas de SUS órdenes de trabajo.

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch data')
  return res.json()
}

export function ClientDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch client work orders stats
  // La respuesta del API es { stats: { total, byStatus: {...}, overdue, ... } }
  const { data: statsData, error, isLoading } = useSWR(
    `/api/client/work-orders/stats?refresh=${refreshKey}`,
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
      revalidateOnFocus: true,
    }
  )

  // Fetch critical orders
  const { data: criticalData, isLoading: criticalLoading } = useSWR(
    `/api/client/work-orders/critical?refresh=${refreshKey}`,
    fetcher,
    {
      refreshInterval: 30000, // Refresh critical orders more frequently
    }
  )

  // NOTA: Se eliminó el fetch de provider-metrics.
  // Esas métricas (SLA, tiempos de respuesta/resolución) son internas del proveedor
  // y no deben exponerse al cliente externo.

  // Fetch site metrics
  const { data: siteData, isLoading: siteLoading } = useSWR(
    `/api/client/work-orders/site-metrics?refresh=${refreshKey}`,
    fetcher,
    {
      refreshInterval: 60000,
    }
  )

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-0">
        <DashboardLoading />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-0">
        <DashboardError
          error={error}
          onRetry={handleRefresh}
        />
      </div>
    )
  }

  // NOTA: Anteriormente se usaba `hasData = stats?.total > 0` para ocultar TODO el dashboard
  // cuando no había órdenes. Esto era incorrecto porque impedía ver el dashboard completo.
  // Ahora el dashboard siempre se muestra, y cada sección maneja internamente su estado vacío.
  // Las stats con valores en 0 siguen siendo información útil para el cliente.
  //
  // La respuesta del API viene como { stats: { total, byStatus: {...}, overdue, ... } }
  // Transformamos al formato que espera el componente WorkOrderStats
  const rawStats = statsData?.stats
  const safeStats = {
    total: rawStats?.total ?? 0,
    pending: (rawStats?.byStatus?.DRAFT ?? 0) +
             (rawStats?.byStatus?.PENDING_APPROVAL ?? 0) +
             (rawStats?.byStatus?.ASSIGNED ?? 0),
    inProgress: rawStats?.byStatus?.IN_PROGRESS ?? 0,
    completed: rawStats?.byStatus?.COMPLETED ?? 0,
    overdue: rawStats?.overdue ?? 0,
  }

  return (
    <div className="container mx-auto py-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Cliente</h1>
            <p className="text-muted-foreground">
              Resumen de órdenes de trabajo y estado de sus instalaciones
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Overview - Siempre visible, muestra 0 si no hay órdenes */}
        <ClientStats stats={safeStats} loading={isLoading} />

        {/* Main Content Grid - Siempre visible */}
        {/* NOTA: Se eliminó ProviderPerformance (métricas internas del proveedor).
            El cliente solo ve: órdenes críticas y distribución por sede. */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Órdenes Críticas - Información accionable para el cliente */}
          <CriticalOrders
            orders={criticalData?.orders || []}
            loading={criticalLoading}
          />

          {/* Métricas por Sede - Distribución de órdenes por ubicación */}
          <SiteMetrics
            sites={siteData?.sites || []}
            loading={siteLoading}
          />
        </div>
      </div>
    </div>
  )
}

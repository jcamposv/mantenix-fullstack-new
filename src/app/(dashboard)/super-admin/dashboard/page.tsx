"use client"

import { useSaaSMetrics } from "@/components/hooks/use-saas-metrics"
import { CompanyMetricsSection } from "@/components/super-admin/company-metrics-section"
import { UserMetricsSection } from "@/components/super-admin/user-metrics-section"
import { SystemMetricsSection } from "@/components/super-admin/system-metrics-section"
import { Loader2, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuperAdminDashboardPage() {
  const { metrics, loading, error, refetch } = useSaaSMetrics()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard SaaS</h2>
          <p className="text-muted-foreground">
            Métricas y estadísticas del sistema
          </p>
        </div>
        <Button onClick={refetch} variant="outline" size="sm">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Empresas</h3>
          <CompanyMetricsSection metrics={metrics.companies} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Usuarios</h3>
          <UserMetricsSection metrics={metrics.users} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Sistema</h3>
          <SystemMetricsSection metrics={metrics.system} />
        </div>
      </div>
    </div>
  )
}

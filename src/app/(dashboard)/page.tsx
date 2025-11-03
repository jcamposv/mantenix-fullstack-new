"use client"

import { useState, useMemo } from "react"
import { useWorkOrdersDashboard } from "@/hooks/use-work-orders-dashboard"
import { DashboardError } from "@/components/dashboard/shared/dashboard-error"
import { DashboardLoading } from "@/components/dashboard/shared/dashboard-loading"
import { DashboardEmpty } from "@/components/dashboard/shared/dashboard-empty"
import { DashboardFilters, DatePeriod } from "@/components/dashboard/shared/dashboard-filters"
import { KPICard } from "@/components/dashboard/shared/kpi-card"
import { PerformanceMetrics } from "@/components/dashboard/company/performance-metrics"
import { RecentActivity } from "@/components/dashboard/shared/recent-activity"
import { UpcomingWorkOrders } from "@/components/dashboard/shared/upcoming-work-orders"
import { getDateRangeFromPeriod } from "@/lib/date-utils"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DateRange } from "react-day-picker"
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
  List,
  Clock,
  CheckCircle2,
  Calendar,
  BarChart3
} from "lucide-react"
import type { WorkOrderPriority } from "@/types/work-order.types"

export default function Home() {
  const router = useRouter()
  const [period, setPeriod] = useState<DatePeriod>("this_month")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()

  // Calculate the effective date range based on period selection
  const effectiveDateRange = useMemo(() => {
    if (period === "custom") {
      return customDateRange
    }
    return getDateRangeFromPeriod(period)
  }, [period, customDateRange])

  // Fetch dashboard data with filters
  const { data: stats, error, isLoading: loading, mutate } = useWorkOrdersDashboard({
    dateRange: effectiveDateRange
  })

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-0">
        <DashboardLoading />
      </div>
    )
  }

  // Show error state if data fetch failed
  if (error) {
    return (
      <div className="container mx-auto py-0">
        <DashboardError
          error={error}
          onRetry={() => mutate()}
        />
      </div>
    )
  }

  // Check if we have any data at all (not filtered, just no work orders ever created)
  const hasNoDataAtAll = stats && stats.total === 0 && period === "this_month" && !customDateRange

  // Show empty state only if there's truly no data in the system
  if (hasNoDataAtAll) {
    return (
      <div className="container mx-auto py-0">
        <DashboardEmpty
          onCreateWorkOrder={() => router.push("/work-orders/new/select-template")}
        />
      </div>
    )
  }

  const hasDataInPeriod = stats && stats.total > 0

  // Calculate trend (this would come from comparing with previous period in real implementation)
  const activeUsersTrend: "up" | "down" | "neutral" = "neutral"
  const efficiencyTrend: "up" | "down" | "neutral" = stats?.completionRate && stats.completionRate >= 80 ? "up" : stats?.completionRate && stats.completionRate < 50 ? "down" : "neutral"

  return (
    <div className="container mx-auto py-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Vista general de las órdenes de trabajo y métricas de rendimiento
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filters */}
            <DashboardFilters
              period={period}
              customDateRange={customDateRange}
              onPeriodChange={setPeriod}
              onCustomDateRangeChange={setCustomDateRange}
            />

            <Button variant="outline" onClick={() => router.push("/work-orders/list")}>
              <List className="h-4 w-4 mr-2" />
              Ver Todas las Órdenes
            </Button>
            <Button onClick={() => router.push("/work-orders/new/select-template")}>
              <Activity className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </div>
        </div>

        {/* No data in period message */}
        {!hasDataInPeriod && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay datos en el período seleccionado
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                No se encontraron órdenes de trabajo en el rango de fechas seleccionado.
                Intenta cambiar el período o crear una nueva orden de trabajo.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setPeriod("this_month")}>
                  Ver Este Mes
                </Button>
                <Button onClick={() => router.push("/work-orders/new/select-template")}>
                  <Activity className="h-4 w-4 mr-2" />
                  Nueva Orden
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats Row - Using KPICard */}
        {hasDataInPeriod && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                title="Usuarios Activos"
                value={stats?.activeUsers || 0}
                description="Técnicos trabajando hoy"
                icon={Users}
                trend={activeUsersTrend}
              />

              <KPICard
                title="Órdenes Totales"
                value={stats?.total || 0}
                description="En el sistema"
                icon={Activity}
                trend="neutral"
              />

              <KPICard
                title="Órdenes Vencidas"
                value={stats?.overdue || 0}
                description="Requieren atención"
                icon={AlertTriangle}
                trend={stats?.overdue && stats.overdue > 0 ? "down" : "neutral"}
                className={stats?.overdue && stats.overdue > 0 ? "border-destructive" : ""}
              />

              <KPICard
                title="Eficiencia"
                value={`${stats?.completionRate || 0}%`}
                description="Tasa de completación"
                icon={TrendingUp}
                trend={efficiencyTrend}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Metrics Chart */}
            <PerformanceMetrics
              data={stats?.performanceMetrics || []}
              loading={loading}
            />

            {/* Status Overview */}
            <Card className="shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Resumen de Estados
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Distribución actual de órdenes por estado
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10">
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-success">Completadas</p>
                        <p className="text-xs text-muted-foreground">Finalizadas</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-success">
                      {stats?.completed || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-info/5 rounded-lg border border-info/20">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-info/10">
                        <Activity className="h-5 w-5 text-info" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-info">En Progreso</p>
                        <p className="text-xs text-muted-foreground">Ejecutándose</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-info">
                      {stats?.inProgress || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10">
                        <Clock className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-warning">Pendientes</p>
                        <p className="text-xs text-muted-foreground">Por iniciar</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-warning">
                      {stats?.pending || 0}
                    </div>
                  </div>

                  {(stats?.overdue ?? 0) > 0 && (
                    <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-destructive/10">
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-destructive">Vencidas</p>
                          <p className="text-xs text-muted-foreground">Atrasadas</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-destructive">
                        {stats?.overdue || 0}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Metrics */}
                {stats?.avgCompletionTime && stats.avgCompletionTime > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Tiempo Promedio de Completación</span>
                      </div>
                      <Badge variant="secondary">
                        {stats.avgCompletionTime} {stats.avgCompletionTime === 1 ? 'hora' : 'horas'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Upcoming Work Orders */}
            <UpcomingWorkOrders
              workOrders={(stats?.upcomingWorkOrders || []).map(wo => ({
                ...wo,
                priority: (["LOW", "MEDIUM", "HIGH", "URGENT"] as readonly WorkOrderPriority[]).includes(wo.priority as WorkOrderPriority)
                  ? (wo.priority as WorkOrderPriority)
                  : ("MEDIUM" as WorkOrderPriority)
              }))}
              loading={loading}
            />

              {/* Recent Activity */}
              <RecentActivity
                activities={stats?.recentActivity || []}
                loading={loading}
              />
            </div>
          </div>
          </>
        )}
      </div>
    </div>
  )
}

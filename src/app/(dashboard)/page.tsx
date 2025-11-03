"use client"

import { useWorkOrdersDashboard } from "@/hooks/use-work-orders-dashboard"
import { DashboardError } from "@/components/dashboard/dashboard-error"
import { DashboardLoading } from "@/components/dashboard/dashboard-loading"
import { DashboardEmpty } from "@/components/dashboard/dashboard-empty"
import { KPICard } from "@/components/dashboard/kpi-card"
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { UpcomingWorkOrders } from "@/components/dashboard/upcoming-work-orders"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

export default function Home() {
  const { data: stats, error, isLoading: loading, mutate } = useWorkOrdersDashboard()
  const router = useRouter()

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <DashboardLoading />
      </div>
    )
  }

  // Show error state if data fetch failed
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <DashboardError
          error={error}
          onRetry={() => mutate()}
        />
      </div>
    )
  }

  // Show empty state if no data
  if (stats && stats.total === 0) {
    return (
      <div className="container mx-auto py-6">
        <DashboardEmpty
          onCreateWorkOrder={() => router.push("/work-orders/new/select-template")}
        />
      </div>
    )
  }

  // Calculate trend (this would come from comparing with previous period in real implementation)
  const activeUsersTrend: "up" | "down" | "neutral" = "neutral"
  const efficiencyTrend: "up" | "down" | "neutral" = stats?.completionRate && stats.completionRate >= 80 ? "up" : stats?.completionRate && stats.completionRate < 50 ? "down" : "neutral"

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Vista general de las órdenes de trabajo y métricas de rendimiento
            </p>
          </div>

          <div className="flex items-center gap-3">
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

        {/* Quick Stats Row - Using KPICard */}
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
            <Card>
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
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-400">Completadas</p>
                        <p className="text-xs text-green-600 dark:text-green-500">Finalizadas</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {stats?.completed || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
                        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-400">En Progreso</p>
                        <p className="text-xs text-blue-600 dark:text-blue-500">Ejecutándose</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {stats?.inProgress || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-900/50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                        <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Pendientes</p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-500">Por iniciar</p>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {stats?.pending || 0}
                    </div>
                  </div>

                  {(stats?.overdue ?? 0) > 0 && (
                    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900/50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
                          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-red-800 dark:text-red-400">Vencidas</p>
                          <p className="text-xs text-red-600 dark:text-red-500">Atrasadas</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-red-700 dark:text-red-300">
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
              workOrders={stats?.upcomingWorkOrders || []}
              loading={loading}
            />

            {/* Recent Activity */}
            <RecentActivity
              activities={stats?.recentActivity || []}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

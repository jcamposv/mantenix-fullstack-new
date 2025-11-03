"use client"

import { useState, useMemo } from "react"
import { WorkOrdersOverview } from "./work-orders-overview"
import { StatusDistributionChart } from "./status-distribution-chart"
import { RecentActivity } from "./recent-activity"
import { PerformanceMetrics } from "./performance-metrics"
import { MaintenanceMetrics } from "./maintenance-metrics"
import { DashboardError } from "./dashboard-error"
import { DashboardLoading } from "./dashboard-loading"
import { DashboardEmpty } from "./dashboard-empty"
import { DashboardFilters, DatePeriod } from "./dashboard-filters"
import { useWorkOrdersDashboard } from "@/hooks/use-work-orders-dashboard"
import { getDateRangeFromPeriod } from "@/lib/date-utils"
import { useRouter } from "next/navigation"
import { DateRange } from "react-day-picker"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Activity } from "lucide-react"

interface WorkOrdersDashboardProps {
  className?: string
}

export function WorkOrdersDashboard({ className }: WorkOrdersDashboardProps) {
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

  const { data: stats, error, isLoading: loading, mutate } = useWorkOrdersDashboard({
    dateRange: effectiveDateRange
  })

  // Generate status distribution from real stats
  const statusDistribution = stats ? [
    { name: "Completadas", value: stats.completed, color: "hsl(var(--success))" },
    { name: "En Progreso", value: stats.inProgress, color: "hsl(var(--info))" },
    { name: "Pendientes", value: stats.pending, color: "hsl(var(--warning))" },
    { name: "Vencidas", value: stats.overdue, color: "hsl(var(--destructive))" }
  ] : []

  // Convert timestamps to Date objects for recent activity
  const recentActivity = stats?.recentActivity?.map(activity => ({
    ...activity,
    timestamp: new Date(activity.timestamp)
  })) || []

  // Get performance metrics from real data
  const performanceMetrics = stats?.performanceMetrics || []

  // Calculate maintenance metrics from real backend data
  const maintenanceMetrics = stats ? {
    mttr: stats.avgCompletionTime,
    slaCompliance: stats.total > 0
      ? Math.round(((stats.total - stats.overdue) / stats.total) * 100)
      : 0,
    plannedVsUnplanned: stats.plannedVsUnplanned
  } : null

  // Show loading state
  if (loading) {
    return <DashboardLoading className={className} />
  }

  // Show error state if data fetch failed
  if (error) {
    return (
      <DashboardError
        error={error}
        onRetry={() => mutate()}
        className={className}
      />
    )
  }

  // Check if we have any data at all (not filtered, just no work orders ever created)
  const hasNoDataAtAll = stats && stats.total === 0 && period === "this_month" && !customDateRange

  // Show empty state only if there's truly no data in the system
  if (hasNoDataAtAll) {
    return (
      <DashboardEmpty
        onCreateWorkOrder={() => router.push("/work-orders/new/select-template")}
        className={className}
      />
    )
  }

  const hasDataInPeriod = stats && stats.total > 0

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Filters */}
        <DashboardFilters
          period={period}
          customDateRange={customDateRange}
          onPeriodChange={setPeriod}
          onCustomDateRangeChange={setCustomDateRange}
        />

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

        {/* Dashboard Content - Only show if has data */}
        {hasDataInPeriod && (
          <>
        {/* KPIs Overview */}
        <WorkOrdersOverview 
          stats={stats || {
            total: 0,
            inProgress: 0,
            completed: 0,
            pending: 0,
            overdue: 0,
            completionRate: 0,
            avgCompletionTime: 0,
            activeUsers: 0
          }} 
          loading={false}
        />

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <StatusDistributionChart
            data={statusDistribution}
            loading={false}
          />
          <PerformanceMetrics
            data={performanceMetrics}
            loading={false}
          />
        </div>

            {/* Maintenance Metrics - Industrial Engineering KPIs */}
            {maintenanceMetrics && (
              <MaintenanceMetrics
                mttr={maintenanceMetrics.mttr}
                slaCompliance={maintenanceMetrics.slaCompliance}
                plannedVsUnplanned={maintenanceMetrics.plannedVsUnplanned}
                loading={false}
              />
            )}

            {/* Recent Activity */}
            <RecentActivity
              activities={recentActivity}
              loading={false}
            />
          </>
        )}
      </div>
    </div>
  )
}
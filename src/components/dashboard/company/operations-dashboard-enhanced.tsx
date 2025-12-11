/**
 * Enhanced Operations Dashboard Component
 *
 * Industrial maintenance dashboard with comprehensive KPIs:
 * - MTBF, MTTR, OEE, Availability
 * - Preventive vs Corrective maintenance
 * - Backlog management
 * - MTBF Alerts
 *
 * Under 200 lines - Composition pattern
 */

'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useWorkOrdersDashboard } from '@/hooks/use-work-orders-dashboard'
import { useIndustrialMetrics } from '@/hooks/use-industrial-metrics'
import { DashboardError } from '@/components/dashboard/shared/dashboard-error'
import { DashboardLoading } from '@/components/dashboard/shared/dashboard-loading'
import { DashboardEmpty } from '@/components/dashboard/shared/dashboard-empty'
import { DashboardFilters, DatePeriod } from '@/components/dashboard/shared/dashboard-filters'
import { IndustrialKPIs } from './industrial-kpis'
import { MaintenanceTypeChart } from './maintenance-type-chart'
import { MaintenanceBacklog } from './maintenance-backlog'
import { PerformanceMetrics } from './performance-metrics'
import { MTBFAlerts } from '@/components/maintenance/mtbf-alerts'
import { UpcomingWorkOrders } from '../shared/upcoming-work-orders'
import { getDateRangeFromPeriod } from '@/lib/date-utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DateRange } from 'react-day-picker'
import { List, Activity, Calendar } from 'lucide-react'
import type { WorkOrderPriority } from '@/types/work-order.types'

export function OperationsDashboardEnhanced() {
  const router = useRouter()
  const [period, setPeriod] = useState<DatePeriod>('this_month')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()

  // Calculate the effective date range
  const effectiveDateRange = useMemo(() => {
    if (period === 'custom') return customDateRange
    return getDateRangeFromPeriod(period)
  }, [period, customDateRange])

  // Fetch work orders dashboard data
  const { data: stats, error, isLoading: loading, mutate } = useWorkOrdersDashboard({
    dateRange: effectiveDateRange
  })

  // Fetch industrial metrics (MTBF, MTTR, OEE, etc.)
  const { data: industrialMetrics, isLoading: metricsLoading } = useIndustrialMetrics('last_30_days')

  // Show loading state
  if (loading && !stats) {
    return (
      <div className="container mx-auto py-0">
        <DashboardLoading />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-0">
        <DashboardError error={error} onRetry={() => mutate()} />
      </div>
    )
  }

  // Check if we have any data
  const hasNoDataAtAll = stats && stats.total === 0 && period === 'this_month' && !customDateRange

  if (hasNoDataAtAll) {
    return (
      <div className="container mx-auto py-0">
        <DashboardEmpty
          onCreateWorkOrder={() => router.push('/work-orders/new/select-template')}
        />
      </div>
    )
  }

  const hasDataInPeriod = stats && stats.total > 0

  return (
    <div className="container mx-auto py-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Operativo</h1>
            <p className="text-muted-foreground">
              Gestión de mantenimiento y métricas industriales
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DashboardFilters
              period={period}
              customDateRange={customDateRange}
              onPeriodChange={setPeriod}
              onCustomDateRangeChange={setCustomDateRange}
            />

            <Button variant="outline" onClick={() => router.push('/work-orders/list')}>
              <List className="h-4 w-4 mr-2" />
              Ver Todas
            </Button>
            <Button onClick={() => router.push('/work-orders/new/select-template')}>
              <Activity className="h-4 w-4 mr-2" />
              Nueva Orden
            </Button>
          </div>
        </div>

        {/* No data in period */}
        {!hasDataInPeriod && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay datos en el período seleccionado
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                No se encontraron órdenes de trabajo en el rango seleccionado.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setPeriod('this_month')}>
                  Ver Este Mes
                </Button>
                <Button onClick={() => router.push('/work-orders/new/select-template')}>
                  <Activity className="h-4 w-4 mr-2" />
                  Nueva Orden
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        {hasDataInPeriod && (
          <>
            {/* Industrial KPIs - MTBF, MTTR, OEE, Availability */}
            <IndustrialKPIs
              metrics={industrialMetrics?.overall}
              loading={metricsLoading}
            />

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Performance Metrics Chart */}
                <PerformanceMetrics
                  data={stats?.performanceMetrics || []}
                  loading={loading}
                />

                {/* Maintenance Type Distribution */}
                <MaintenanceTypeChart
                  data={stats?.plannedVsUnplanned}
                  loading={loading}
                />
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* Maintenance Backlog */}
                <MaintenanceBacklog stats={stats} loading={loading} />

                {/* MTBF Maintenance Alerts */}
                <MTBFAlerts limit={5} criticalOnly={true} autoRefresh={true} />

                {/* Upcoming Work Orders */}
                <UpcomingWorkOrders
                  workOrders={(stats?.upcomingWorkOrders || []).map(wo => ({
                    ...wo,
                    priority: (['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as readonly WorkOrderPriority[]).includes(wo.priority as WorkOrderPriority)
                      ? (wo.priority as WorkOrderPriority)
                      : ('MEDIUM' as WorkOrderPriority)
                  }))}
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

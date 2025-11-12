"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, FileDown, RefreshCcw } from "lucide-react"
import { DashboardFilters, DatePeriod } from "@/components/dashboard/shared/dashboard-filters"
import { DashboardError } from "@/components/dashboard/shared/dashboard-error"
import { DashboardLoading } from "@/components/dashboard/shared/dashboard-loading"
import { ReliabilityKPICards } from "./reliability-kpi-cards"
// import { CostTrendChart } from "./cost-trend-chart" // TODO: Add when implementing cost trends
import { MaintenanceMetricsChart } from "./maintenance-metrics-chart"
import { useAnalyticsDashboard } from "@/hooks/use-analytics-dashboard"
import type { PeriodPreset } from "@/schemas/analytics"
import type { DateRange } from "react-day-picker"

interface AnalyticsDashboardProps {
  className?: string
  period?: DatePeriod
  onPeriodChange?: (period: DatePeriod) => void
  hideFilters?: boolean
}

/**
 * Analytics Dashboard Component
 *
 * Main component that displays comprehensive analytics and KPIs
 * Following CMMS best practices for maintenance analytics
 */
export function AnalyticsDashboard({
  className,
  period: externalPeriod,
  onPeriodChange: externalOnPeriodChange,
  hideFilters = false,
}: AnalyticsDashboardProps) {
  const [internalPeriod, setInternalPeriod] = useState<DatePeriod>("this_month")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()

  // Use external state if provided, otherwise use internal state
  const period = externalPeriod ?? internalPeriod
  const setPeriod = externalOnPeriodChange ?? setInternalPeriod

  // Map DatePeriod to PeriodPreset
  const periodPresetMap: Record<string, PeriodPreset> = {
    today: "today",
    this_week: "last_7_days",
    last_week: "last_7_days",
    this_month: "this_month",
    last_month: "last_month",
    this_quarter: "this_quarter",
    last_quarter: "last_quarter",
    this_year: "this_year",
    last_year: "last_year",
    custom: "custom",
  }

  const periodPreset = periodPresetMap[period] || "last_30_days"

  // Fetch analytics data
  const { data, error, isLoading, mutate } = useAnalyticsDashboard({
    period: periodPreset,
  })

  // Handle refresh
  const handleRefresh = () => {
    mutate()
  }

  // Handle export (placeholder)
  const handleExport = () => {
    // TODO: Implement export to PDF/Excel
    console.log("Export analytics...")
  }

  // Show loading state
  if (isLoading) {
    return <DashboardLoading className={className} />
  }

  // Show error state
  if (error) {
    return (
      <DashboardError
        error={error}
        onRetry={handleRefresh}
        className={className}
      />
    )
  }

  // No data state
  if (!data) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No hay datos disponibles
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
            No se encontraron datos analíticos para el período seleccionado.
          </p>
          <Button variant="outline" onClick={() => setPeriod("this_month")}>
            Ver Este Mes
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header with Filters and Actions */}
        <div className="flex items-center justify-between gap-4">
          {!hideFilters && (
            <DashboardFilters
              period={period}
              customDateRange={customDateRange}
              onPeriodChange={setPeriod}
              onCustomDateRangeChange={setCustomDateRange}
            />
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Asset Reliability KPIs */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Confiabilidad de Activos</h2>
            <p className="text-sm text-muted-foreground">
              Métricas clave de confiabilidad (MTBF, MTTR, Disponibilidad, OEE)
            </p>
          </div>
          <ReliabilityKPICards data={data.assetReliability} loading={isLoading} />
        </div>

        {/* Maintenance Performance */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Desempeño de Mantenimiento</h2>
            <p className="text-sm text-muted-foreground">
              Análisis de distribución y cumplimiento de mantenimiento
            </p>
          </div>
          <MaintenanceMetricsChart
            data={data.maintenancePerformance}
            loading={isLoading}
          />
        </div>

        {/* Cost Overview */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Análisis de Costos</h2>
            <p className="text-sm text-muted-foreground">
              Desglose de costos de mantenimiento y ROI
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Costo Total</div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('es-CR', {
                    style: 'currency',
                    currency: 'CRC',
                    minimumFractionDigits: 0,
                  }).format(data.costs.totalCost)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Costo Promedio/OT</div>
                <div className="text-2xl font-bold">
                  {new Intl.NumberFormat('es-CR', {
                    style: 'currency',
                    currency: 'CRC',
                    minimumFractionDigits: 0,
                  }).format(data.costs.avgCostPerWorkOrder)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Ratio PM/CM</div>
                <div className="text-2xl font-bold">
                  {data.costs.preventiveVsCorrectiveRatio.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">ROI PM</div>
                <div className="text-2xl font-bold text-success">
                  {data.costs.preventiveMaintenanceROI.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Overview Stats */}
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Resumen General</h2>
            <p className="text-sm text-muted-foreground">
              Vista consolidada del período seleccionado
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Total Órdenes</div>
                <div className="text-3xl font-bold">{data.overview.totalWorkOrders}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {data.overview.completedWorkOrders} completadas ({data.overview.completionRate.toFixed(1)}%)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">En Progreso</div>
                <div className="text-3xl font-bold text-info">
                  {data.overview.inProgressWorkOrders}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {data.overview.overdueWorkOrders} vencidas
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground">Tiempo Promedio</div>
                <div className="text-3xl font-bold">
                  {data.overview.avgCompletionTime.toFixed(1)}
                  <span className="text-sm font-normal text-muted-foreground ml-1">hrs</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Tiempo de completación
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

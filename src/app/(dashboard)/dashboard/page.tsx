/**
 * Global Executive Dashboard Page
 *
 * Feature-aware dashboard with auto-refresh using SWR.
 * Requires 'dashboard.view_global' permission.
 *
 * Following Next.js Expert standards:
 * - Client component for SWR
 * - Type-safe
 * - Clean composition
 * - Under 200 lines
 */

'use client'

import { useState } from 'react'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { HeroCard } from '@/components/dashboard/hero-card'
import { RequiresAttentionSection } from '@/components/dashboard/requires-attention-section'
import { DashboardStatsGrid } from '@/components/dashboard/dashboard-stats-grid'
import { FilterButton } from '@/components/common/filter-button'
import {
  TimeRangeFilters,
  getTimeRangeLabel,
  type TimeRange,
  type DateRange,
} from '@/components/dashboard/time-range-selector'
import { Card } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { BarChart3, RefreshCw, Activity, Clock, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const { stats, loading, error, refetch } = useDashboardStats({
    refreshInterval: 30000, // 30 seconds
    revalidateOnFocus: true,
    timeRange,
    dateRange,
  })

  const handleTimeRangeChange = (range: TimeRange, dates?: DateRange) => {
    setTimeRange(range)
    setDateRange(dates)
  }

  const handleClearFilters = () => {
    setTimeRange('month')
    setDateRange(undefined)
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            Error al cargar dashboard
          </h2>
          <p className="text-muted-foreground mb-4">
            {error.message || 'No se pudieron cargar las estadísticas'}
          </p>
          <Button onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Ejecutivo
          </h1>
          <p className="text-muted-foreground">
            {getTimeRangeLabel(timeRange, dateRange)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5">
            <RefreshCw className="h-3 w-3" />
            Auto-actualiza cada 30s
          </Badge>
          <FilterButton
            title="Período"
            hasActiveFilters={timeRange !== 'month'}
            onReset={handleClearFilters}
            resetLabel="Resetear"
            contentClassName="w-[380px]"
          >
            <TimeRangeFilters
              value={timeRange}
              dateRange={dateRange}
              onChange={handleTimeRangeChange}
            />
          </FilterButton>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`}
            />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Hero KPIs */}
      {stats?.hero && (
        <div className="grid gap-4 md:grid-cols-3">
          <HeroCard
            value={`${stats.hero.assetAvailability.value.toFixed(1)}%`}
            label="Disponibilidad de Activos"
            icon={Activity}
            status={
              stats.hero.assetAvailability.value >= 95
                ? 'success'
                : stats.hero.assetAvailability.value >= 90
                ? 'warning'
                : 'danger'
            }
            description="Porcentaje de activos operativos"
            trend={
              stats.hero.assetAvailability.trend !== undefined
                ? {
                    value: stats.hero.assetAvailability.trend,
                    label: 'vs período anterior',
                  }
                : undefined
            }
            sparklineData={stats.hero.assetAvailability.sparkline}
          />
          <HeroCard
            value={stats.hero.criticalItems.value}
            label="Items Críticos"
            icon={TrendingUp}
            status={
              stats.hero.criticalItems.value === 0
                ? 'success'
                : stats.hero.criticalItems.value <= 5
                ? 'warning'
                : 'danger'
            }
            description="Requieren atención inmediata"
            trend={
              stats.hero.criticalItems.trend !== undefined
                ? {
                    value: stats.hero.criticalItems.trend,
                    label: 'vs período anterior',
                  }
                : undefined
            }
            sparklineData={stats.hero.criticalItems.sparkline}
          />
          <HeroCard
            value={`${stats.hero.avgResponseTime.value.toFixed(1)}h`}
            label="Tiempo Promedio de Respuesta"
            icon={Clock}
            status={
              stats.hero.avgResponseTime.value <= 24
                ? 'success'
                : stats.hero.avgResponseTime.value <= 48
                ? 'warning'
                : 'danger'
            }
            description="Tiempo de completitud de OT"
            trend={
              stats.hero.avgResponseTime.trend !== undefined
                ? {
                    value: stats.hero.avgResponseTime.trend,
                    label: 'vs período anterior',
                  }
                : undefined
            }
            sparklineData={stats.hero.avgResponseTime.sparkline}
          />
        </div>
      )}

      {/* Requires Attention */}
      {stats?.criticalItems && (
        <RequiresAttentionSection items={stats.criticalItems} />
      )}

      {/* Detailed Stats - Collapsible */}
      <Card>
        <Accordion type="multiple" defaultValue={['details']} className="px-6">
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                <span className="font-semibold">Estadísticas Detalladas</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <DashboardStatsGrid stats={stats} loading={loading} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Enabled Features Info */}
      {stats && stats.enabledFeatures.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>Módulos activos:</span>
            <div className="flex gap-2 flex-wrap">
              {stats.enabledFeatures.map((feature) => (
                <Badge key={feature} variant="secondary">
                  {feature.replace(/_/g, ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

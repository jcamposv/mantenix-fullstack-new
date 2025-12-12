/**
 * Analytics Dashboard Component
 *
 * Main dashboard that displays MTBF analytics and metrics.
 * Following Next.js Expert standards:
 * - Client component (uses SWR)
 * - Composable architecture
 * - Integrated with DashboardFilters
 */

'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { DateRange } from 'react-day-picker'
import { DashboardFilters, DatePeriod } from '@/components/dashboard/shared/dashboard-filters'
import { AnalyticsKPICards } from './analytics-kpi-cards'
import { AnalyticsTrendsChart } from './analytics-trends-chart'
import { AnalyticsTopComponents } from './analytics-top-components'
import { AnalyticsDistribution } from './analytics-distribution'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

interface AnalyticsSummary {
  totalAlerts: number
  critical: number
  warnings: number
  info: number
  averageResponseTime: number
  effectiveness: number
  topComponents: Array<{
    componentId: string
    componentName: string
    partNumber: string | null
    alertCount: number
    criticality: string | null
  }>
  byCriticality: {
    A: number
    B: number
    C: number
  }
}

/**
 * Fetcher for SWR
 */
async function fetcher(url: string): Promise<AnalyticsSummary> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error('Failed to fetch analytics')
  }
  return response.json()
}

/**
 * Convert DatePeriod to actual date range
 */
function periodToDateRange(period: DatePeriod): { from: Date; to: Date } | null {
  const today = new Date()
  today.setHours(23, 59, 59, 999)

  switch (period) {
    case 'today': {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      return { from: start, to: today }
    }
    case 'this_week': {
      const dayOfWeek = today.getDay()
      const start = new Date(today)
      start.setDate(today.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      return { from: start, to: today }
    }
    case 'this_month': {
      const start = new Date(today.getFullYear(), today.getMonth(), 1)
      return { from: start, to: today }
    }
    case 'last_month': {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const end = new Date(today.getFullYear(), today.getMonth(), 0)
      end.setHours(23, 59, 59, 999)
      return { from: start, to: end }
    }
    case 'last_3_months': {
      const start = new Date(today)
      start.setMonth(today.getMonth() - 3)
      start.setHours(0, 0, 0, 0)
      return { from: start, to: today }
    }
    case 'this_year': {
      const start = new Date(today.getFullYear(), 0, 1)
      return { from: start, to: today }
    }
    case 'last_year': {
      const start = new Date(today.getFullYear() - 1, 0, 1)
      const end = new Date(today.getFullYear() - 1, 11, 31)
      end.setHours(23, 59, 59, 999)
      return { from: start, to: end }
    }
    case 'custom':
      return null // Custom dates handled separately
    default:
      return null
  }
}

/**
 * Analytics Dashboard Component
 */
export function AnalyticsDashboard() {
  const [period, setPeriod] = useState<DatePeriod>('this_month')
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()
  const [hasSynced, setHasSynced] = useState(false)

  // Auto-sync alerts on mount
  useEffect(() => {
    if (!hasSynced) {
      fetch('/api/maintenance/alerts/sync', {
        method: 'POST',
        credentials: 'include',
      })
        .then(() => setHasSynced(true))
        .catch((err) => console.error('Failed to sync alerts:', err))
    }
  }, [hasSynced])

  // Build query URL with date filters
  const buildQueryUrl = () => {
    const params = new URLSearchParams()

    if (period === 'custom' && customDateRange?.from && customDateRange?.to) {
      params.append('startDate', customDateRange.from.toISOString().split('T')[0]!)
      params.append('endDate', customDateRange.to.toISOString().split('T')[0]!)
    } else {
      const dateRange = periodToDateRange(period)
      if (dateRange) {
        params.append('startDate', dateRange.from.toISOString().split('T')[0]!)
        params.append('endDate', dateRange.to.toISOString().split('T')[0]!)
      }
    }

    return `/api/maintenance/analytics/summary?${params.toString()}`
  }

  const { data, error, isLoading } = useSWR<AnalyticsSummary>(
    buildQueryUrl(),
    fetcher,
    {
      refreshInterval: 300000, // Refresh every 5 minutes
      revalidateOnFocus: true,
    }
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar los datos de analytics. Por favor, intente nuevamente.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-end">
        <DashboardFilters
          period={period}
          customDateRange={customDateRange}
          onPeriodChange={setPeriod}
          onCustomDateRangeChange={setCustomDateRange}
        />
      </div>

      {/* KPI Cards */}
      <AnalyticsKPICards data={data} />

      {/* Trends Chart */}
      <AnalyticsTrendsChart />

      {/* Bottom Row: Top Components + Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <AnalyticsTopComponents components={data.topComponents} />
        <AnalyticsDistribution distribution={data.byCriticality} />
      </div>
    </div>
  )
}

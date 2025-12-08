/**
 * Analytics Dashboard Component
 *
 * Main dashboard that displays MTBF analytics and metrics.
 * Following Next.js Expert standards:
 * - Client component (uses SWR)
 * - Composable architecture
 * - Under 200 lines
 */

'use client'

import useSWR from 'swr'
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
    id: string
    name: string
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
 * Analytics Dashboard Component
 */
export function AnalyticsDashboard() {
  const { data, error, isLoading } = useSWR<AnalyticsSummary>(
    '/api/maintenance/analytics/summary',
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

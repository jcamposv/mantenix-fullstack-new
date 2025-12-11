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
import { ProviderPerformance } from './provider-performance'
import { CriticalOrders } from './critical-orders'
import { SiteMetrics } from './site-metrics'
import { DashboardLoading } from '../shared/dashboard-loading'
import { DashboardError } from '../shared/dashboard-error'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, RefreshCw } from 'lucide-react'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch data')
  return res.json()
}

export function ClientDashboard() {
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch client work orders stats
  const { data: stats, error, isLoading } = useSWR(
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

  // Fetch provider performance metrics
  const { data: providerData, isLoading: providerLoading } = useSWR(
    `/api/client/work-orders/provider-metrics?refresh=${refreshKey}`,
    fetcher,
    {
      refreshInterval: 60000,
    }
  )

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

  const hasData = stats && stats.total > 0

  return (
    <div className="container mx-auto py-0">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard Cliente</h1>
            <p className="text-muted-foreground">
              Monitoreo de órdenes de trabajo y rendimiento del proveedor
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

        {/* No data message */}
        {!hasData && (
          <Card className="border-dashed shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay órdenes de trabajo
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                No se encontraron órdenes de trabajo para su empresa.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        {hasData && (
          <>
            <ClientStats stats={stats} loading={isLoading} />

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - 2/3 width */}
              <div className="lg:col-span-2 space-y-6">
                {/* Provider Performance */}
                <ProviderPerformance
                  slaCompliance={providerData?.metrics?.slaCompliance ?? 0}
                  avgResponseTime={providerData?.metrics?.avgResponseTime ?? 0}
                  avgResolutionTime={providerData?.metrics?.avgResolutionTime ?? 0}
                  serviceRating={providerData?.metrics?.serviceRating}
                  loading={providerLoading}
                />

                {/* Site Metrics */}
                <SiteMetrics
                  sites={siteData?.sites || []}
                  loading={siteLoading}
                />
              </div>

              {/* Right Column - 1/3 width */}
              <div className="space-y-6">
                {/* Critical Orders */}
                <CriticalOrders
                  orders={criticalData?.orders || []}
                  loading={criticalLoading}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

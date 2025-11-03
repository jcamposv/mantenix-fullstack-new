"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { List } from "lucide-react"
import { WorkOrderStats } from "@/components/dashboard/client/work-order-stats"
import { ProviderPerformance } from "@/components/dashboard/client/provider-performance"
import { CriticalOrders } from "@/components/dashboard/client/critical-orders"
import { SiteMetrics } from "@/components/dashboard/client/site-metrics"
import { AIInsightsCard } from "@/components/dashboard/client/ai-insights-card"
import { DashboardFilters, DatePeriod } from "@/components/dashboard/shared/dashboard-filters"
import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { Eye } from "lucide-react"
import { toast } from "sonner"
import { DateRange } from "react-day-picker"
import { getDateRangeFromPeriod } from "@/lib/date-utils"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface ClientWorkOrderStats {
  total: number
  pending: number
  inProgress: number
  completed: number
}

interface CriticalOrder {
  id: string
  number: string
  title: string
  priority: "HIGH" | "URGENT"
  status: string
  scheduledDate: Date
  site?: {
    name: string
  }
  daysOverdue?: number
}

interface SiteMetric {
  siteId: string
  siteName: string
  total: number
  completed: number
  inProgress: number
  overdue: number
  completionRate: number
  avgResolutionTime?: number
}

export default function ClientWorkOrdersPage() {
  const router = useRouter()
  const [period, setPeriod] = useState<DatePeriod>("this_month")
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>()
  const [stats, setStats] = useState<ClientWorkOrderStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  })
  const [recentOrders, setRecentOrders] = useState<WorkOrderWithRelations[]>([])
  const [criticalOrders, setCriticalOrders] = useState<CriticalOrder[]>([])
  const [siteMetrics, setSiteMetrics] = useState<SiteMetric[]>([])
  const [providerMetrics, setProviderMetrics] = useState({
    slaCompliance: 0,
    avgResponseTime: 0,
    avgResolutionTime: 0,
    serviceRating: 0,
  })
  const [loading, setLoading] = useState(true)

  // Calculate the effective date range based on period selection
  const effectiveDateRange = useMemo(() => {
    if (period === "custom") {
      return customDateRange
    }
    return getDateRangeFromPeriod(period)
  }, [period, customDateRange])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Build query params with date filters
        const params = new URLSearchParams()
        if (effectiveDateRange?.from) {
          params.set('dateFrom', effectiveDateRange.from.toISOString())
        }
        if (effectiveDateRange?.to) {
          params.set('dateTo', effectiveDateRange.to.toISOString())
        }
        const queryString = params.toString()
        const queryParam = queryString ? `?${queryString}` : ''

        const [statsRes, ordersRes, criticalRes, providerRes, sitesRes] = await Promise.all([
          fetch(`/api/client/work-orders/stats${queryParam}`),
          fetch(`/api/client/work-orders?limit=10&${queryString}`),
          fetch(`/api/client/work-orders/critical${queryParam}`),
          fetch(`/api/client/work-orders/provider-metrics${queryParam}`),
          fetch(`/api/client/work-orders/site-metrics${queryParam}`),
        ])

        if (!statsRes.ok || !ordersRes.ok || !criticalRes.ok || !providerRes.ok || !sitesRes.ok) {
          throw new Error("Error al cargar datos")
        }

        const statsData = await statsRes.json()
        const ordersData = await ordersRes.json()
        const criticalData = await criticalRes.json()
        const providerData = await providerRes.json()
        const sitesData = await sitesRes.json()

        // Calculate stats from the service response
        const calculatedStats = {
          total: statsData.stats.total || 0,
          pending: (statsData.stats.byStatus.DRAFT || 0) + (statsData.stats.byStatus.ASSIGNED || 0),
          inProgress: statsData.stats.byStatus.IN_PROGRESS || 0,
          completed: statsData.stats.byStatus.COMPLETED || 0,
        }

        setStats(calculatedStats)
        setRecentOrders(ordersData.workOrders)
        setCriticalOrders(criticalData.orders)
        setProviderMetrics(providerData.metrics)
        setSiteMetrics(sitesData.sites)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Error al cargar las órdenes de trabajo")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [effectiveDateRange])

  const columns: ColumnDef<WorkOrderWithRelations>[] = [
    {
      accessorKey: "number",
      header: "Número",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "title",
      header: "Título",
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <WorkOrderStatusBadge status={row.getValue("status")} />
      ),
    },
    {
      accessorKey: "priority",
      header: "Prioridad",
      cell: ({ row }) => (
        <WorkOrderPriorityBadge priority={row.getValue("priority")} />
      ),
    },
    {
      accessorKey: "site",
      header: "Sede",
      cell: ({ row }) => row.original.site?.name || "N/A",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/client/work-orders/${row.original.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver
        </Button>
      ),
    },
  ]

  return (
    <div className="container mx-auto py-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Órdenes de Trabajo
            </h1>
            <p className="text-muted-foreground">
              Supervisión y seguimiento del servicio de mantenimiento
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Filter */}
            <DashboardFilters
              period={period}
              customDateRange={customDateRange}
              onPeriodChange={setPeriod}
              onCustomDateRangeChange={setCustomDateRange}
            />

            <Button variant="outline" onClick={() => router.push("/client/work-orders/list")}>
              <List className="h-4 w-4 mr-2" />
              Ver Todas las Órdenes
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">

        {/* KPI Stats */}
        <WorkOrderStats stats={stats} loading={loading} />

        {/* AI Insights */}
        <AIInsightsCard dateRange={effectiveDateRange} />

        {/* Provider Performance Metrics */}
        <ProviderPerformance
          slaCompliance={providerMetrics.slaCompliance}
          avgResponseTime={providerMetrics.avgResponseTime}
          avgResolutionTime={providerMetrics.avgResolutionTime}
          serviceRating={providerMetrics.serviceRating}
          loading={loading}
        />

        {/* Critical Orders and Site Metrics - Two columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          <CriticalOrders orders={criticalOrders} loading={loading} />
          <SiteMetrics sites={siteMetrics} loading={loading} />
        </div>

        {/* Recent Orders Table */}
        <Card className="shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Órdenes Recientes</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Últimas 10 órdenes de trabajo
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={recentOrders}
              searchKey="number"
              searchPlaceholder="Buscar por número..."
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { WorkOrderTypeBadge } from "@/components/work-orders/work-order-type-badge"
import { OfflineStatusBanner } from "@/components/mobile/offline-status-banner"
import {
  RefreshCw,
  Building,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  AlertTriangle,
  TrendingUp
} from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import { cn } from "@/lib/utils"
import { useOfflineWorkOrders } from "@/hooks/use-offline-data"

export default function MobileWorkOrdersPage() {
  // Offline-enabled data fetching
  const {
    data: workOrders,
    isLoading,
    error,
    isOffline,
    isStale,
    lastSyncAt,
    refresh
  } = useOfflineWorkOrders({
    staleTime: 10 * 60 * 1000, // 10 minutes
  }) as {
    data: WorkOrderWithRelations[] | undefined
    isLoading: boolean
    error: Error | undefined
    isOffline: boolean
    isStale: boolean
    lastSyncAt: number | null
    refresh: () => Promise<void>
  }

  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const router = useRouter()

  // Memoized filtered work orders
  const { activeWorkOrders, historyWorkOrders } = useMemo(() => {
    const orders = workOrders || []
    return {
      activeWorkOrders: orders.filter(wo =>
        ['DRAFT', 'ASSIGNED', 'IN_PROGRESS'].includes(wo.status)
      ),
      historyWorkOrders: orders.filter(wo =>
        ['COMPLETED', 'CANCELLED'].includes(wo.status)
      )
    }
  }, [workOrders])

  // Apply search and priority filters
  const filterWorkOrders = useCallback((orders: WorkOrderWithRelations[]) => {
    return orders.filter(wo => {
      const matchesSearch = searchQuery === "" ||
        wo.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wo.title.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPriority = !filterPriority || wo.priority === filterPriority

      return matchesSearch && matchesPriority
    })
  }, [searchQuery, filterPriority])

  const filteredActive = useMemo(
    () => filterWorkOrders(activeWorkOrders),
    [filterWorkOrders, activeWorkOrders]
  )
  const filteredHistory = useMemo(
    () => filterWorkOrders(historyWorkOrders),
    [filterWorkOrders, historyWorkOrders]
  )

  const handleViewWorkOrder = useCallback((id: string) => {
    router.push(`/mobile/work-orders/${id}`)
  }, [router])

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refresh()
    } finally {
      setRefreshing(false)
    }
  }, [refresh])

  // Calculate days remaining
  const getDaysRemaining = (scheduledDate: Date | string) => {
    const today = new Date()
    const scheduled = new Date(scheduledDate)
    const diffTime = scheduled.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Get urgency color based on priority and time
  const getUrgencyColor = (priority: string, scheduledDate?: Date | string) => {
    if (scheduledDate) {
      const daysRemaining = getDaysRemaining(scheduledDate)
      if (daysRemaining < 0) return 'border-l-red-500' // Overdue
      if (daysRemaining === 0) return 'border-l-orange-500' // Today
      if (daysRemaining === 1) return 'border-l-yellow-500' // Tomorrow
    }

    switch (priority) {
      case 'URGENT': return 'border-l-red-500'
      case 'HIGH': return 'border-l-orange-500'
      case 'MEDIUM': return 'border-l-blue-500'
      default: return 'border-l-gray-300'
    }
  }

  // Work order card component
  const MobileWorkOrderCard = ({ workOrder }: { workOrder: WorkOrderWithRelations }) => {
    const isActive = ['DRAFT', 'ASSIGNED', 'IN_PROGRESS'].includes(workOrder.status)
    const urgencyColor = getUrgencyColor(workOrder.priority, workOrder.scheduledDate ?? undefined)
    const daysRemaining = workOrder.scheduledDate ? getDaysRemaining(workOrder.scheduledDate) : null

    return (
      <Card
        className={cn(
          "cursor-pointer transition-all hover:shadow-md active:scale-[0.98] border-l-4",
          urgencyColor
        )}
        onClick={() => handleViewWorkOrder(workOrder.id)}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-foreground">
                  {workOrder.number}
                </span>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-foreground line-clamp-2 leading-snug font-medium">
                {workOrder.title}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0 ml-2" />
          </div>

          {/* Compact badges */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <WorkOrderStatusBadge status={workOrder.status} />
            <WorkOrderPriorityBadge priority={workOrder.priority} />
            <WorkOrderTypeBadge type={workOrder.type} />
          </div>

          {/* Info Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {workOrder.site && (
                <div className="flex items-center gap-1">
                  <Building className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[120px]">{workOrder.site.name}</span>
                </div>
              )}
            </div>

            {/* Remaining time/date */}
            {daysRemaining !== null && isActive && (
              <div className={cn(
                "flex items-center gap-1 font-medium px-2 py-0.5 rounded-full",
                daysRemaining < 0 ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                daysRemaining === 0 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" :
                daysRemaining === 1 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" :
                "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              )}>
                <Clock className="h-3 w-3" />
                <span>
                  {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d vencido` :
                   daysRemaining === 0 ? 'Hoy' :
                   daysRemaining === 1 ? 'Manana' :
                   `${daysRemaining}d`}
                </span>
              </div>
            )}

            {!isActive && workOrder.completedAt && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{new Date(workOrder.completedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Skeleton loader
  const SkeletonCard = () => (
    <Card className="border-l-4 border-l-gray-200 animate-pulse">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-20" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        </div>
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </CardContent>
    </Card>
  )

  // Loading state
  if (isLoading && !workOrders?.length) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-lg font-semibold">Mis Ordenes</h1>
        </div>
        <div className="flex-1 p-4 space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  // Error state (only show if no cached data)
  if (error && !workOrders?.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-sm text-destructive text-center">
          {error.message || 'Error al cargar las ordenes de trabajo'}
        </p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Offline/Stale status banner */}
      <OfflineStatusBanner
        isOffline={isOffline}
        isStale={isStale}
        onRefresh={handleRefresh}
        lastSyncAt={lastSyncAt}
        isRefreshing={refreshing}
      />

      {/* Enhanced header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h1 className="text-xl font-bold">Mis Ordenes</h1>
            <p className="text-xs text-muted-foreground">
              {filteredActive.length} activa{filteredActive.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="ghost"
            size="sm"
            disabled={refreshing || isOffline}
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por numero o titulo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Quick filters */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button
              variant={filterPriority === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority(null)}
              className="flex-shrink-0 h-8 text-xs"
            >
              Todas
            </Button>
            <Button
              variant={filterPriority === 'URGENT' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority('URGENT')}
              className="flex-shrink-0 h-8 text-xs"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Urgentes
            </Button>
            <Button
              variant={filterPriority === 'HIGH' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority('HIGH')}
              className="flex-shrink-0 h-8 text-xs"
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              Alta
            </Button>
            <Button
              variant={filterPriority === 'MEDIUM' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterPriority('MEDIUM')}
              className="flex-shrink-0 h-8 text-xs"
            >
              Media
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="flex-1 flex flex-col">
        <div className="px-4 pt-3 border-b">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="active" className="text-xs">
              Activas
              {filteredActive.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs h-5 min-w-[20px] px-1.5">
                  {filteredActive.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              Historial
              {filteredHistory.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs h-5 min-w-[20px] px-1.5">
                  {filteredHistory.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab content */}
        <TabsContent value="active" className="flex-1 mt-0 overflow-y-auto">
          {filteredActive.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              {searchQuery || filterPriority ? (
                <>
                  <Filter className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-sm font-medium">Sin resultados</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No hay ordenes que coincidan con tu busqueda
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSearchQuery("")
                      setFilterPriority(null)
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-sm font-medium">Sin ordenes activas</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    No tienes ordenes de trabajo pendientes
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="p-4 space-y-3 pb-safe">
              {filteredActive.map((workOrder) => (
                <MobileWorkOrderCard key={workOrder.id} workOrder={workOrder} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1 mt-0 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-sm font-medium">Sin historial</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery || filterPriority ? 'No hay ordenes que coincidan con tu busqueda' : 'No tienes ordenes completadas aun'}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-3 pb-safe">
              {filteredHistory.map((workOrder) => (
                <MobileWorkOrderCard key={workOrder.id} workOrder={workOrder} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

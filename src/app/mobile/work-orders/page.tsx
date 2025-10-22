"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { WorkOrderTypeBadge } from "@/components/work-orders/work-order-type-badge"
import { 
  Loader2, 
  RefreshCw, 
  Calendar, 
  Building, 
  User, 
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

export default function MobileWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // Filtrar órdenes activas (draft, assigned, in_progress)
  const activeWorkOrders = workOrders.filter(wo => 
    ['DRAFT', 'ASSIGNED', 'IN_PROGRESS'].includes(wo.status)
  )

  // Filtrar historial (completed, cancelled)
  const historyWorkOrders = workOrders.filter(wo => 
    ['COMPLETED', 'CANCELLED'].includes(wo.status)
  )

  const fetchMyWorkOrders = async () => {
    try {
      setError(null)
      const response = await fetch('/api/work-orders/my')
      
      if (!response.ok) {
        throw new Error('Error al cargar las órdenes de trabajo')
      }

      const data = await response.json()
      setWorkOrders(data.workOrders || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchMyWorkOrders()
  }, [])

  const handleViewWorkOrder = (id: string) => {
    router.push(`/mobile/work-orders/${id}`)
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchMyWorkOrders()
  }

  // Componente para card de orden de trabajo optimizado para mobile
  const MobileWorkOrderCard = ({ workOrder }: { workOrder: WorkOrderWithRelations }) => {
    const isActive = ['DRAFT', 'ASSIGNED', 'IN_PROGRESS'].includes(workOrder.status)
    
    return (
      <Card 
        className="cursor-pointer transition-all hover:shadow-md active:scale-[0.98]"
        onClick={() => handleViewWorkOrder(workOrder.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {workOrder.number}
                </span>
                {isActive && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-tight">
                {workOrder.title}
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <WorkOrderStatusBadge status={workOrder.status} />
            <WorkOrderPriorityBadge priority={workOrder.priority} />
            <WorkOrderTypeBadge type={workOrder.type} />
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 text-xs text-muted-foreground">
            {workOrder.site && (
              <div className="flex items-center gap-1">
                <Building className="h-3 w-3" />
                <span className="truncate">{workOrder.site.name}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              {workOrder.scheduledDate ? (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(workOrder.scheduledDate).toLocaleDateString()}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(workOrder.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{workOrder._count?.assignments || 0}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando órdenes de trabajo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-sm text-destructive text-center">{error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header con refresh */}
      <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10 border-b">
        <h1 className="text-lg font-semibold">Mis Órdenes</h1>
        <Button 
          onClick={handleRefresh} 
          variant="ghost" 
          size="sm"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="text-xs">
              Activas
              {activeWorkOrders.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {activeWorkOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              Historial
              {historyWorkOrders.length > 0 && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {historyWorkOrders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Contenido de tabs */}
        <TabsContent value="active" className="flex-1 mt-4">
          <ScrollArea className="h-full px-4">
            {activeWorkOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-sm font-medium">Sin órdenes activas</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  No tienes órdenes de trabajo pendientes
                </p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {activeWorkOrders.map((workOrder) => (
                  <MobileWorkOrderCard key={workOrder.id} workOrder={workOrder} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" className="flex-1 mt-4">
          <ScrollArea className="h-full px-4">
            {historyWorkOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-sm font-medium">Sin historial</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  No tienes órdenes completadas aún
                </p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {historyWorkOrders.map((workOrder) => (
                  <MobileWorkOrderCard key={workOrder.id} workOrder={workOrder} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
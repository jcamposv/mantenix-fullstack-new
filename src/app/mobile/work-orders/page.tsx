"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { WorkOrderCard } from "@/components/work-orders/work-order-card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

export default function MobileWorkOrdersPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

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
    }
  }

  useEffect(() => {
    fetchMyWorkOrders()
  }, [])

  const handleViewWorkOrder = (id: string) => {
    router.push(`/mobile/work-orders/${id}`)
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchMyWorkOrders()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando órdenes de trabajo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-sm text-destructive text-center">{error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Mis Órdenes de Trabajo</h1>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {workOrders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No tienes órdenes de trabajo asignadas</p>
        </div>
      ) : (
        <div className="space-y-3">
          {workOrders.map((workOrder) => (
            <WorkOrderCard
              key={workOrder.id}
              workOrder={workOrder}
              onView={handleViewWorkOrder}
              className="w-full"
            />
          ))}
        </div>
      )}
    </div>
  )
}
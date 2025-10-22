"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { List, Plus } from "lucide-react"
import { WorkOrdersDashboard } from "@/components/dashboard/work-orders-dashboard"

export default function WorkOrdersPage() {
  const router = useRouter()

  const handleAddWorkOrder = () => {
    router.push("/work-orders/new/select-template")
  }

  const handleViewList = () => {
    router.push("/work-orders/list")
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Órdenes</h1>
            <p className="text-muted-foreground">
              Vista general y métricas de órdenes de trabajo
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleViewList}>
              <List className="h-4 w-4 mr-2" />
              Ver Lista
            </Button>
            <Button onClick={handleAddWorkOrder}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Orden
            </Button>
          </div>
        </div>
      </div>

      <WorkOrdersDashboard />
    </div>
  )
}
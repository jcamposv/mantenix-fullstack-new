"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {  ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { WorkOrderHeader } from "@/components/client/work-order/work-order-header"
import { WorkOrderOverview } from "@/components/client/work-order/work-order-overview"
import { WorkOrderTimeline } from "@/components/client/work-order/work-order-timeline"
import { WorkOrderComments } from "@/components/client/work-order/work-order-comments"
import { WorkOrderSkeleton } from "@/components/client/work-order/work-order-skeleton"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

export default function ClientWorkOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [workOrder, setWorkOrder] = useState<WorkOrderWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        const orderRes = await fetch(`/api/client/work-orders/${params.id}`)

        if (!orderRes.ok) {
          throw new Error("Error al cargar la orden de trabajo")
        }

        const orderData = await orderRes.json()
        setWorkOrder(orderData.workOrder)
      } catch (error) {
        console.error("Error fetching work order:", error)
        toast.error("Error al cargar la orden de trabajo")
        router.push("/client/work-orders")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchWorkOrder()
    }
  }, [params.id, router])

  const handleCreateAlert = () => {
    router.push(`/client/alerts/new?workOrderId=${params.id}`)
  }

  if (loading) {
    return <WorkOrderSkeleton />
  }

  if (!workOrder) {
    return null
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push("/client/work-orders")}
        className="mb-2"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver a órdenes
      </Button>

      {/* Comprehensive Header with all key details and progress */}
      <WorkOrderHeader workOrder={workOrder} onCreateAlert={handleCreateAlert} />

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Formulario de Trabajo</TabsTrigger>
          <TabsTrigger value="timeline">Cronología</TabsTrigger>
          <TabsTrigger value="comments">
            Comentarios
            {workOrder.comments && workOrder.comments.length > 0 && (
              <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {workOrder.comments.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <WorkOrderOverview workOrder={workOrder} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <WorkOrderTimeline workOrder={workOrder} />
        </TabsContent>

        <TabsContent value="comments" className="space-y-6">
          <WorkOrderComments
            workOrderId={params.id as string}
            initialComments={workOrder.comments}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

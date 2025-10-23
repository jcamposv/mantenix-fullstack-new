"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { WorkOrderTypeBadge } from "@/components/work-orders/work-order-type-badge"
import { WorkOrderBasicInfo } from "@/components/work-orders/work-order-basic-info"
import { WorkOrderScheduleInfo } from "@/components/work-orders/work-order-schedule-info"
import { WorkOrderInstructions } from "@/components/work-orders/work-order-instructions"
import { WorkOrderToolsMaterials } from "@/components/work-orders/work-order-tools-materials"
import { WorkOrderTemplateInfo } from "@/components/work-orders/work-order-template-info"
import { WorkOrderCustomFieldsDisplay } from "@/components/work-orders/work-order-custom-fields-display"
import { WorkOrderComments } from "@/components/client/work-order-comments"
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import type { CustomFieldsConfig } from "@/schemas/work-order-template"

interface WorkOrderComment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string
    email: string
  }
}

export default function ClientWorkOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [workOrder, setWorkOrder] = useState<WorkOrderWithRelations | null>(null)
  const [comments, setComments] = useState<WorkOrderComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        const orderRes = await fetch(`/api/client/work-orders/${params.id}`)

        if (!orderRes.ok) {
          throw new Error("Error al cargar la orden de trabajo")
        }

        const orderData = await orderRes.json()

        setWorkOrder(orderData.workOrder)
        // Comments will be supported when WorkOrderComment model is added
        setComments([])
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAddComment = async (_content: string) => {
    // TODO: Implement when WorkOrderComment model is added to schema
    toast.info("Funcionalidad de comentarios próximamente disponible")
    throw new Error("Not implemented yet")
  }

  const handleCreateAlert = () => {
    router.push(`/client/alerts/new?workOrderId=${params.id}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-6xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!workOrder) {
    return null
  }

  const customFieldValues = workOrder.customFieldValues as Record<string, unknown> || {}

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{workOrder.number}</h1>
            <p className="text-muted-foreground">{workOrder.title}</p>
          </div>
          <Button onClick={handleCreateAlert} variant="outline">
            <AlertCircle className="mr-2 h-4 w-4" />
            Crear Alerta
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Estado y Prioridad */}
          <Card>
            <CardHeader>
              <CardTitle>Estado y Prioridad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Estado</p>
                  <WorkOrderStatusBadge status={workOrder.status} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Prioridad</p>
                  <WorkOrderPriorityBadge priority={workOrder.priority} showIcon />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tipo</p>
                  <WorkOrderTypeBadge type={workOrder.type} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Componentes reutilizables */}
          <WorkOrderBasicInfo workOrder={workOrder} />
          <WorkOrderScheduleInfo workOrder={workOrder} />
          <WorkOrderInstructions workOrder={workOrder} />
          <WorkOrderToolsMaterials workOrder={workOrder} />

          {/* Custom Fields */}
          {Object.keys(customFieldValues).length > 0 && workOrder.template?.customFields && (
            <Card>
              <CardHeader>
                <CardTitle>Campos Personalizados</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkOrderCustomFieldsDisplay
                  customFields={workOrder.template.customFields as { fields: NonNullable<CustomFieldsConfig['fields']> }}
                  customFieldValues={customFieldValues}
                />
              </CardContent>
            </Card>
          )}

          <WorkOrderTemplateInfo workOrder={workOrder} />
        </div>

        <div className="space-y-6">
          <WorkOrderComments
            workOrderId={params.id as string}
            comments={comments}
            onAddComment={handleAddComment}
            loading={loading}
          />

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <label className="font-medium">Creado</label>
                <p className="text-muted-foreground">
                  {new Date(workOrder.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="font-medium">Última actualización</label>
                <p className="text-muted-foreground">
                  {new Date(workOrder.updatedAt).toLocaleDateString()}
                </p>
              </div>
              {workOrder.completedAt && (
                <div>
                  <label className="font-medium">Completado</label>
                  <p className="text-muted-foreground">
                    {new Date(workOrder.completedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { WorkOrderConsolidatedInfo } from "@/components/work-orders/work-order-consolidated-info"
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
      <div className="container mx-auto py-0 max-w-6xl">
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
    <div className="container mx-auto py-0 max-w-6xl">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          {/* Consolidated Info Card */}
          <WorkOrderConsolidatedInfo workOrder={workOrder} />

          <WorkOrderToolsMaterials workOrder={workOrder} />

          {/* Custom Fields - Each field has its own card */}
          {Object.keys(customFieldValues).length > 0 && workOrder.template?.customFields && (
            <WorkOrderCustomFieldsDisplay
              customFields={workOrder.template.customFields as { fields: NonNullable<CustomFieldsConfig['fields']> }}
              customFieldValues={customFieldValues}
            />
          )}

          <WorkOrderTemplateInfo workOrder={workOrder} />
        </div>

        <div className="space-y-4">
          <WorkOrderComments
            workOrderId={params.id as string}
            comments={comments}
            onAddComment={handleAddComment}
            loading={loading}
          />

          <Card>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-lg font-semibold">Información del Sistema</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Creado</label>
                  <p className="text-sm font-medium">
                    {new Date(workOrder.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Última actualización</label>
                  <p className="text-sm font-medium">
                    {new Date(workOrder.updatedAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {workOrder.completedAt && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completado</label>
                    <p className="text-sm font-medium">
                      {new Date(workOrder.completedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

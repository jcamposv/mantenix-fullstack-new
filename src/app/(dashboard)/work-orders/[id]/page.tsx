"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit, User } from "lucide-react"
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
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import type { CustomFieldsConfig } from "@/schemas/work-order-template"

export default function WorkOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [workOrder, setWorkOrder] = useState<WorkOrderWithRelations | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkOrder = async () => {
      try {
        const response = await fetch(`/api/work-orders/${params.id}`)
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Error al cargar la orden de trabajo')
        }

        const data = await response.json()
        setWorkOrder(data.workOrder)
      } catch (error) {
        console.error('Error fetching work order:', error)
        toast.error(error instanceof Error ? error.message : 'Error al cargar la orden de trabajo')
        router.push('/work-orders')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchWorkOrder()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!workOrder) {
    return null
  }

  const customFieldValues = workOrder.customFieldValues as Record<string, unknown> || {}

  return (
    <div className="py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{workOrder.number}</h1>
            <p className="text-muted-foreground">{workOrder.title}</p>
          </div>
          <Button onClick={() => router.push(`/work-orders/${workOrder.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Status and Priority */}
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

        {/* Assignments */}
        {workOrder.assignments && workOrder.assignments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Usuarios Asignados ({workOrder.assignments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {workOrder.assignments.map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="text-sm font-medium">{assignment.user.name}</p>
                      <p className="text-xs text-muted-foreground">{assignment.user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Asignado: {new Date(assignment.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <WorkOrderInstructions workOrder={workOrder} />
        <WorkOrderToolsMaterials workOrder={workOrder} />

        {/* Custom Fields */}
        {Object.keys(customFieldValues).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkOrderCustomFieldsDisplay
                customFields={workOrder.template?.customFields as { fields: NonNullable<CustomFieldsConfig['fields']> }}
                customFieldValues={customFieldValues}
              />
            </CardContent>
          </Card>
        )}

        <WorkOrderTemplateInfo workOrder={workOrder} />

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="font-medium">Creado por</label>
                <p className="text-muted-foreground">{workOrder.creator?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="font-medium">Fecha de creación</label>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, User, Building, Wrench, Clock, DollarSign, FileText, Shield } from "lucide-react"
import { toast } from "sonner"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { WorkOrderTypeBadge } from "@/components/work-orders/work-order-type-badge"
import { WorkOrderCustomFieldsDisplay } from "@/components/work-orders/work-order-custom-fields-display"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

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

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Descripción</label>
              <p className="text-sm text-muted-foreground mt-1">
                {workOrder.description || 'Sin descripción'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Sede</p>
                  <p className="text-sm text-muted-foreground">
                    {workOrder.site?.name || 'N/A'}
                  </p>
                </div>
              </div>
              
              {workOrder.asset && (
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Activo</p>
                    <p className="text-sm text-muted-foreground">
                      {workOrder.asset.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Código: {workOrder.asset.code}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Scheduling and Estimates */}
        <Card>
          <CardHeader>
            <CardTitle>Programación y Estimaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {workOrder.scheduledDate && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fecha Programada</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(workOrder.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              {workOrder.estimatedDuration && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duración Estimada</p>
                    <p className="text-sm text-muted-foreground">
                      {workOrder.estimatedDuration} horas
                    </p>
                  </div>
                </div>
              )}
              
              {workOrder.estimatedCost && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Costo Estimado</p>
                    <p className="text-sm text-muted-foreground">
                      ${workOrder.estimatedCost}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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

        {/* Instructions and Safety */}
        {(workOrder.instructions || workOrder.safetyNotes) && (
          <Card>
            <CardHeader>
              <CardTitle>Instrucciones y Seguridad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workOrder.instructions && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Instrucciones de Trabajo</label>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {workOrder.instructions}
                  </p>
                </div>
              )}
              
              {workOrder.safetyNotes && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Notas de Seguridad</label>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {workOrder.safetyNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tools and Materials */}
        {((workOrder.tools && workOrder.tools.length > 0) || (workOrder.materials && workOrder.materials.length > 0)) && (
          <Card>
            <CardHeader>
              <CardTitle>Herramientas y Materiales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {workOrder.tools && workOrder.tools.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Herramientas Requeridas</h4>
                    <div className="space-y-1">
                      {workOrder.tools.map((tool, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {tool}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {workOrder.materials && workOrder.materials.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Materiales Necesarios</h4>
                    <div className="space-y-1">
                      {workOrder.materials.map((material, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          • {material}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Custom Fields */}
        {Object.keys(customFieldValues).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Campos Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkOrderCustomFieldsDisplay
                customFields={workOrder.template?.customFields}
                customFieldValues={customFieldValues}
              />
            </CardContent>
          </Card>
        )}

        {/* Template Information */}
        {workOrder.template && (
          <Card>
            <CardHeader>
              <CardTitle>Template Utilizado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <label className="text-sm font-medium">Nombre del Template</label>
                  <p className="text-sm text-muted-foreground">{workOrder.template.name}</p>
                </div>
                {workOrder.template.category && (
                  <div>
                    <label className="text-sm font-medium">Categoría</label>
                    <Badge variant="outline" className="ml-2">{workOrder.template.category}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

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
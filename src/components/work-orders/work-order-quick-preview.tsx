"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ExternalLink, User, Building, Wrench, Calendar, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { WorkOrderStatusBadge } from "./work-order-status-badge"
import { WorkOrderPriorityBadge } from "./work-order-priority-badge"
import { WorkOrderTypeBadge } from "./work-order-type-badge"
import { UserAssignmentSelect } from "./user-assignment-select"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface WorkOrderQuickPreviewProps {
  workOrderId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate?: () => void
}

export function WorkOrderQuickPreview({
  workOrderId,
  open,
  onOpenChange,
  onUpdate,
}: WorkOrderQuickPreviewProps) {
  const router = useRouter()
  const [workOrder, setWorkOrder] = useState<WorkOrderWithRelations | null>(null)
  const [loading, setLoading] = useState(false)
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>([])
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!workOrderId || !open) {
      setWorkOrder(null)
      return
    }

    const fetchWorkOrder = async () => {
      try {
        setLoading(true)
        console.log("Fetching work order:", workOrderId)
        const response = await fetch(`/api/work-orders/${workOrderId}`)

        if (!response.ok) {
          console.error("Response not ok:", response.status)
          throw new Error("Error al cargar orden")
        }

        const data = await response.json()
        console.log("Work order data:", data)
        // API returns { workOrder: {...} }, extract it
        const wo = data.workOrder || data
        setWorkOrder(wo)

        // Set current assignments
        if (wo.assignments && wo.assignments.length > 0) {
          const userIds = wo.assignments.map((a: { userId: string }) => a.userId)
          console.log("Setting initial assigned users:", userIds, wo.assignments)
          setAssignedUserIds(userIds)
        } else {
          setAssignedUserIds([])
        }
      } catch (error) {
        console.error("Error fetching work order:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkOrder()
  }, [workOrderId, open])

  const handleUpdateAssignments = async () => {
    if (!workOrderId) return

    try {
      setIsUpdating(true)
      console.log("Updating with assignedUserIds:", assignedUserIds)

      const response = await fetch(`/api/work-orders/${workOrderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedUserIds
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Update failed:", errorData)
        throw new Error(errorData.error || "Error al actualizar asignaciones")
      }

      const updateResult = await response.json()
      console.log("Update result:", updateResult)

      toast.success("Asignaciones actualizadas exitosamente")
      onUpdate?.() // Trigger calendar refresh

      // Refetch work order to show updated data
      const fetchResponse = await fetch(`/api/work-orders/${workOrderId}`)
      if (fetchResponse.ok) {
        const data = await fetchResponse.json()
        const wo = data.workOrder || data
        console.log("Refetched work order:", wo)
        setWorkOrder(wo)

        // Update assigned users state
        if (wo.assignments && wo.assignments.length > 0) {
          const newUserIds = wo.assignments.map((a: { userId: string }) => a.userId)
          console.log("Updating assignedUserIds to:", newUserIds)
          setAssignedUserIds(newUserIds)
        } else {
          console.log("No assignments, clearing")
          setAssignedUserIds([])
        }
      }
    } catch (error) {
      console.error("Error updating assignments:", error)
      toast.error(error instanceof Error ? error.message : "Error al actualizar asignaciones")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleViewDetails = () => {
    if (workOrderId) {
      router.push(`/work-orders/${workOrderId}`)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vista Rápida de Orden de Trabajo
          </DialogTitle>
        </DialogHeader>

        <div className="min-h-[300px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Cargando orden de trabajo...</p>
            </div>
          ) : workOrder ? (
          <div className="space-y-4">
            {/* Header with number and badges */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">{workOrder.number}</h3>
                <p className="text-lg text-muted-foreground mt-1">{workOrder.title}</p>
              </div>
              <div className="flex flex-col gap-2">
                <WorkOrderStatusBadge status={workOrder.status} />
                <WorkOrderPriorityBadge priority={workOrder.priority} />
                <WorkOrderTypeBadge type={workOrder.type} />
              </div>
            </div>

            {/* Key info grid */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              {workOrder.assignments && workOrder.assignments.length > 0 && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Asignado a</p>
                    <p className="text-sm font-medium">
                      {workOrder.assignments[0].user.name}
                      {workOrder.assignments.length > 1 && ` +${workOrder.assignments.length - 1}`}
                    </p>
                  </div>
                </div>
              )}

              {workOrder.site && (
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Sede</p>
                    <p className="text-sm font-medium">{workOrder.site.name}</p>
                  </div>
                </div>
              )}

              {workOrder.asset && (
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Activo</p>
                    <p className="text-sm font-medium">{workOrder.asset.name}</p>
                  </div>
                </div>
              )}

              {workOrder.scheduledDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Fecha programada</p>
                    <p className="text-sm font-medium">
                      {new Date(workOrder.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description preview */}
            {workOrder.description && (
              <div>
                <p className="text-sm font-medium mb-1">Descripción</p>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {workOrder.description}
                </p>
              </div>
            )}

            <Separator />

            {/* User Assignment Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h4 className="text-sm font-medium">Asignar Usuarios</h4>
              </div>

              <UserAssignmentSelect
                value={assignedUserIds}
                onChange={setAssignedUserIds}
                disabled={isUpdating}
                placeholder="Seleccionar usuarios para asignar..."
              />

              <Button
                onClick={handleUpdateAssignments}
                disabled={isUpdating}
                variant="outline"
                size="sm"
                className="w-full"
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Actualizar Asignaciones
              </Button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cerrar
              </Button>
              <Button onClick={handleViewDetails}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver detalles completos
              </Button>
            </div>
          </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No se pudo cargar la orden de trabajo</p>
              <p className="text-xs text-muted-foreground mt-2">ID: {workOrderId}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

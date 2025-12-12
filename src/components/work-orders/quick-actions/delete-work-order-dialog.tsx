"use client"

import { useState } from "react"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { toast } from "sonner"

interface DeleteWorkOrderDialogProps {
  workOrderId: string | null
  workOrderNumber?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

/**
 * DeleteWorkOrderDialog
 * Confirms and deletes a work order
 * Uses ConfirmDialog for simple confirmation
 */
export function DeleteWorkOrderDialog({
  workOrderId,
  workOrderNumber,
  open,
  onOpenChange,
  onSuccess,
}: DeleteWorkOrderDialogProps) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async (): Promise<void> => {
    if (!workOrderId) return

    try {
      setLoading(true)

      const response = await fetch(`/api/work-orders/${workOrderId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar orden")
      }

      toast.success("Orden eliminada exitosamente")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error("Error deleting work order:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar orden")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Eliminar Orden de Trabajo"
      description={
        workOrderNumber
          ? `¿Estás seguro de eliminar la orden ${workOrderNumber}? Esta acción no se puede deshacer.`
          : "¿Estás seguro de eliminar esta orden de trabajo? Esta acción no se puede deshacer."
      }
      confirmText="Eliminar"
      cancelText="Cancelar"
      variant="destructive"
      onConfirm={handleDelete}
      loading={loading}
    />
  )
}

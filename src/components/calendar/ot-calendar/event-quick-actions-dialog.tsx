"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit, Users, Eye, Trash2 } from "lucide-react"

interface EventQuickActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrderNumber?: string
  onEdit: () => void
  onAssign: () => void
  onView: () => void
  onDelete: () => void
}

/**
 * EventQuickActionsDialog
 * Shows quick action options when clicking on a work order event
 */
export function EventQuickActionsDialog({
  open,
  onOpenChange,
  workOrderNumber,
  onEdit,
  onAssign,
  onView,
  onDelete,
}: EventQuickActionsDialogProps) {
  const handleAction = (action: () => void) => {
    onOpenChange(false)
    action()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Acciones de Orden de Trabajo</DialogTitle>
          {workOrderNumber && (
            <DialogDescription>Orden: {workOrderNumber}</DialogDescription>
          )}
        </DialogHeader>

        <div className="grid gap-2 py-4">
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleAction(onEdit)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Editar orden
          </Button>

          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleAction(onAssign)}
          >
            <Users className="mr-2 h-4 w-4" />
            Asignar técnicos
          </Button>

          <Button
            variant="outline"
            className="justify-start"
            onClick={() => handleAction(onView)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Ver detalles completos
          </Button>

          <Button
            variant="outline"
            className="justify-start text-destructive hover:text-destructive border-destructive/50"
            onClick={() => handleAction(onDelete)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar orden
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

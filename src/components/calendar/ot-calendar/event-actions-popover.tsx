"use client"

import { useState } from "react"
import {
  Popover,
  PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Edit, Users, Eye, Trash2 } from "lucide-react"

interface EventActionsPopoverProps {
  workOrderId: string
  workOrderNumber: string
  onEdit: () => void
  onAssign: () => void
  onView: () => void
  onDelete: () => void
}

/**
 * EventActionsPopover
 * Popover shown when clicking on a work order event
 * Provides quick action buttons
 */
export function EventActionsPopover({
  workOrderNumber,
  onEdit,
  onAssign,
  onView,
  onDelete,
}: EventActionsPopoverProps) {
  const [open, setOpen] = useState(true)

  const handleAction = (action: () => void) => {
    action()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-2">
          <div className="font-semibold text-sm border-b pb-2">
            {workOrderNumber}
          </div>

          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleAction(onEdit)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar orden
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleAction(onAssign)}
            >
              <Users className="mr-2 h-4 w-4" />
              Asignar técnicos
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleAction(onView)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Ver detalles completos
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={() => handleAction(onDelete)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar orden
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

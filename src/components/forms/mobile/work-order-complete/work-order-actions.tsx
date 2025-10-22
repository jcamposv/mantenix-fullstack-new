"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Play, Pause } from "lucide-react"
import type { WorkOrderStatus } from "@/schemas/work-order"

interface WorkOrderActionsProps {
  status: WorkOrderStatus
  onStartWork: () => Promise<void>
  onToggleForm: () => void
  showForm: boolean
  isUpdating: boolean
}

export function WorkOrderActions({
  status,
  onStartWork,
  onToggleForm,
  showForm,
  isUpdating
}: WorkOrderActionsProps) {
  const canStartWork = ['DRAFT', 'PENDING', 'ASSIGNED'].includes(status)
  const canCompleteWork = status === 'IN_PROGRESS'
  const isCompleted = ['COMPLETED', 'CANCELLED'].includes(status)

  if (isCompleted) {
    return null
  }

  return (
    <>
      {canStartWork && (
        <>
          <Separator />
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Iniciar Trabajo</h4>
            <Button
              onClick={onStartWork}
              disabled={isUpdating}
              className="w-full"
              size="sm"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Play className="mr-2 h-4 w-4" />
              )}
              Comenzar Trabajo
            </Button>
          </div>
        </>
      )}

      {canCompleteWork && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Estado del Trabajo</h4>
              <Badge variant="outline" className="bg-blue-50">
                <Pause className="mr-1 h-3 w-3" />
                En Progreso
              </Badge>
            </div>
            <Button
              onClick={onToggleForm}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {showForm ? "Ocultar Formulario" : "Llenar Formulario de Trabajo"}
            </Button>
          </div>
        </>
      )}
    </>
  )
}
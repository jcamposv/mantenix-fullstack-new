import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import type { WorkOrderStatus } from "@/schemas/work-order"

interface WorkOrderProgressProps {
  workOrder: WorkOrderWithRelations
}

interface ProgressStep {
  id: WorkOrderStatus
  label: string
  description: string
  icon: typeof Circle
}

const PROGRESS_STEPS: ProgressStep[] = [
  {
    id: "DRAFT",
    label: "Creada",
    description: "Orden creada",
    icon: Circle
  },
  {
    id: "ASSIGNED",
    label: "Asignada",
    description: "Técnico asignado",
    icon: Circle
  },
  {
    id: "IN_PROGRESS",
    label: "En progreso",
    description: "Trabajo iniciado",
    icon: Clock
  },
  {
    id: "COMPLETED",
    label: "Completada",
    description: "Trabajo finalizado",
    icon: CheckCircle2
  }
]

function getProgressPercentage(status: WorkOrderStatus): number {
  const statusMap: Record<WorkOrderStatus, number> = {
    DRAFT: 25,
    ASSIGNED: 50,
    IN_PROGRESS: 75,
    COMPLETED: 100,
    CANCELLED: 0
  }
  return statusMap[status] || 0
}

function getStatusIndex(status: WorkOrderStatus): number {
  return PROGRESS_STEPS.findIndex(step => step.id === status)
}

export function WorkOrderProgress({ workOrder }: WorkOrderProgressProps) {
  const { status } = workOrder
  const currentIndex = getStatusIndex(status)
  const progress = getProgressPercentage(status)
  const isCancelled = status === "CANCELLED"

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/50 bg-destructive/5">
        <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
        <p className="text-sm font-medium text-destructive">Orden Cancelada</p>
      </div>
    )
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Progress Bar con pasos inline */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Estado</span>
              <span className="text-xs font-semibold text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>

          {/* Steps compactos */}
          <div className="flex items-center justify-between">
            {PROGRESS_STEPS.map((step, index) => {
              const isActive = index === currentIndex
              const isCompleted = index < currentIndex
              const Icon = step.icon

              return (
                <div key={step.id} className="flex flex-col items-center gap-1 flex-1">
                  <div className={cn(
                    "p-1.5 rounded-full transition-colors",
                    isActive && "bg-primary/10 ring-2 ring-primary/30",
                    isCompleted && "bg-green-100",
                    !isActive && !isCompleted && "bg-muted"
                  )}>
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5",
                        isActive && "text-primary",
                        isCompleted && "text-green-600",
                        !isActive && !isCompleted && "text-muted-foreground"
                      )}
                    />
                  </div>
                  <p className={cn(
                    "text-xs font-medium text-center",
                    isActive && "text-primary",
                    isCompleted && "text-foreground",
                    !isActive && !isCompleted && "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Time Information compacta */}
          {(workOrder.startedAt || workOrder.completedAt) && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              {workOrder.startedAt && (
                <span>
                  Inicio: {new Date(workOrder.startedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </span>
              )}
              {workOrder.completedAt && (
                <span>
                  Fin: {new Date(workOrder.completedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

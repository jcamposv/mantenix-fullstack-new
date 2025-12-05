import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CheckCircle,
  Circle,
  Clock,
  FileText,
  Play,
  UserPlus,
  XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface WorkOrderTimelineProps {
  workOrder: WorkOrderWithRelations
}

interface TimelineEvent {
  id: string
  title: string
  description: string
  timestamp: Date
  type: "created" | "assigned" | "started" | "completed" | "cancelled"
  icon: typeof Circle
  iconColor: string
}

export function WorkOrderTimeline({ workOrder }: WorkOrderTimelineProps) {
  const events: TimelineEvent[] = []

  // Created event
  events.push({
    id: "created",
    title: "Orden Creada",
    description: `Orden de trabajo #${workOrder.number} fue creada`,
    timestamp: new Date(workOrder.createdAt),
    type: "created",
    icon: FileText,
    iconColor: "text-blue-600"
  })

  // Assigned events
  if (workOrder.assignments && workOrder.assignments.length > 0) {
    workOrder.assignments.forEach((assignment) => {
      events.push({
        id: `assigned-${assignment.id}`,
        title: "Técnico Asignado",
        description: `${assignment.user.name} fue asignado a esta orden`,
        timestamp: new Date(assignment.assignedAt),
        type: "assigned",
        icon: UserPlus,
        iconColor: "text-purple-600"
      })
    })
  }

  // Started event
  if (workOrder.startedAt) {
    events.push({
      id: "started",
      title: "Trabajo Iniciado",
      description: "El trabajo en esta orden ha comenzado",
      timestamp: new Date(workOrder.startedAt),
      type: "started",
      icon: Play,
      iconColor: "text-orange-600"
    })
  }

  // Completed event
  if (workOrder.completedAt) {
    events.push({
      id: "completed",
      title: "Orden Completada",
      description: "La orden de trabajo ha sido completada exitosamente",
      timestamp: new Date(workOrder.completedAt),
      type: "completed",
      icon: CheckCircle,
      iconColor: "text-green-600"
    })
  }

  // Cancelled event
  if (workOrder.status === "CANCELLED") {
    events.push({
      id: "cancelled",
      title: "Orden Cancelada",
      description: workOrder.completionNotes || "La orden fue cancelada",
      timestamp: new Date(workOrder.updatedAt),
      type: "cancelled",
      icon: XCircle,
      iconColor: "text-red-600"
    })
  }

  // Sort events by timestamp (most recent first)
  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-base font-medium">Cronología de Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay eventos registrados aún</p>
          </div>
        ) : (
          <div className="relative space-y-4">
            {/* Timeline line */}
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-border" />

            {events.map((event) => {
              const Icon = event.icon

              return (
                <div key={event.id} className="relative flex gap-4 pb-4">
                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-background",
                    event.iconColor
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{event.title}</h4>
                      <time className="text-xs text-muted-foreground whitespace-nowrap">
                        {event.timestamp.toLocaleString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </time>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary Stats */}
        {workOrder.startedAt && workOrder.completedAt && (
          <div className="mt-6 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Tiempo Total</p>
                <p className="text-sm font-semibold">
                  {calculateDuration(workOrder.startedAt, workOrder.completedAt)}
                </p>
              </div>
              {workOrder.actualDuration && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Tiempo de Trabajo</p>
                  <p className="text-sm font-semibold">
                    {workOrder.actualDuration}h
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function calculateDuration(start: string | Date, end: string | Date): string {
  const startDate = new Date(start)
  const endDate = new Date(end)
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (diffHours === 0) {
    return `${diffMinutes} minutos`
  }
  return `${diffHours}h ${diffMinutes}m`
}

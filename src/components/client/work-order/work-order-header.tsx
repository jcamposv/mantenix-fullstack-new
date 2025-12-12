"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { WorkOrderTypeBadge } from "@/components/work-orders/work-order-type-badge"
import {
  AlertCircle,
  Building,
  Calendar,
  Clock,
  Box,
  MapPin,
  ChevronDown,
  ChevronUp,
  User,
  ClipboardList,
  CheckCircle2,
  Circle
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkOrderWithRelations, WorkOrderStatus as FullWorkOrderStatus } from "@/types/work-order.types"
import type { WorkOrderStatus } from "@/schemas/work-order"

interface WorkOrderHeaderProps {
  workOrder: WorkOrderWithRelations
  onCreateAlert: () => void
}

interface ProgressStep {
  id: WorkOrderStatus
  label: string
  icon: typeof Circle
}

const PROGRESS_STEPS: ProgressStep[] = [
  { id: "DRAFT", label: "Creada", icon: Circle },
  { id: "ASSIGNED", label: "Asignada", icon: Circle },
  { id: "IN_PROGRESS", label: "En progreso", icon: Clock },
  { id: "COMPLETED", label: "Completada", icon: CheckCircle2 }
]

/**
 * Map full WorkOrderStatus (including workflow statuses) to progress-compatible status
 */
function mapStatusToProgressStatus(status: FullWorkOrderStatus): WorkOrderStatus {
  const validStatuses: WorkOrderStatus[] = ["DRAFT", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
  if (validStatuses.includes(status as WorkOrderStatus)) {
    return status as WorkOrderStatus
  }
  // Map workflow statuses to progress-compatible statuses
  switch (status) {
    case "PENDING_APPROVAL":
    case "APPROVED":
      return "ASSIGNED"
    case "REJECTED":
      return "DRAFT"
    case "PENDING_QA":
      return "COMPLETED"
    default:
      return "DRAFT"
  }
}

function getProgressPercentage(status: FullWorkOrderStatus): number {
  const progressStatus = mapStatusToProgressStatus(status)
  const statusMap: Record<WorkOrderStatus, number> = {
    DRAFT: 25,
    ASSIGNED: 50,
    IN_PROGRESS: 75,
    COMPLETED: 100,
    CANCELLED: 0
  }
  return statusMap[progressStatus] || 0
}

function getStatusIndex(status: FullWorkOrderStatus): number {
  const progressStatus = mapStatusToProgressStatus(status)
  return PROGRESS_STEPS.findIndex(step => step.id === progressStatus)
}

export function WorkOrderHeader({ workOrder, onCreateAlert }: WorkOrderHeaderProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  const progress = getProgressPercentage(workOrder.status)
  const currentIndex = getStatusIndex(workOrder.status)
  const isCancelled = workOrder.status === "CANCELLED"
  const hasAssignments = workOrder.assignments && workOrder.assignments.length > 0

  return (
    <Card className="shadow-none">
      <CardContent className="p-6 space-y-6">
        {/* Top Row: Number, Status, Action Button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{workOrder.number}</h1>
            <WorkOrderStatusBadge status={workOrder.status} />
          </div>

          <Button onClick={onCreateAlert} variant="outline" size="sm" className="shrink-0">
            <AlertCircle className="mr-2 h-4 w-4" />
            Reportar Incidencia
          </Button>
        </div>

        {/* Title Section */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            {workOrder.title || "Sin título"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <WorkOrderTypeBadge type={workOrder.type} />
            <WorkOrderPriorityBadge priority={workOrder.priority} />
          </div>
        </div>

        {/* Progress Section */}
        {!isCancelled && (
          <div className="space-y-3 p-4 rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Progreso</span>
              <span className="text-sm font-bold text-primary">{progress}%</span>
            </div>

            <Progress value={progress} className="h-1.5" />

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
                      <Icon className={cn(
                        "h-3 w-3",
                        isActive && "text-primary",
                        isCompleted && "text-green-600",
                        !isActive && !isCompleted && "text-muted-foreground"
                      )} />
                    </div>
                    <p className={cn(
                      "text-[10px] font-medium text-center",
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

            {/* Technician Assignments */}
            {hasAssignments && (
              <div className="flex items-center gap-2 text-xs pt-2 border-t">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">Asignado a:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {workOrder.assignments!.map((assignment) => (
                    <Badge key={assignment.id} variant="secondary" className="text-[10px] py-0 px-2 h-5">
                      {assignment.user.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancelled Message */}
        {isCancelled && (
          <div className="flex items-center gap-2 p-3 rounded-lg border border-destructive/50 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            <p className="text-sm font-medium text-destructive">Orden Cancelada</p>
          </div>
        )}

        {/* Key Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/20">
          {/* Site Information */}
          {workOrder.site && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Building className="h-3.5 w-3.5" />
                Sede
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{workOrder.site.name}</p>
                {workOrder.site.address && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                    <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                    <span>{workOrder.site.address}</span>
                  </p>
                )}
                {workOrder.site.clientCompany && (
                  <p className="text-xs text-muted-foreground">
                    {workOrder.site.clientCompany.name}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Asset Information */}
          {workOrder.asset && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Box className="h-3.5 w-3.5" />
                Equipo/Activo
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">{workOrder.asset.name}</p>
                {workOrder.asset.code && (
                  <p className="text-xs text-muted-foreground">
                    Código: <span className="font-mono">{workOrder.asset.code}</span>
                  </p>
                )}
                {workOrder.asset.manufacturer && workOrder.asset.model && (
                  <p className="text-xs text-muted-foreground">
                    {workOrder.asset.manufacturer} - {workOrder.asset.model}
                  </p>
                )}
                {workOrder.asset.status && (
                  <Badge variant="outline" className="text-[10px] h-5">
                    {workOrder.asset.status}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Schedule & Duration */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <Calendar className="h-3.5 w-3.5" />
              Programación
            </div>
            <div className="space-y-1.5">
              {workOrder.scheduledDate && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground min-w-[60px]">Programada:</span>
                  <span className="text-xs font-medium">
                    {new Date(workOrder.scheduledDate).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {workOrder.estimatedDuration && (
                <div className="flex items-start gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground mt-0.5" />
                  <span className="text-xs font-medium">{workOrder.estimatedDuration}h estimadas</span>
                </div>
              )}
              {workOrder.startedAt && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground min-w-[60px]">Iniciada:</span>
                  <span className="text-xs font-medium">
                    {new Date(workOrder.startedAt).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
              {workOrder.completedAt && (
                <div className="flex items-start gap-2">
                  <span className="text-xs text-green-600 min-w-[60px]">Completada:</span>
                  <span className="text-xs font-medium text-green-600">
                    {new Date(workOrder.completedAt).toLocaleDateString('es-ES', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Expandable Instructions Section */}
        {workOrder.instructions && (
          <div className="border rounded-lg overflow-hidden">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Instrucciones de Trabajo</span>
              </div>
              {showInstructions ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {showInstructions && (
              <div className="p-4 pt-0 border-t bg-muted/10">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {workOrder.instructions}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Expandable Completion Notes */}
        {workOrder.completionNotes && (
          <div className="border border-green-200 rounded-lg overflow-hidden bg-green-50/30">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="w-full flex items-center justify-between p-3 hover:bg-green-100/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Notas de Finalización</span>
              </div>
              {showNotes ? (
                <ChevronUp className="h-4 w-4 text-green-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-green-600" />
              )}
            </button>
            {showNotes && (
              <div className="p-4 pt-0 border-t border-green-200">
                <p className="text-sm text-green-900/80 whitespace-pre-wrap">
                  {workOrder.completionNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Observations */}
        {workOrder.observations && (
          <div className="p-4 rounded-lg border bg-amber-50/30 border-amber-200">
            <p className="text-xs font-semibold text-amber-900 mb-2">OBSERVACIONES</p>
            <p className="text-sm text-amber-900/80 whitespace-pre-wrap">
              {workOrder.observations}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

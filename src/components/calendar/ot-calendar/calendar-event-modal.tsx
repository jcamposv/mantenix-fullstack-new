"use client"

import { JSX } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Package, Users, Clock, TrendingUp } from "lucide-react"
import type { CalendarEvent } from "@/types/calendar.types"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface CalendarEventModalProps {
  event: CalendarEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewDetails?: () => void
}

/**
 * CalendarEventModal Component
 * Contextual modal that displays different content based on event type
 * - Schedule events show recurrence info and completion rate
 * - Work order events show status, priority, and assigned technicians
 *
 * Follows SOLID principles with clear separation of concerns
 */
export function CalendarEventModal({
  event,
  open,
  onOpenChange,
  onViewDetails,
}: CalendarEventModalProps): JSX.Element {
  if (!event) {
    return <></>
  }

  const isSchedule = event.extendedProps.type === "schedule"
  const isWorkOrder = event.extendedProps.type === "workOrder"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isSchedule ? "📅" : "🔧"}
            <span className="truncate">{event.title}</span>
          </DialogTitle>
          <DialogDescription>
            {isSchedule
              ? "Programación de Mantenimiento Preventivo"
              : "Orden de Trabajo"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Schedule-specific content */}
          {isSchedule && (
            <ScheduleEventContent event={event} />
          )}

          {/* Work Order-specific content */}
          {isWorkOrder && (
            <WorkOrderEventContent event={event} />
          )}

          {/* Common fields */}
          <CommonEventContent event={event} />

          {/* Actions */}
          <Separator />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            {onViewDetails && (
              <Button onClick={onViewDetails}>
                Ver Detalles Completos
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Schedule Event Content
 * Displays schedule-specific information
 */
function ScheduleEventContent({ event }: { event: CalendarEvent }): JSX.Element {
  const { recurrenceType, completionRate, templateName } = event.extendedProps

  return (
    <div className="space-y-3">
      <InfoRow
        icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        label="Tipo de Recurrencia"
        value={getRecurrenceTypeLabel(recurrenceType)}
      />

      {templateName && (
        <InfoRow
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          label="Template"
          value={templateName}
        />
      )}

      {completionRate !== undefined && (
        <InfoRow
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          label="Tasa de Completación"
          value={`${completionRate.toFixed(0)}%`}
        />
      )}
    </div>
  )
}

/**
 * Work Order Event Content
 * Displays work order-specific information
 */
function WorkOrderEventContent({ event }: { event: CalendarEvent }): JSX.Element {
  const { status, priority, number, assignedTechnicians } = event.extendedProps

  return (
    <div className="space-y-3">
      {number && (
        <InfoRow
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          label="Número de Orden"
          value={number}
        />
      )}

      <div className="flex items-center gap-4">
        {status && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Estado:</span>
            <Badge variant={getStatusVariant(status)}>
              {getStatusLabel(status)}
            </Badge>
          </div>
        )}

        {priority && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Prioridad:</span>
            <Badge variant={getPriorityVariant(priority)}>
              {getPriorityLabel(priority)}
            </Badge>
          </div>
        )}
      </div>

      {assignedTechnicians && assignedTechnicians.length > 0 && (
        <InfoRow
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          label="Técnicos Asignados"
          value={
            <div className="flex flex-col gap-1">
              {assignedTechnicians.map((tech) => (
                <span key={tech.id} className="text-sm">
                  {tech.name}
                </span>
              ))}
            </div>
          }
        />
      )}
    </div>
  )
}

/**
 * Common Event Content
 * Information shown for both schedules and work orders
 */
function CommonEventContent({ event }: { event: CalendarEvent }): JSX.Element {
  const { assetName, siteName, description } = event.extendedProps
  const startDate = typeof event.start === "string" ? new Date(event.start) : event.start

  return (
    <div className="space-y-3">
      <Separator />

      <InfoRow
        icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
        label="Fecha"
        value={format(startDate, "PPP", { locale: es })}
      />

      {assetName && (
        <InfoRow
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          label="Activo"
          value={assetName}
        />
      )}

      {siteName && (
        <InfoRow
          icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
          label="Sede"
          value={siteName}
        />
      )}

      {description && (
        <div className="space-y-1">
          <p className="text-sm font-medium">Descripción:</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      )}
    </div>
  )
}

/**
 * InfoRow Component
 * Reusable row component for displaying key-value pairs
 */
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: JSX.Element
  label: string
  value: React.ReactNode
}): JSX.Element {
  return (
    <div className="flex items-start gap-2">
      {icon}
      <div className="flex-1">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {typeof value === "string" ? (
          <p className="text-sm">{value}</p>
        ) : (
          value
        )}
      </div>
    </div>
  )
}

/**
 * Helper functions for labels and variants
 */

function getRecurrenceTypeLabel(type: string | undefined): string {
  if (!type) return "N/A"
  const labels: Record<string, string> = {
    DAILY: "Diario",
    WEEKLY: "Semanal",
    MONTHLY: "Mensual",
    YEARLY: "Anual",
    METER_BASED: "Basado en Medidor",
  }
  return labels[type] ?? type
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAFT: "Borrador",
    ASSIGNED: "Asignada",
    IN_PROGRESS: "En Progreso",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
  }
  return labels[status] ?? status
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DRAFT: "secondary",
    ASSIGNED: "default",
    IN_PROGRESS: "outline",
    COMPLETED: "default",
    CANCELLED: "destructive",
  }
  return variants[status] ?? "default"
}

function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    LOW: "Baja",
    MEDIUM: "Media",
    HIGH: "Alta",
    URGENT: "Urgente",
  }
  return labels[priority] ?? priority
}

function getPriorityVariant(priority: string): "default" | "secondary" | "destructive" | "outline" {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    LOW: "secondary",
    MEDIUM: "default",
    HIGH: "outline",
    URGENT: "destructive",
  }
  return variants[priority] ?? "default"
}

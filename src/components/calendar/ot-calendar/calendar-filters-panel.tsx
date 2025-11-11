"use client"

import { JSX } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { X, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { getEventTypeLabel } from "@/schemas/calendar.schema"
import type { CalendarEventType } from "@/types/calendar.types"
import type { WorkOrderStatus, WorkOrderPriority } from "@/types/work-order.types"

interface CalendarFiltersPanelProps {
  selectedEventTypes: CalendarEventType[]
  onEventTypesChange: (types: CalendarEventType[]) => void

  selectedStatuses: WorkOrderStatus[]
  onStatusesChange: (statuses: WorkOrderStatus[]) => void

  selectedPriorities: WorkOrderPriority[]
  onPrioritiesChange: (priorities: WorkOrderPriority[]) => void

  showCompleted: boolean
  onShowCompletedChange: (show: boolean) => void

  onResetFilters: () => void
  hasActiveFilters: boolean
}

/**
 * CalendarFiltersPanel Component
 * Provides comprehensive filtering options for calendar events
 * Can be used in a sidebar or as a dropdown panel
 *
 * Features:
 * - Filter by event type
 * - Filter by work order status
 * - Filter by priority
 * - Toggle completed work orders
 * - Reset all filters
 */
export function CalendarFiltersPanel({
  selectedEventTypes,
  onEventTypesChange,
  selectedStatuses,
  onStatusesChange,
  selectedPriorities,
  onPrioritiesChange,
  showCompleted,
  onShowCompletedChange,
  onResetFilters,
  hasActiveFilters,
}: CalendarFiltersPanelProps): JSX.Element {
  const eventTypes: CalendarEventType[] = [
    "PREVENTIVE_SCHEDULE",
    "PREVENTIVE_WO",
    "CORRECTIVE_WO",
    "REPAIR_WO",
    "INSPECTION",
    "PLANNED_SHUTDOWN",
    "METER_BASED_TRIGGER",
  ]

  const statuses: { value: WorkOrderStatus; label: string }[] = [
    { value: "DRAFT", label: "Borrador" },
    { value: "ASSIGNED", label: "Asignada" },
    { value: "IN_PROGRESS", label: "En Progreso" },
    { value: "COMPLETED", label: "Completada" },
    { value: "CANCELLED", label: "Cancelada" },
  ]

  const priorities: { value: WorkOrderPriority; label: string }[] = [
    { value: "LOW", label: "Baja" },
    { value: "MEDIUM", label: "Media" },
    { value: "HIGH", label: "Alta" },
    { value: "URGENT", label: "Urgente" },
  ]

  const handleEventTypeToggle = (type: CalendarEventType): void => {
    if (selectedEventTypes.includes(type)) {
      onEventTypesChange(selectedEventTypes.filter((t) => t !== type))
    } else {
      onEventTypesChange([...selectedEventTypes, type])
    }
  }

  const handleStatusToggle = (status: WorkOrderStatus): void => {
    if (selectedStatuses.includes(status)) {
      onStatusesChange(selectedStatuses.filter((s) => s !== status))
    } else {
      onStatusesChange([...selectedStatuses, status])
    }
  }

  const handlePriorityToggle = (priority: WorkOrderPriority): void => {
    if (selectedPriorities.includes(priority)) {
      onPrioritiesChange(selectedPriorities.filter((p) => p !== priority))
    } else {
      onPrioritiesChange([...selectedPriorities, priority])
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-sm font-medium">Filtros</CardTitle>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                Activo
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Event Types Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo de Evento</Label>
          <div className="space-y-2">
            {eventTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`event-type-${type}`}
                  checked={selectedEventTypes.includes(type)}
                  onCheckedChange={() => handleEventTypeToggle(type)}
                />
                <label
                  htmlFor={`event-type-${type}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {getEventTypeLabel(type)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Estado</Label>
          <div className="space-y-2">
            {statuses.map((status) => (
              <div key={status.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${status.value}`}
                  checked={selectedStatuses.includes(status.value)}
                  onCheckedChange={() => handleStatusToggle(status.value)}
                />
                <label
                  htmlFor={`status-${status.value}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {status.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Prioridad</Label>
          <div className="space-y-2">
            {priorities.map((priority) => (
              <div key={priority.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${priority.value}`}
                  checked={selectedPriorities.includes(priority.value)}
                  onCheckedChange={() => handlePriorityToggle(priority.value)}
                />
                <label
                  htmlFor={`priority-${priority.value}`}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {priority.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Show Completed Toggle */}
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-completed"
              checked={showCompleted}
              onCheckedChange={onShowCompletedChange}
            />
            <label
              htmlFor="show-completed"
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Mostrar órdenes completadas
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { JSX, useMemo } from "react"
import { CalendarFilterButton } from "@/components/common/calendar-filter-button"
import {
  getEventTypeLabel,
  CALENDAR_EVENT_TYPES,
} from "@/schemas/calendar.schema"
import {
  getWorkOrderStatusLabel,
  getWorkOrderPriorityLabel,
  WORK_ORDER_STATUSES,
  WORK_ORDER_PRIORITIES,
} from "@/schemas/work-order"
import { getEventTypeColor } from "@/lib/calendar-colors"
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
 * Compact filter button using CalendarFilterButton component
 * Provides comprehensive filtering options in a popover
 * Following nextjs-expert standards: < 200 lines, no 'any'
 */
export function CalendarFiltersPanel({
  selectedEventTypes,
  onEventTypesChange,
  selectedStatuses,
  onStatusesChange,
  selectedPriorities,
  onPrioritiesChange,
  onResetFilters,
  hasActiveFilters,
}: CalendarFiltersPanelProps): JSX.Element {
  const filterGroups = useMemo(() => {
    return [
      {
        id: "eventTypes",
        label: "Tipo de Evento",
        options: CALENDAR_EVENT_TYPES.map((type) => ({
          value: type,
          label: getEventTypeLabel(type),
          color: getEventTypeColor(type).bg,
        })),
        selectedValues: selectedEventTypes as string[],
        onChange: onEventTypesChange as (values: string[]) => void,
      },
      {
        id: "statuses",
        label: "Estado",
        options: WORK_ORDER_STATUSES.map((status) => ({
          value: status,
          label: getWorkOrderStatusLabel(status),
          // No color - statuses are text-only
        })),
        selectedValues: selectedStatuses as string[],
        onChange: onStatusesChange as (values: string[]) => void,
      },
      {
        id: "priorities",
        label: "Prioridad",
        options: WORK_ORDER_PRIORITIES.map((priority) => ({
          value: priority,
          label: getWorkOrderPriorityLabel(priority),
          // No color - priorities are text-only
        })),
        selectedValues: selectedPriorities as string[],
        onChange: onPrioritiesChange as (values: string[]) => void,
      },
    ]
  }, [
    selectedEventTypes,
    selectedStatuses,
    selectedPriorities,
    onEventTypesChange,
    onStatusesChange,
    onPrioritiesChange,
  ])

  return (
    <CalendarFilterButton
      filterGroups={filterGroups}
      onReset={onResetFilters}
      hasActiveFilters={hasActiveFilters}
    />
  )
}

"use client"

import { useCallback, JSX } from "react"
import type {
  DateSelectArg,
  DatesSetArg,
  EventContentArg,
} from "@fullcalendar/core"
import { X, } from "lucide-react"
import { BaseCalendar } from "../base-calendar"
import { useOTCalendarEvents } from "@/hooks/use-ot-calendar-events"
import { useOTCalendarActions } from "@/hooks/use-ot-calendar-actions"
import type { CalendarFilters } from "@/types/calendar.types"

interface OTCalendarProps {
  /**
   * Callback when a schedule event is clicked
   */
  onScheduleClick?: (scheduleId: string) => void

  /**
   * Callback when a work order event is clicked for quick actions
   * If action is not specified, shows the quick actions menu
   */
  onWorkOrderClick?: (workOrderId: string, action?: "edit" | "assign" | "delete") => void

  /**
   * Callback when a date range is selected for creating new events
   */
  onDateSelect?: (start: Date, end: Date) => void

  /**
   * Key to trigger refetch of calendar data
   */
  refetchKey?: number

  /**
   * Current filters for calendar (controlled from parent)
   */
  filters: CalendarFilters

  /**
   * Enable or disable drag and drop
   */
  editable?: boolean

  /**
   * Enable or disable date selection
   */
  selectable?: boolean

  /**
   * Enable delete button on events
   */
  showDeleteButton?: boolean
}

/**
 * OTCalendar - Unified Calendar for Work Orders and Schedules
 *
 * Features:
 * - Displays both schedules and work orders in a unified view
 * - Supports drag-and-drop rescheduling
 * - Filterable by type, status, priority, assets, sites, and technicians
 * - Color-coded by event type and status
 * - Responsive design with loading states
 *
 * Architecture:
 * - Follows SOLID principles
 * - Uses custom hooks for separation of concerns
 * - Client component for interactivity
 * - Proper TypeScript typing (no 'any')
 */
export function OTCalendar({
  onScheduleClick,
  onWorkOrderClick,
  onDateSelect,
  refetchKey,
  filters,
  editable = true,
  selectable = true,
  showDeleteButton = true,
}: OTCalendarProps): JSX.Element {

  // Custom hooks for state management
  const { events, loading, fetchEvents, refetch } = useOTCalendarEvents({
    refetchKey,
    initialFilters: filters,
  })
  const { handleEventClick, handleEventDrop } = useOTCalendarActions({
    onScheduleClick,
    onWorkOrderClick,
    onRefetch: refetch,
  })

  /**
   * Handle FullCalendar dates set event
   * Triggered when view changes or calendar navigation occurs
   */
  const handleDatesSet = useCallback(
    (info: DatesSetArg): void => {
      fetchEvents(info.start, info.end, filters)
    },
    [fetchEvents, filters]
  )

  /**
   * Handle date selection for creating new events
   */
  const handleDateSelect = useCallback(
    (selectInfo: DateSelectArg): void => {
      if (onDateSelect) {
        onDateSelect(selectInfo.start, selectInfo.end)
      }
    },
    [onDateSelect]
  )

  /**
   * Handle delete button click
   */
  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, workOrderId: string): void => {
      e.stopPropagation() // Prevent event click
      onWorkOrderClick?.(workOrderId, "delete")
    },
    [onWorkOrderClick]
  )
  /**
   * Custom event content renderer
   * Different display for schedules vs work orders
   */
  const renderEventContent = useCallback((eventInfo: EventContentArg): JSX.Element => {
    const props = eventInfo.event.extendedProps

    // Work order rendering - detect by presence of workOrderId
    if (props.workOrderId) {
      const workOrderId = props.workOrderId as string

      return (
        <div
          className="group relative flex flex-col gap-0.5 p-1 overflow-hidden text-white h-full cursor-pointer"
          onClick={(e) => {
            // Only trigger if not clicking the delete button
            const target = e.target as HTMLElement
            if (!target.closest('button')) {
              onWorkOrderClick?.(workOrderId)
            }
          }}
        >
          {/* Delete button - shown on hover */}
          {showDeleteButton && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteClick(e, workOrderId)
              }}
              className="absolute top-0.5 right-0.5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity bg-black/60 hover:bg-red-600 rounded-sm p-0.5 z-10"
              title="Eliminar orden"
            >
              <X className="h-3 w-3" />
            </button>
          )}

          <div className="font-medium text-xs truncate leading-tight">
            {props.number as string}
          </div>
          {props.assetName && (
            <div className="text-[10px] opacity-90 truncate leading-tight">
              📦 {props.assetName as string}
            </div>
          )}
          {props.assignedTechnicians &&
            (props.assignedTechnicians as Array<{ name: string }>).length > 0 && (
            <div className="text-[10px] opacity-75 leading-tight">
              👤 {(props.assignedTechnicians as Array<{ name: string }>)[0].name}
            </div>
          )}
        </div>
      )
    }

    // Schedule rendering - detect by presence of scheduleId
    if (props.scheduleId) {
      return (
        <div
          className="flex flex-col gap-0.5 p-1 overflow-hidden text-white cursor-pointer"
          onClick={() => {
            if (props.scheduleId) {
              onScheduleClick?.(props.scheduleId as string)
            }
          }}
        >
          <div className="font-medium text-xs truncate leading-tight">
            {eventInfo.event.title}
          </div>
          {props.assetName && (
            <div className="text-[10px] opacity-90 truncate leading-tight">
              📦 {props.assetName as string}
            </div>
          )}
          {props.completionRate !== undefined && (
            <div className="text-[10px] opacity-75 leading-tight">
              ✓ {(props.completionRate as number).toFixed(0)}% completado
            </div>
          )}
        </div>
      )
    }

    // Fallback - should not happen
    return (
      <div className="flex flex-col gap-0.5 p-1 overflow-hidden text-white">
        <div className="font-medium text-xs truncate leading-tight">
          {eventInfo.event.title}
        </div>
      </div>
    )
  }, [showDeleteButton, handleDeleteClick, onWorkOrderClick, onScheduleClick])

  return (
    <BaseCalendar
      events={events}
      loading={loading}
      onEventClick={handleEventClick}
      onDateSelect={handleDateSelect}
      onEventDrop={handleEventDrop}
      onDatesSet={handleDatesSet}
      renderEventContent={renderEventContent}
      editable={editable}
      selectable={selectable}
    />
  )
}

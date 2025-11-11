"use client"

import { useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { EventClickArg, EventDropArg } from "@fullcalendar/core"

interface UseOTCalendarActionsOptions {
  onScheduleClick?: (scheduleId: string) => void
  onWorkOrderClick?: (workOrderId: string, action?: "edit" | "assign" | "delete") => void
  onRefetch?: () => Promise<void>
}

interface UseOTCalendarActionsReturn {
  handleEventClick: (info: EventClickArg) => void
  handleEventDrop: (info: EventDropArg) => Promise<void>
}

/**
 * Custom hook for handling calendar event actions
 * Separates action logic from component rendering
 * Follows Single Responsibility Principle
 */
export function useOTCalendarActions(
  options: UseOTCalendarActionsOptions = {}
): UseOTCalendarActionsReturn {
  const { onScheduleClick, onWorkOrderClick, onRefetch } = options
  const router = useRouter()

  /**
   * Handle event click
   * Differentiate between schedule and work order clicks
   */
  const handleEventClick = useCallback(
    (info: EventClickArg): void => {
      info.jsEvent.preventDefault()
      const props = info.event.extendedProps

      if (props.type === "workOrder" && props.workOrderId) {
        // If we have a callback, use it to open quick actions (no action = show menu)
        if (onWorkOrderClick) {
          onWorkOrderClick(props.workOrderId as string)
        } else {
          // Otherwise, navigate to work order detail page
          router.push(`/work-orders/${props.workOrderId as string}`)
        }
      } else if (props.type === "schedule" && props.scheduleId) {
        // Trigger schedule detail callback
        if (onScheduleClick) {
          onScheduleClick(props.scheduleId as string)
        }
      }
    },
    [onScheduleClick, onWorkOrderClick, router]
  )

  /**
   * Handle event drag and drop
   * Reschedules the event via API
   */
  const handleEventDrop = useCallback(
    async (info: EventDropArg): Promise<void> => {
      const eventId = info.event.id
      const props = info.event.extendedProps
      const newDate = info.event.start

      if (!newDate) {
        info.revert()
        toast.error("Fecha inválida")
        return
      }

      // Check if event is editable
      if (props.editable === false) {
        info.revert()
        toast.error("Este evento no puede ser reprogramado")
        return
      }

      // Determine event type based on presence of scheduleId or workOrderId
      const eventType = props.scheduleId ? "schedule" : props.workOrderId ? "workOrder" : null

      if (!eventType) {
        info.revert()
        toast.error("Tipo de evento no válido")
        console.error("Event props:", props)
        return
      }

      try {
        // Convert delta to milliseconds (FullCalendar delta is a Duration object)
        // The delta object has properties like: years, months, days, milliseconds
        let deltaMs: number | undefined
        if (info.delta) {
          // Calculate total milliseconds from the duration
          const days = info.delta.days || 0
          const hours = info.delta.hours || 0
          const minutes = info.delta.minutes || 0
          const seconds = info.delta.seconds || 0
          const ms = info.delta.milliseconds || 0

          deltaMs = (days * 24 * 60 * 60 * 1000) +
                    (hours * 60 * 60 * 1000) +
                    (minutes * 60 * 1000) +
                    (seconds * 1000) +
                    ms
        }

        const requestBody = {
          eventId,
          eventType,
          newDate: newDate.toISOString(),
          delta: deltaMs,
        }

        // Call API to reschedule
        const response = await fetch("/api/calendar/reschedule", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al reprogramar")
        }

        const data = await response.json()
        toast.success(data.message || "Evento reprogramado exitosamente")

        // Refetch events to update calendar
        if (onRefetch) {
          await onRefetch()
        }
      } catch (error) {
        console.error("Error rescheduling event:", error)
        const errorMessage =
          error instanceof Error ? error.message : "Error al reprogramar evento"
        toast.error(errorMessage)
        info.revert() // Revert the drag if API call failed
      }
    },
    [onRefetch]
  )

  return {
    handleEventClick,
    handleEventDrop,
  }
}

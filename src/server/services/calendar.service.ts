import { CalendarRepository } from "@/server/repositories/calendar.repository"
import { getCalendarEventColor } from "@/lib/calendar-colors"
import type {
  CalendarEvent,
  CalendarFilters,
  CalendarEventType,
  CalendarDateRange,
} from "@/types/calendar.types"
import type { WorkOrderType, WorkOrderStatus } from "@/types/work-order.types"
import type { RecurrenceType } from "@/schemas/work-order-schedule"

/**
 * Calendar Service
 * Business logic layer for calendar operations
 * Transforms database entities into calendar events
 * Follows SOLID principles - handles business logic, not data access
 */
export class CalendarService {
  /**
   * Get all calendar events (schedules + work orders) for a date range
   * Main method for loading calendar data
   */
  static async getCalendarEvents(
    companyId: string,
    dateRange: CalendarDateRange,
    filters?: CalendarFilters
  ): Promise<CalendarEvent[]> {
    // Fetch data in parallel for better performance
    const [schedules, workOrders] = await Promise.all([
      CalendarRepository.getSchedulesInRange(
        companyId,
        dateRange.start,
        dateRange.end,
        filters
      ),
      CalendarRepository.getWorkOrdersInRange(
        companyId,
        dateRange.start,
        dateRange.end,
        filters
      ),
    ])

    // Transform schedules to calendar events
    const scheduleEvents: CalendarEvent[] = schedules.map((schedule) => {
      const eventType = this.mapRecurrenceToEventType(schedule.recurrenceType)
      const colors = getCalendarEventColor(eventType)

      return {
        id: `schedule-${schedule.id}`,
        type: eventType,
        title: `📅 ${schedule.name}`,
        start: schedule.nextGenerationDate,
        allDay: true,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
        extendedProps: {
          type: "schedule",
          scheduleId: schedule.id,
          description: schedule.description ?? undefined,
          recurrenceType: schedule.recurrenceType as RecurrenceType,
          completionRate: schedule.completionRate,
          isActive: schedule.isActive,
          templateName: schedule.template.name,
          assetId: schedule.asset?.id,
          assetName: schedule.asset?.name,
          assetCode: schedule.asset?.code,
          siteId: schedule.site?.id,
          siteName: schedule.site?.name,
          editable: true, // Schedules can be dragged
        },
      }
    })

    // Transform work orders to calendar events
    // IMPORTANT: Color is determined by TYPE only, not by status
    const workOrderEvents: CalendarEvent[] = workOrders.map((workOrder) => {
      const eventType = this.mapWorkOrderTypeToEventType(workOrder.type)
      const colors = getCalendarEventColor(eventType)

      // Get assigned technicians
      const assignedTechnicians = workOrder.assignments.map((assignment) => ({
        id: assignment.user.id,
        name: assignment.user.name,
        email: assignment.user.email,
        image: assignment.user.image,
      }))

      return {
        id: `workorder-${workOrder.id}`,
        type: eventType,
        title: `🔧 ${workOrder.number}`,
        start: workOrder.scheduledDate ?? new Date(),
        allDay: true,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: colors.text,
        extendedProps: {
          type: "workOrder",
          workOrderId: workOrder.id,
          number: workOrder.number,
          description: workOrder.description ?? undefined,
          status: workOrder.status,
          priority: workOrder.priority,
          scheduleId_ref: workOrder.scheduleId ?? undefined,
          assetId: workOrder.asset?.id,
          assetName: workOrder.asset?.name,
          assetCode: workOrder.asset?.code,
          siteId: workOrder.site?.id,
          siteName: workOrder.site?.name,
          assignedTechnicians,
          estimatedDuration: workOrder.estimatedDuration ?? undefined,
          actualDuration: workOrder.actualDuration ?? undefined,
          editable: workOrder.status === "DRAFT" || workOrder.status === "ASSIGNED", // Only editable if not in progress
        },
      }
    })

    // Combine and apply event type filters
    const allEvents = [...scheduleEvents, ...workOrderEvents]

    // Filter by event types if specified
    if (filters && filters.eventTypes.length > 0) {
      return allEvents.filter((event) => filters.eventTypes.includes(event.type))
    }

    return allEvents
  }

  /**
   * Reschedule a calendar event (schedule or work order)
   * Validates business rules before updating
   */
  static async rescheduleEvent(
    eventId: string,
    eventType: "schedule" | "workOrder",
    companyId: string,
    newDate: Date
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      // Validate: new date should not be in the past
      const now = new Date()
      now.setHours(0, 0, 0, 0)
      if (newDate < now) {
        return {
          success: false,
          error: "No se puede programar en una fecha pasada",
        }
      }

      if (eventType === "schedule") {
        await CalendarRepository.updateScheduleDate(eventId, companyId, newDate)
        return {
          success: true,
          message: "Programación actualizada exitosamente",
        }
      } else {
        // For work orders, check if it's editable
        const workOrder = await CalendarRepository.getWorkOrderById(
          eventId,
          companyId
        )

        if (!workOrder) {
          return {
            success: false,
            error: "Orden de trabajo no encontrada",
          }
        }

        if (workOrder.status === "IN_PROGRESS") {
          return {
            success: false,
            error: "No se puede reprogramar una orden en progreso",
          }
        }

        if (workOrder.status === "COMPLETED" || workOrder.status === "CANCELLED") {
          return {
            success: false,
            error: "No se puede reprogramar una orden completada o cancelada",
          }
        }

        await CalendarRepository.updateWorkOrderDate(eventId, companyId, newDate)
        return {
          success: true,
          message: "Orden de trabajo reprogramada exitosamente",
        }
      }
    } catch (error) {
      console.error("Error rescheduling event:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error al reprogramar evento",
      }
    }
  }

  /**
   * Get calendar statistics
   */
  static async getStats(
    companyId: string,
    dateRange: CalendarDateRange
  ) {
    return await CalendarRepository.getCalendarStats(
      companyId,
      dateRange.start,
      dateRange.end
    )
  }

  /**
   * Map recurrence type to calendar event type
   */
  private static mapRecurrenceToEventType(
    recurrenceType: string
  ): CalendarEventType {
    if (recurrenceType === "METER_BASED") {
      return "METER_BASED_TRIGGER"
    }
    return "PREVENTIVE_SCHEDULE"
  }

  /**
   * Map work order type to calendar event type
   */
  private static mapWorkOrderTypeToEventType(
    workOrderType: WorkOrderType
  ): CalendarEventType {
    const mapping: Record<WorkOrderType, CalendarEventType> = {
      PREVENTIVO: "PREVENTIVE_WO",
      CORRECTIVO: "CORRECTIVE_WO",
      REPARACION: "REPAIR_WO",
    }
    return mapping[workOrderType] ?? "CORRECTIVE_WO"
  }

}

import type { WorkOrderStatus, WorkOrderPriority } from "./work-order.types"

/**
 * Calendar Event Types
 * Defines all possible event types that can appear in the calendar
 */
export type CalendarEventType =
  | "PREVENTIVE_SCHEDULE"    // Plantilla de mantenimiento preventivo
  | "PREVENTIVE_WO"          // Orden generada de preventivo
  | "CORRECTIVE_WO"          // Orden correctiva
  | "REPAIR_WO"              // Orden de reparación
  | "INSPECTION"             // Inspección programada
  | "PLANNED_SHUTDOWN"       // Parada planificada
  | "METER_BASED_TRIGGER"    // Activación por medidor

/**
 * Recurrence Type from Schedule
 */
export type RecurrenceType =
  | "DAILY"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY"
  | "METER_BASED"

/**
 * Calendar Filter Options
 */
export interface CalendarFilters {
  eventTypes: CalendarEventType[]
  statuses: WorkOrderStatus[]
  priorities: WorkOrderPriority[]
  assignedUserIds: string[]
  assetIds: string[]
  siteIds: string[]
  showCompleted: boolean
}

/**
 * Base Calendar Event
 * Unified event structure for calendar display
 */
export interface CalendarEvent {
  id: string
  type: CalendarEventType
  title: string
  start: Date | string
  end?: Date | string
  allDay: boolean

  // Visual configuration
  backgroundColor: string
  borderColor: string
  textColor: string

  // Extended properties
  extendedProps: CalendarEventExtendedProps
}

/**
 * Extended Properties for Calendar Events
 * Contains all contextual information for each event type
 */
export interface CalendarEventExtendedProps {
  // Common fields
  type: "schedule" | "workOrder"
  description?: string

  // Schedule-specific fields
  scheduleId?: string
  recurrenceType?: RecurrenceType
  completionRate?: number
  isActive?: boolean
  templateName?: string

  // Work order-specific fields
  workOrderId?: string
  number?: string
  status?: WorkOrderStatus
  priority?: WorkOrderPriority
  scheduleId_ref?: string  // Reference to parent schedule

  // Asset and location
  assetId?: string
  assetName?: string
  assetCode?: string
  siteId?: string
  siteName?: string

  // Assignments
  assignedTechnicians?: CalendarEventTechnician[]

  // Time tracking
  estimatedDuration?: number
  actualDuration?: number

  // Draggable flag
  editable?: boolean
}

/**
 * Technician information for calendar events
 */
export interface CalendarEventTechnician {
  id: string
  name: string
  email: string
  image?: string | null
}

/**
 * Calendar View Type
 */
export type CalendarViewType = "dayGridMonth" | "timeGridWeek" | "timeGridDay" | "listWeek"

/**
 * Date range for calendar queries
 */
export interface CalendarDateRange {
  start: Date
  end: Date
}

/**
 * Calendar event action result
 */
export interface CalendarEventActionResult {
  success: boolean
  message?: string
  error?: string
}

/**
 * Calendar event drag/drop data
 */
export interface CalendarEventDragData {
  eventId: string
  oldStart: Date
  newStart: Date
  newEnd?: Date
  delta: number  // milliseconds
}

/**
 * Calendar statistics
 */
export interface CalendarStats {
  totalEvents: number
  byType: Record<CalendarEventType, number>
  byStatus: Record<WorkOrderStatus, number>
  scheduledThisWeek: number
  overdueWorkOrders: number
}

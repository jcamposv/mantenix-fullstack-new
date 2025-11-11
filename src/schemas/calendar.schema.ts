import { z } from "zod"

/**
 * Calendar Event Type Schema
 */
export const calendarEventTypeSchema = z.enum([
  "PREVENTIVE_SCHEDULE",
  "PREVENTIVE_WO",
  "CORRECTIVE_WO",
  "REPAIR_WO",
  "INSPECTION",
  "PLANNED_SHUTDOWN",
  "METER_BASED_TRIGGER",
])

/**
 * Calendar View Type Schema
 */
export const calendarViewTypeSchema = z.enum([
  "dayGridMonth",
  "timeGridWeek",
  "timeGridDay",
  "listWeek",
])

/**
 * Date Range Schema for calendar queries
 */
export const calendarDateRangeSchema = z.object({
  startDate: z.string().datetime("Fecha de inicio inválida"),
  endDate: z.string().datetime("Fecha de fin inválida"),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return start < end
}, {
  message: "La fecha de inicio debe ser anterior a la fecha de fin",
  path: ["startDate"],
})

/**
 * Calendar Filters Schema
 */
export const calendarFiltersSchema = z.object({
  eventTypes: z.array(calendarEventTypeSchema).optional().default([]),
  statuses: z.array(z.enum(["DRAFT", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])).optional().default([]),
  priorities: z.array(z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])).optional().default([]),
  assignedUserIds: z.array(z.string()).optional().default([]),
  assetIds: z.array(z.string()).optional().default([]),
  siteIds: z.array(z.string()).optional().default([]),
  showCompleted: z.boolean().optional().default(true),
})

/**
 * Event Reschedule Schema (for drag and drop)
 */
export const eventRescheduleSchema = z.object({
  eventId: z.string().min(1, "ID de evento requerido"),
  eventType: z.enum(["schedule", "workOrder"]),
  newDate: z.string().datetime("Fecha inválida"),
  delta: z.number().optional(), // milliseconds difference
})

/**
 * Work Order Quick Create Schema (from calendar date selection)
 */
export const workOrderQuickCreateSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(200),
  type: z.enum(["PREVENTIVO", "CORRECTIVO", "REPARACION"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  scheduledDate: z.string().datetime("Fecha programada inválida"),
  siteId: z.string().min(1, "La sede es requerida"),
  assetId: z.string().optional(),
  assignedUserIds: z.array(z.string()).min(1, "Debe asignar al menos un técnico"),
  description: z.string().optional(),
  estimatedDuration: z.coerce.number().positive().optional(),
})

/**
 * Schedule Quick Create Schema (from calendar date selection)
 */
export const scheduleQuickCreateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  templateId: z.string().min(1, "El template es requerido"),
  recurrenceType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "METER_BASED"]),
  recurrenceInterval: z.coerce.number().int().min(1).default(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  assetId: z.string().optional(),
  siteId: z.string().optional(),
  assignedUserIds: z.array(z.string()).optional(),
})

/**
 * Calendar Event Query Schema
 */
export const calendarEventQuerySchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  filters: calendarFiltersSchema.optional(),
})

// Type exports
export type CalendarEventTypeSchema = z.infer<typeof calendarEventTypeSchema>
export type CalendarViewTypeSchema = z.infer<typeof calendarViewTypeSchema>
export type CalendarDateRangeSchema = z.infer<typeof calendarDateRangeSchema>
export type CalendarFiltersSchema = z.infer<typeof calendarFiltersSchema>
export type EventRescheduleSchema = z.infer<typeof eventRescheduleSchema>
export type WorkOrderQuickCreateSchema = z.infer<typeof workOrderQuickCreateSchema>
export type ScheduleQuickCreateSchema = z.infer<typeof scheduleQuickCreateSchema>
export type CalendarEventQuerySchema = z.infer<typeof calendarEventQuerySchema>

/**
 * Helper function to get event type label in Spanish
 */
export const getEventTypeLabel = (type: CalendarEventTypeSchema): string => {
  const labels: Record<CalendarEventTypeSchema, string> = {
    PREVENTIVE_SCHEDULE: "Programación Preventiva",
    PREVENTIVE_WO: "Mantenimiento Preventivo",
    CORRECTIVE_WO: "Mantenimiento Correctivo",
    REPAIR_WO: "Reparación",
    INSPECTION: "Inspección",
    PLANNED_SHUTDOWN: "Parada Planificada",
    METER_BASED_TRIGGER: "Basado en Medidor",
  }
  return labels[type]
}

/**
 * Helper function to get event type color
 */
export const getEventTypeColor = (type: CalendarEventTypeSchema): { bg: string; border: string; text: string } => {
  const colors: Record<CalendarEventTypeSchema, { bg: string; border: string; text: string }> = {
    PREVENTIVE_SCHEDULE: {
      bg: "#3B82F6",
      border: "#2563EB",
      text: "#FFFFFF",
    },
    PREVENTIVE_WO: {
      bg: "#10B981",
      border: "#059669",
      text: "#FFFFFF",
    },
    CORRECTIVE_WO: {
      bg: "#EF4444",
      border: "#DC2626",
      text: "#FFFFFF",
    },
    REPAIR_WO: {
      bg: "#F59E0B",
      border: "#D97706",
      text: "#FFFFFF",
    },
    INSPECTION: {
      bg: "#8B5CF6",
      border: "#7C3AED",
      text: "#FFFFFF",
    },
    PLANNED_SHUTDOWN: {
      bg: "#6B7280",
      border: "#4B5563",
      text: "#FFFFFF",
    },
    METER_BASED_TRIGGER: {
      bg: "#EC4899",
      border: "#DB2777",
      text: "#FFFFFF",
    },
  }
  return colors[type]
}

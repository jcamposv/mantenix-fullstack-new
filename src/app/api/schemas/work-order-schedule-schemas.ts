import { z } from "zod"
import { RecurrenceType, RecurrenceEndType } from "@prisma/client"

/**
 * Schema for creating a work order schedule
 */
export const createWorkOrderScheduleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  description: z.string().optional(),

  // Recurrence configuration
  recurrenceType: z.nativeEnum(RecurrenceType),
  recurrenceInterval: z.number().int().min(1, "El intervalo debe ser mayor a 0").default(1),

  // End conditions
  recurrenceEndType: z.nativeEnum(RecurrenceEndType),
  recurrenceEndValue: z.number().int().min(1).optional(),
  recurrenceEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),

  // Week days for WEEKLY recurrence (0=Sunday, 6=Saturday)
  weekDays: z.array(z.number().int().min(0).max(6)).optional(),

  // Meter-based configuration
  meterType: z.string().optional(),
  meterThreshold: z.number().positive().optional(),

  // Relations
  templateId: z.string().min(1, "El template es requerido"),
  assetId: z.string().optional(),
  siteId: z.string().optional(),
  assignedUserIds: z.array(z.string()).optional(),

  // Optional start date (date only format YYYY-MM-DD)
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
}).refine((data) => {
  // Validate end conditions
  if (data.recurrenceEndType === "AFTER_OCCURRENCES" && !data.recurrenceEndValue) {
    return false
  }
  if (data.recurrenceEndType === "ON_DATE" && !data.recurrenceEndDate) {
    return false
  }
  // Validate meter-based
  if (data.recurrenceType === "METER_BASED" && (!data.meterType || !data.meterThreshold)) {
    return false
  }
  return true
}, {
  message: "Configuración de recurrencia inválida"
})

/**
 * Schema for updating a work order schedule
 */
export const updateWorkOrderScheduleSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),

  recurrenceType: z.nativeEnum(RecurrenceType).optional(),
  recurrenceInterval: z.number().int().min(1).optional(),

  recurrenceEndType: z.nativeEnum(RecurrenceEndType).optional(),
  recurrenceEndValue: z.number().int().min(1).optional().nullable(),
  recurrenceEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),

  weekDays: z.array(z.number().int().min(0).max(6)).optional(),

  meterType: z.string().optional().nullable(),
  meterThreshold: z.number().positive().optional().nullable(),

  templateId: z.string().optional(),
  assetId: z.string().optional().nullable(),
  siteId: z.string().optional().nullable(),
  assignedUserIds: z.array(z.string()).optional(),

  isActive: z.boolean().optional(),
  nextGenerationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

/**
 * Schema for filtering work order schedules
 */
export const workOrderScheduleFiltersSchema = z.object({
  recurrenceType: z.nativeEnum(RecurrenceType).optional(),
  assetId: z.string().optional(),
  siteId: z.string().optional(),
  templateId: z.string().optional(),
  isActive: z.enum(["true", "false"]).optional().transform(val => val === "true"),
  search: z.string().optional(),
  page: z.string().optional().transform(val => parseInt(val ?? "1")),
  limit: z.string().optional().transform(val => parseInt(val ?? "10")),
})

/**
 * Schema for updating meter reading
 */
export const updateMeterReadingSchema = z.object({
  newReading: z.number().nonnegative("La lectura debe ser un valor positivo"),
})

/**
 * Schema for date range queries (for calendar)
 * FullCalendar sends ISO datetime strings
 */
export const dateRangeSchema = z.object({
  startDate: z.string(), // ISO datetime from FullCalendar
  endDate: z.string(),   // ISO datetime from FullCalendar
})

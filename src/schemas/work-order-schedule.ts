import { z } from "zod"

// Enum schemas
export const recurrenceTypeSchema = z.enum([
  "DAILY",
  "WEEKLY",
  "MONTHLY",
  "YEARLY",
  "METER_BASED"
])

export const recurrenceEndTypeSchema = z.enum([
  "NEVER",
  "AFTER_OCCURRENCES",
  "ON_DATE"
])

export const meterTypeSchema = z.enum([
  "HOURS_RUN",
  "KILOMETERS",
  "MILES",
  "TEMPERATURE",
  "PRESSURE",
  "CYCLES",
  "VIBRATION",
  "CUSTOM"
])

// Main work order schedule form schema
export const workOrderScheduleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  description: z.string().optional(),

  // Recurrence configuration
  recurrenceType: recurrenceTypeSchema,
  recurrenceInterval: z.coerce.number().int().min(1, "El intervalo debe ser mayor a 0").default(1),

  // End conditions
  recurrenceEndType: recurrenceEndTypeSchema,
  recurrenceEndValue: z.coerce.number().int().min(1).optional(),
  recurrenceEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional(),

  // Week days for WEEKLY recurrence (0=Sunday, 6=Saturday)
  weekDays: z.array(z.number().int().min(0).max(6)).optional(),

  // Meter-based configuration
  meterType: meterTypeSchema.optional(),
  meterThreshold: z.coerce.number().positive().optional(),

  // Relations
  templateId: z.string().min(1, "El template es requerido"),
  assetId: z.string().optional(),
  siteId: z.string().optional(),
  assignedUserIds: z.array(z.string()).optional(),

  // Optional start date (date only, not datetime)
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)").optional(),
}).refine((data) => {
  // Validate end conditions
  if (data.recurrenceEndType === "AFTER_OCCURRENCES" && !data.recurrenceEndValue) {
    return false
  }
  if (data.recurrenceEndType === "ON_DATE" && !data.recurrenceEndDate) {
    return false
  }
  return true
}, {
  message: "Configuración de fin de recurrencia inválida",
  path: ["recurrenceEndType"]
}).refine((data) => {
  // Validate meter-based
  if (data.recurrenceType === "METER_BASED" && (!data.meterType || !data.meterThreshold)) {
    return false
  }
  return true
}, {
  message: "Tipo y umbral de medidor son requeridos para recurrencia basada en medidores",
  path: ["meterType"]
})

// Type exports
export type WorkOrderScheduleFormData = z.infer<typeof workOrderScheduleSchema>
export type RecurrenceType = z.infer<typeof recurrenceTypeSchema>
export type RecurrenceEndType = z.infer<typeof recurrenceEndTypeSchema>
export type MeterType = z.infer<typeof meterTypeSchema>

// Helper data - Week days
export const WEEK_DAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
] as const

// Helper function to get recurrence type label
export const getRecurrenceTypeLabel = (type: RecurrenceType): string => {
  const labels: Record<RecurrenceType, string> = {
    DAILY: "Diario",
    WEEKLY: "Semanal",
    MONTHLY: "Mensual",
    YEARLY: "Anual",
    METER_BASED: "Basado en Medidores"
  }
  return labels[type]
}

// Helper function to get recurrence end type label
export const getRecurrenceEndTypeLabel = (type: RecurrenceEndType): string => {
  const labels: Record<RecurrenceEndType, string> = {
    NEVER: "Nunca",
    AFTER_OCCURRENCES: "Después de X ocurrencias",
    ON_DATE: "En fecha específica"
  }
  return labels[type]
}

// Helper function to get meter type label
export const getMeterTypeLabel = (type: MeterType): string => {
  const labels: Record<MeterType, string> = {
    HOURS_RUN: "Horas de Funcionamiento",
    KILOMETERS: "Kilómetros",
    MILES: "Millas",
    TEMPERATURE: "Temperatura",
    PRESSURE: "Presión",
    CYCLES: "Ciclos de Operación",
    VIBRATION: "Vibración",
    CUSTOM: "Personalizado"
  }
  return labels[type]
}

// Helper function to create empty schedule form data
export const createEmptyScheduleForm = (): Partial<WorkOrderScheduleFormData> => ({
  name: "",
  description: "",
  recurrenceType: "WEEKLY",
  recurrenceInterval: 1,
  recurrenceEndType: "NEVER",
  weekDays: [],
  assignedUserIds: [],
  startDate: new Date().toISOString().split('T')[0],
})

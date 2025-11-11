import { z } from "zod"

export const scheduleDetailSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(200),
  description: z.string().optional(),
  recurrenceType: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY", "METER_BASED"]),
  interval: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
  assignedUserIds: z.array(z.string()).default([]),
})

export type ScheduleDetailFormData = z.infer<typeof scheduleDetailSchema>

export const recurrenceLabels: Record<string, string> = {
  DAILY: "Diario",
  WEEKLY: "Semanal",
  MONTHLY: "Mensual",
  YEARLY: "Anual",
  METER_BASED: "Basado en Medidor",
}

export const recurrenceColors: Record<string, string> = {
  DAILY: "bg-blue-100 text-blue-800",
  WEEKLY: "bg-green-100 text-green-800",
  MONTHLY: "bg-purple-100 text-purple-800",
  YEARLY: "bg-orange-100 text-orange-800",
  METER_BASED: "bg-yellow-100 text-yellow-800",
}

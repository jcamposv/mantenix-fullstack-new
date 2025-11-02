import * as z from "zod"

export const locationSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  address: z.string().optional(),
  latitude: z.number().min(-90, "Latitud debe estar entre -90 y 90").max(90, "Latitud debe estar entre -90 y 90"),
  longitude: z.number().min(-180, "Longitud debe estar entre -180 y 180").max(180, "Longitud debe estar entre -180 y 180"),
  radiusMeters: z.number().min(10, "El radio mínimo es 10 metros").max(10000, "El radio máximo es 10000 metros").default(100),
  workStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)").default("08:00"),
  workEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Formato de hora inválido (HH:mm)").default("17:00"),
  lateToleranceMinutes: z.number().min(0, "La tolerancia no puede ser negativa").max(60, "La tolerancia máxima es 60 minutos").default(15),
  timezone: z.string().default("America/Costa_Rica"),
  workDays: z.array(z.enum(["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"])).default(["MON", "TUE", "WED", "THU", "FRI"]),
  isActive: z.boolean().default(true)
})

export type LocationFormData = z.infer<typeof locationSchema>

import * as z from "zod"

export const siteSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clientCompanyId: z.string().min(1, "La empresa cliente es requerida"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Dirección de email inválida").or(z.literal("")),
  contactName: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  timezone: z.string(),
  notes: z.string().optional(),
})

export type SiteFormData = z.infer<typeof siteSchema>

export const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Hora del Este" },
  { value: "America/Chicago", label: "Hora Central" },
  { value: "America/Denver", label: "Hora de Montaña" },
  { value: "America/Los_Angeles", label: "Hora del Pacífico" },
  { value: "America/Mexico_City", label: "Ciudad de México" },
  { value: "America/Costa_Rica", label: "Costa Rica" },
  { value: "America/Guatemala", label: "Guatemala" },
  { value: "America/Panama", label: "Panamá" },
]
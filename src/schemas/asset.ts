import * as z from "zod"

export const assetSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  code: z.string().min(1, "El código es requerido"),
  description: z.string().optional(),
  location: z.string().min(1, "La ubicación es requerida"),
  siteId: z.string().min(1, "La sede es requerida").optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(["OPERATIVO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]).optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  estimatedLifespan: z.number().optional(),
  category: z.string().optional(),
})

export type AssetFormData = z.infer<typeof assetSchema>

export const ASSET_STATUS_OPTIONS = [
  { value: "OPERATIVO", label: "Operativo" },
  { value: "EN_MANTENIMIENTO", label: "En Mantenimiento" },
  { value: "FUERA_DE_SERVICIO", label: "Fuera de Servicio" },
] as const

export const ASSET_CATEGORY_OPTIONS = [
  { value: "machinery", label: "Maquinaria" },
  { value: "vehicle", label: "Vehículo" },
  { value: "tool", label: "Herramienta" },
  { value: "electrical_equipment", label: "Equipo Eléctrico" },
  { value: "computer_equipment", label: "Equipo de Cómputo" },
  { value: "furniture", label: "Mobiliario" },
  { value: "other", label: "Otros" },
] as const
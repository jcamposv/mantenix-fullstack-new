import { z } from "zod"

export const createAssetSchema = z.object({
  name: z.string().min(1, "El nombre del activo es requerido").max(255),
  code: z.string().min(1, "El código del activo es requerido").max(100),
  description: z.string().optional(),
  location: z.string().min(1, "La ubicación es requerida").max(255),
  siteId: z.string().optional(), // Can be optional - will auto-assign internal site if not provided
  images: z.array(z.string()).optional().default([]),
  status: z.enum(["OPERATIVO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]).optional().default("OPERATIVO"),
  manufacturer: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  purchaseDate: z.string().datetime().optional().nullable().transform((val) => val ? new Date(val) : null),
  estimatedLifespan: z.number().positive("La vida útil debe ser un número positivo").optional().nullable(),
  operatingHours: z.number().int().min(0, "Las horas de operación deben ser mayor o igual a 0").optional().nullable(),
  category: z.string().optional().nullable(),
  customFields: z.record(z.string(), z.unknown()).optional().nullable()
})

export const updateAssetSchema = z.object({
  name: z.string().min(1, "El nombre del activo es requerido").max(255).optional(),
  code: z.string().min(1, "El código del activo es requerido").max(100).optional(),
  description: z.string().optional().nullable(),
  location: z.string().min(1, "La ubicación es requerida").max(255).optional(),
  siteId: z.string().min(1, "La sede es requerida").optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(["OPERATIVO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]).optional(),
  manufacturer: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  serialNumber: z.string().optional().nullable(),
  purchaseDate: z.string().datetime().optional().nullable().transform((val) => val ? new Date(val) : null),
  estimatedLifespan: z.number().positive("La vida útil debe ser un número positivo").optional().nullable(),
  operatingHours: z.number().int().min(0, "Las horas de operación deben ser mayor o igual a 0").optional().nullable(),
  category: z.string().optional().nullable(),
  customFields: z.record(z.string(), z.unknown()).optional().nullable()
})

export const assetFiltersSchema = z.object({
  siteId: z.string().optional(),
  status: z.enum(["OPERATIVO", "EN_MANTENIMIENTO", "FUERA_DE_SERVICIO"]).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export type CreateAssetInput = z.infer<typeof createAssetSchema>
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>
export type AssetFiltersInput = z.infer<typeof assetFiltersSchema>
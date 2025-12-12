import { z } from "zod"

export const createSiteSchema = z.object({
  name: z.string().min(1, "El nombre de la sede es requerido").max(255),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  contactName: z.string().optional(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  timezone: z.string().optional().default("UTC"),
  notes: z.string().optional().nullable(),
  clientCompanyId: z.string().min(1, "La empresa cliente es requerida")
})

export const updateSiteSchema = z.object({
  name: z.string().min(1, "El nombre de la sede es requerido").max(255).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  contactName: z.string().optional(),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  timezone: z.string().optional(),
  notes: z.string().optional().nullable()
})

export const siteFiltersSchema = z.object({
  clientCompanyId: z.string().optional(),
  tenantCompanyId: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export type CreateSiteInput = z.infer<typeof createSiteSchema>
export type UpdateSiteInput = z.infer<typeof updateSiteSchema>
export type SiteFiltersInput = z.infer<typeof siteFiltersSchema>
import { z } from "zod"

const CompanyTierEnum = z.enum(["STARTER", "PROFESSIONAL", "ENTERPRISE"])

export const createCompanySchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es requerido").max(255),
  subdomain: z.string()
    .min(3, "El subdominio debe tener al menos 3 caracteres")
    .max(50, "El subdominio no puede tener más de 50 caracteres")
    .regex(/^[a-zA-Z0-9-]+$/, "El subdominio solo puede contener letras, números y guiones"),
  tier: CompanyTierEnum.optional().default("STARTER"),
  planId: z.string().min(1, "El plan de subscripción es requerido"),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Color primario debe ser un código hexadecimal válido").optional().default("#3b82f6"),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Color secundario debe ser un código hexadecimal válido").optional().default("#64748b"),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Color de fondo debe ser un código hexadecimal válido").optional().default("#ffffff"),
  logo: z.string().url("Logo debe ser una URL válida").optional().nullable(),
  mfaEnforced: z.boolean().optional().default(false),
  ipWhitelist: z.array(z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, "IP inválida")).optional().default([])
})

export const updateCompanySchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es requerido").max(255).optional(),
  subdomain: z.string()
    .min(3, "El subdominio debe tener al menos 3 caracteres")
    .max(50, "El subdominio no puede tener más de 50 caracteres")
    .regex(/^[a-zA-Z0-9-]+$/, "El subdominio solo puede contener letras, números y guiones")
    .optional(),
  tier: CompanyTierEnum.optional(),
  planId: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Color primario debe ser un código hexadecimal válido").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Color secundario debe ser un código hexadecimal válido").optional(),
  backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Color de fondo debe ser un código hexadecimal válido").optional(),
  logo: z.string().url("Logo debe ser una URL válida").optional().nullable(),
  logoSmall: z.string().url("Logo pequeño debe ser una URL válida").optional().nullable(),
  customFont: z.string().optional().nullable(),
  mfaEnforced: z.boolean().optional(),
  ipWhitelist: z.array(z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, "IP inválida")).optional(),
  isActive: z.boolean().optional()
})

export const companyFiltersSchema = z.object({
  tier: CompanyTierEnum.optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  search: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export const brandingQuerySchema = z.object({
  subdomain: z.string().min(1, "Subdominio es requerido")
})

export type CreateCompanyInput = z.infer<typeof createCompanySchema>
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>
export type CompanyFiltersInput = z.infer<typeof companyFiltersSchema>
export type BrandingQueryInput = z.infer<typeof brandingQuerySchema>
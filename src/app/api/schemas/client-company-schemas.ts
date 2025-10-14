import { z } from "zod"

export const createClientCompanySchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es requerido").max(255),
  companyId: z.string().min(1, "La cédula jurídica es requerida").max(50),
  address: z.string().min(1, "La dirección es requerida").max(500),
  phone: z.string().min(1, "El teléfono es requerido").max(20),
  email: z.string().email("Email inválido").max(255),
  contactName: z.string().min(1, "El nombre del contacto es requerido").max(255),
  tenantCompanyId: z.string().optional(),
  logo: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  notes: z.string().optional().nullable()
})

export const updateClientCompanySchema = z.object({
  name: z.string().min(1, "El nombre de la empresa es requerido").max(255).optional(),
  companyId: z.string().min(1, "La cédula jurídica es requerida").max(50).optional(),
  address: z.string().min(1, "La dirección es requerida").max(500).optional(),
  phone: z.string().min(1, "El teléfono es requerido").max(20).optional(),
  email: z.string().email("Email inválido").max(255).optional(),
  contactName: z.string().min(1, "El nombre del contacto es requerido").max(255).optional(),
  logo: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  notes: z.string().optional().nullable()
})

export const clientCompanyFiltersSchema = z.object({
  tenantCompanyId: z.string().optional(),
  search: z.string().optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(20)
})

export type CreateClientCompanyInput = z.infer<typeof createClientCompanySchema>
export type UpdateClientCompanyInput = z.infer<typeof updateClientCompanySchema>
export type ClientCompanyFiltersInput = z.infer<typeof clientCompanyFiltersSchema>
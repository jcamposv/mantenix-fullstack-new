import { z } from "zod"

// Schema para crear usuarios
export const createUserSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  email: z.string().email("Email inválido"),
  role: z.enum(["SUPER_ADMIN", "ADMIN_EMPRESA", "CLIENTE_ADMIN_GENERAL", "CLIENTE_ADMIN_SEDE", "CLIENTE_OPERARIO", "TECNICO"], {
    message: "Rol inválido"
  }),
  companyId: z.string().optional(),
  clientCompanyId: z.string().optional(),
  siteId: z.string().optional(),
  phone: z.string().max(20, "Teléfono muy largo").optional(),
  address: z.string().max(200, "Dirección muy larga").optional(),
  isActive: z.boolean().default(true),
  image: z.string().nullable().optional()
})

// Schema para actualizar usuarios
export const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN_EMPRESA", "CLIENTE_ADMIN_GENERAL", "CLIENTE_ADMIN_SEDE", "CLIENTE_OPERARIO", "TECNICO"]).optional(),
  companyId: z.string().optional(),
  clientCompanyId: z.string().optional(),
  siteId: z.string().optional(),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
  isActive: z.boolean().optional(),
  image: z.string().nullable().optional()
})

// Schema para filtros de usuarios
export const userFiltersSchema = z.object({
  role: z.string().optional(),
  companyId: z.string().optional(),
  clientCompanyId: z.string().optional(),
  siteId: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20)
})

// Types derivados de los schemas
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UserFiltersInput = z.infer<typeof userFiltersSchema>
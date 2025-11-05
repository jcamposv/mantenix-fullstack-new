import { z } from "zod"

/**
 * Schema para crear un grupo corporativo
 */
export const createCompanyGroupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  shareInventory: z.boolean().optional().default(true),
  autoApproveTransfers: z.boolean().optional().default(false),
  companyIds: z.array(z.string()).optional()
})

/**
 * Schema para actualizar un grupo corporativo
 */
export const updateCompanyGroupSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  description: z.string().optional(),
  shareInventory: z.boolean().optional(),
  autoApproveTransfers: z.boolean().optional(),
  isActive: z.boolean().optional()
})

/**
 * Schema para filtros de grupos corporativos
 */
export const companyGroupFiltersSchema = z.object({
  search: z.string().optional(),
  shareInventory: z.string().transform(val => val === 'true').optional(),
  isActive: z.string().transform(val => val === 'true').optional(),
  page: z.string().transform(val => parseInt(val) || 1).optional(),
  limit: z.string().transform(val => parseInt(val) || 20).optional()
})

/**
 * Schema para agregar empresas a un grupo
 */
export const addCompaniesToGroupSchema = z.object({
  companyIds: z.array(z.string()).min(1, "Debe proporcionar al menos una empresa")
})

/**
 * Schema para remover empresas de un grupo
 */
export const removeCompaniesFromGroupSchema = z.object({
  companyIds: z.array(z.string()).min(1, "Debe proporcionar al menos una empresa")
})

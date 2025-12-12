/**
 * Authority Limit Schemas
 * Zod validation schemas for authority limit forms
 */

import { z } from "zod"

export const authorityLimitSchema = z.object({
  roleKey: z.string().min(1, "La clave del rol es requerida"),
  maxDirectAuthorization: z.coerce.number().min(0, "El monto debe ser mayor o igual a 0"),
  approvalLevel: z.coerce.number().int().min(1).max(10).nullable().optional(),
  canCreateWorkOrders: z.boolean().default(false),
  canAssignDirectly: z.boolean().default(false),
  isActive: z.boolean().default(true)
})

export const createAuthorityLimitSchema = authorityLimitSchema

export const updateAuthorityLimitSchema = authorityLimitSchema.partial()

// Type exports
export type AuthorityLimitFormData = z.infer<typeof authorityLimitSchema>
export type CreateAuthorityLimitData = z.infer<typeof createAuthorityLimitSchema>
export type UpdateAuthorityLimitData = z.infer<typeof updateAuthorityLimitSchema>

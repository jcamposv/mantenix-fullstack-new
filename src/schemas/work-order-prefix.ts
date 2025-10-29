import { z } from "zod"

// Base schema for work order prefix
export const workOrderPrefixSchema = z.object({
  code: z
    .string()
    .min(1, "El código es requerido")
    .max(10, "El código no puede tener más de 10 caracteres")
    .regex(/^[A-Z0-9]+$/, "El código solo puede contener letras mayúsculas y números")
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(100, "El nombre no puede tener más de 100 caracteres"),
  description: z
    .string()
    .max(500, "La descripción no puede tener más de 500 caracteres")
    .optional(),
})

// Schema for creating a work order prefix
export const createWorkOrderPrefixSchema = workOrderPrefixSchema

// Schema for updating a work order prefix
export const updateWorkOrderPrefixSchema = workOrderPrefixSchema.partial().extend({
  isActive: z.boolean().optional(),
})

// Schema for work order prefix filters (query params)
export const workOrderPrefixFiltersSchema = z.object({
  search: z.string().optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  page: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
})

// Type exports
export type WorkOrderPrefixSchema = z.infer<typeof workOrderPrefixSchema>
export type CreateWorkOrderPrefixSchema = z.infer<typeof createWorkOrderPrefixSchema>
export type UpdateWorkOrderPrefixSchema = z.infer<typeof updateWorkOrderPrefixSchema>
export type WorkOrderPrefixFiltersSchema = z.infer<typeof workOrderPrefixFiltersSchema>

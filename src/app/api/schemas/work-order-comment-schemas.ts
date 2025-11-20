/**
 * Work Order Comment Validation Schemas
 * Zod schemas for validating work order comment API requests
 */

import { z } from "zod"

/**
 * Schema for creating a new work order comment
 */
export const createWorkOrderCommentSchema = z.object({
  content: z
    .string()
    .min(1, "El contenido es requerido")
    .max(2000, "El contenido no puede exceder 2000 caracteres"),
  isInternal: z.boolean().optional().default(false),
})

/**
 * Schema for updating an existing work order comment
 */
export const updateWorkOrderCommentSchema = z.object({
  content: z
    .string()
    .min(1, "El contenido es requerido")
    .max(2000, "El contenido no puede exceder 2000 caracteres")
    .optional(),
  isInternal: z.boolean().optional(),
})

/**
 * Schema for work order comment query parameters
 */
export const workOrderCommentQuerySchema = z.object({
  workOrderId: z.string().cuid().optional(),
  authorId: z.string().cuid().optional(),
  isInternal: z
    .string()
    .transform((val) => val === "true")
    .optional(),
})

// Type exports
export type CreateWorkOrderCommentInput = z.infer<typeof createWorkOrderCommentSchema>
export type UpdateWorkOrderCommentInput = z.infer<typeof updateWorkOrderCommentSchema>
export type WorkOrderCommentQueryParams = z.infer<typeof workOrderCommentQuerySchema>

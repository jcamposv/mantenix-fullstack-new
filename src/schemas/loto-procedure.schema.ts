/**
 * LOTO Procedure Schemas
 * Zod validation schemas for Lockout/Tagout procedures
 */

import { z } from "zod"

// ============================================================================
// Enums
// ============================================================================

export const lotoStatusSchema = z.enum([
  "PENDING",
  "APPLIED",
  "VERIFIED",
  "REMOVED"
])

// Constants
export const LOTO_STATUSES = [
  "PENDING",
  "APPLIED",
  "VERIFIED",
  "REMOVED"
] as const

// ============================================================================
// Schemas
// ============================================================================

export const lotoProcedureSchema = z.object({
  workOrderId: z.string().min(1, "El ID de la orden de trabajo es requerido"),
  assetId: z.string().min(1, "El ID del activo es requerido"),
  isolationPoints: z.array(z.string()).min(1, "Debe especificar al menos un punto de aislamiento"),
  energySources: z.array(z.string()).min(1, "Debe especificar al menos una fuente de energía"),
  lockSerialNumbers: z.array(z.string()).optional(),
  tagNumbers: z.array(z.string()).optional()
})

export const createLOTOProcedureSchema = lotoProcedureSchema

export const updateLOTOProcedureSchema = lotoProcedureSchema.partial()

export const applyLOTOSchema = z.object({
  lockSerialNumbers: z.array(z.string()).default([]),
  tagNumbers: z.array(z.string()).default([]),
  comments: z.string().max(1000).optional()
}).refine(
  (data) => data.lockSerialNumbers.length > 0 || data.tagNumbers.length > 0,
  {
    message: "Debe especificar al menos un candado o una etiqueta",
    path: ["lockSerialNumbers"]
  }
)

export const verifyLOTOSchema = z.object({
  comments: z.string().max(1000).optional()
})

export const removeLOTOSchema = z.object({
  comments: z.string().max(1000).optional()
})

// ============================================================================
// Type Exports
// ============================================================================

export type LOTOProcedureFormData = z.infer<typeof lotoProcedureSchema>
export type CreateLOTOProcedureData = z.infer<typeof createLOTOProcedureSchema>
export type UpdateLOTOProcedureData = z.infer<typeof updateLOTOProcedureSchema>
export type ApplyLOTOData = z.infer<typeof applyLOTOSchema>
export type VerifyLOTOData = z.infer<typeof verifyLOTOSchema>
export type RemoveLOTOData = z.infer<typeof removeLOTOSchema>

// ============================================================================
// Helper Functions
// ============================================================================

export const getLOTOStatusLabel = (status: z.infer<typeof lotoStatusSchema>): string => {
  const labels = {
    PENDING: "Pendiente",
    APPLIED: "Aplicado",
    VERIFIED: "Verificado",
    REMOVED: "Removido"
  }
  return labels[status]
}

export const getLOTOStatusColor = (status: z.infer<typeof lotoStatusSchema>): string => {
  const colors = {
    PENDING: "yellow",
    APPLIED: "blue",
    VERIFIED: "green",
    REMOVED: "gray"
  }
  return colors[status]
}

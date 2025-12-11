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
  lockSerialNumbers: z.array(z.string()).min(1, "Debe especificar al menos un número de serie de candado"),
  tagNumbers: z.array(z.string()).min(1, "Debe especificar al menos un número de etiqueta"),
  appliedBy: z.string().min(1, "El responsable de aplicar es requerido"),
  comments: z.string().max(1000).optional()
})

export const verifyLOTOSchema = z.object({
  verifiedBy: z.string().min(1, "El verificador es requerido"),
  verificationPassed: z.boolean(),
  comments: z.string().max(1000).optional()
})

export const removeLOTOSchema = z.object({
  removedBy: z.string().min(1, "El responsable de remover es requerido"),
  allLocksRemoved: z.boolean().refine((val) => val === true, {
    message: "Todos los candados deben ser removidos"
  }),
  allTagsRemoved: z.boolean().refine((val) => val === true, {
    message: "Todas las etiquetas deben ser removidas"
  }),
  equipmentTested: z.boolean().refine((val) => val === true, {
    message: "El equipo debe ser probado antes de remover LOTO"
  }),
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

/**
 * CAP Action Schemas
 * Zod validation schemas for Corrective and Preventive Action forms
 */

import { z } from "zod"
import { workOrderPrioritySchema } from "./approval-rule.schema"

// ============================================================================
// Enums
// ============================================================================

export const actionTypeSchema = z.enum([
  "CORRECTIVE",
  "PREVENTIVE"
])

export const capStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "IMPLEMENTED",
  "VERIFIED",
  "CLOSED"
])

// Constants
export const ACTION_TYPES = [
  "CORRECTIVE",
  "PREVENTIVE"
] as const

export const CAP_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "IMPLEMENTED",
  "VERIFIED",
  "CLOSED"
] as const

// ============================================================================
// Date Preprocessor
// ============================================================================

const datePreprocessor = (val: unknown) => {
  if (!val || val === "") return undefined
  if (typeof val === "string") {
    const date = new Date(val)
    return isNaN(date.getTime()) ? undefined : date
  }
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? undefined : val
  }
  return val
}

// ============================================================================
// Schemas
// ============================================================================

export const capActionSchema = z.object({
  rcaId: z.string().min(1, "El ID del análisis de causa raíz es requerido"),
  actionType: actionTypeSchema,
  description: z.string().min(1, "La descripción es requerida").max(1000),
  assignedTo: z.string().min(1, "El responsable es requerido"),
  priority: workOrderPrioritySchema,
  dueDate: z.preprocess(datePreprocessor, z.date().optional()),
  notes: z.string().max(2000).optional()
})

export const createCAPActionSchema = capActionSchema

export const updateCAPActionSchema = capActionSchema.partial()

export const completeCAPActionSchema = z.object({
  completedBy: z.string().min(1, "El responsable de completar es requerido"),
  notes: z.string().min(1, "Las notas de implementación son requeridas").max(2000)
})

export const verifyCAPActionSchema = z.object({
  verifiedBy: z.string().min(1, "El verificador es requerido"),
  effectiveness: z.number()
    .int("La efectividad debe ser un número entero")
    .min(1, "La efectividad mínima es 1")
    .max(5, "La efectividad máxima es 5"),
  notes: z.string().min(1, "Las notas de verificación son requeridas").max(2000)
})

// ============================================================================
// Type Exports
// ============================================================================

export type CAPActionFormData = z.infer<typeof capActionSchema>
export type CreateCAPActionData = z.infer<typeof createCAPActionSchema>
export type UpdateCAPActionData = z.infer<typeof updateCAPActionSchema>
export type CompleteCAPActionData = z.infer<typeof completeCAPActionSchema>
export type VerifyCAPActionData = z.infer<typeof verifyCAPActionSchema>

// ============================================================================
// Helper Functions
// ============================================================================

export const getActionTypeLabel = (type: z.infer<typeof actionTypeSchema>): string => {
  const labels = {
    CORRECTIVE: "Correctiva",
    PREVENTIVE: "Preventiva"
  }
  return labels[type]
}

export const getCAPStatusLabel = (status: z.infer<typeof capStatusSchema>): string => {
  const labels = {
    PENDING: "Pendiente",
    IN_PROGRESS: "En Progreso",
    IMPLEMENTED: "Implementada",
    VERIFIED: "Verificada",
    CLOSED: "Cerrada"
  }
  return labels[status]
}

export const getCAPStatusColor = (status: z.infer<typeof capStatusSchema>): string => {
  const colors = {
    PENDING: "gray",
    IN_PROGRESS: "blue",
    IMPLEMENTED: "orange",
    VERIFIED: "green",
    CLOSED: "purple"
  }
  return colors[status]
}

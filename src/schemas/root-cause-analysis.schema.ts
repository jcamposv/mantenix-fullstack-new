/**
 * Root Cause Analysis Schemas
 * Zod validation schemas for RCA forms
 */

import { z } from "zod"

// ============================================================================
// Enums
// ============================================================================

export const rcaTypeSchema = z.enum([
  "FIVE_WHY",
  "FISHBONE",
  "FAULT_TREE",
  "PARETO"
])

export const rcaStatusSchema = z.enum([
  "DRAFT",
  "IN_ANALYSIS",
  "PENDING_REVIEW",
  "APPROVED",
  "IMPLEMENTING",
  "IMPLEMENTED",
  "VERIFIED"
])

// Constants
export const RCA_TYPES = [
  "FIVE_WHY",
  "FISHBONE",
  "FAULT_TREE",
  "PARETO"
] as const

export const RCA_STATUSES = [
  "DRAFT",
  "IN_ANALYSIS",
  "PENDING_REVIEW",
  "APPROVED",
  "IMPLEMENTING",
  "IMPLEMENTED",
  "VERIFIED"
] as const

// ============================================================================
// Schemas
// ============================================================================

export const fishboneDataSchema = z.object({
  man: z.array(z.string()).optional(),
  machine: z.array(z.string()).optional(),
  material: z.array(z.string()).optional(),
  method: z.array(z.string()).optional(),
  environment: z.array(z.string()).optional(),
  management: z.array(z.string()).optional()
})

export const rootCauseAnalysisSchema = z.object({
  workOrderId: z.string().min(1, "El ID de la orden de trabajo es requerido"),
  assetId: z.string().min(1, "El ID del activo es requerido"),
  analysisType: rcaTypeSchema,
  failureMode: z.string().min(1, "El modo de falla es requerido").max(500),
  immediateSymptom: z.string().min(1, "El síntoma inmediato es requerido").max(1000),
  why1: z.string().max(500).optional(),
  why2: z.string().max(500).optional(),
  why3: z.string().max(500).optional(),
  why4: z.string().max(500).optional(),
  why5: z.string().max(500).optional(),
  rootCause: z.string().max(1000).optional(),
  fishboneData: fishboneDataSchema.optional()
})

export const createRootCauseAnalysisSchema = rootCauseAnalysisSchema

export const updateRootCauseAnalysisSchema = rootCauseAnalysisSchema.partial()

export const reviewRCASchema = z.object({
  reviewedBy: z.string().min(1, "El revisor es requerido"),
  approved: z.boolean(),
  comments: z.string().max(1000).optional()
})

export const approveRCASchema = z.object({
  approvedBy: z.string().min(1, "El aprobador es requerido"),
  comments: z.string().max(1000).optional()
})

// ============================================================================
// Type Exports
// ============================================================================

export type FishboneData = z.infer<typeof fishboneDataSchema>
export type RootCauseAnalysisFormData = z.infer<typeof rootCauseAnalysisSchema>
export type CreateRootCauseAnalysisData = z.infer<typeof createRootCauseAnalysisSchema>
export type UpdateRootCauseAnalysisData = z.infer<typeof updateRootCauseAnalysisSchema>
export type ReviewRCAData = z.infer<typeof reviewRCASchema>
export type ApproveRCAData = z.infer<typeof approveRCASchema>

// ============================================================================
// Helper Functions
// ============================================================================

export const getRCATypeLabel = (type: z.infer<typeof rcaTypeSchema>): string => {
  const labels = {
    FIVE_WHY: "5 Porqués",
    FISHBONE: "Diagrama de Ishikawa",
    FAULT_TREE: "Árbol de Fallas",
    PARETO: "Análisis Pareto"
  }
  return labels[type]
}

export const getRCAStatusLabel = (status: z.infer<typeof rcaStatusSchema>): string => {
  const labels = {
    DRAFT: "Borrador",
    IN_ANALYSIS: "En Análisis",
    PENDING_REVIEW: "Pendiente Revisión",
    APPROVED: "Aprobado",
    IMPLEMENTING: "Implementando",
    IMPLEMENTED: "Implementado",
    VERIFIED: "Verificado"
  }
  return labels[status]
}

export const getRCAStatusColor = (status: z.infer<typeof rcaStatusSchema>): string => {
  const colors = {
    DRAFT: "gray",
    IN_ANALYSIS: "blue",
    PENDING_REVIEW: "yellow",
    APPROVED: "green",
    IMPLEMENTING: "orange",
    IMPLEMENTED: "purple",
    VERIFIED: "teal"
  }
  return colors[status]
}

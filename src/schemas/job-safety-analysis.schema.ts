/**
 * Job Safety Analysis Schemas
 * Zod validation schemas for JSA forms
 */

import { z } from "zod"

// ============================================================================
// Enums
// ============================================================================

export const jsaStatusSchema = z.enum([
  "DRAFT",
  "PENDING_REVIEW",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED"
])

// Constants
export const JSA_STATUSES = [
  "DRAFT",
  "PENDING_REVIEW",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED"
] as const

// ============================================================================
// Schemas
// ============================================================================

export const jsaStepSchema = z.object({
  step: z.number().int().min(1, "El número de paso debe ser mayor a 0"),
  description: z.string().min(1, "La descripción del paso es requerida").max(1000),
  hazards: z.array(z.string()).min(1, "Debe especificar al menos un peligro"),
  controls: z.array(z.string()).min(1, "Debe especificar al menos un control")
})

export const jobSafetyAnalysisSchema = z.object({
  workOrderId: z.string().min(1, "El ID de la orden de trabajo es requerido"),
  jobSteps: z.string().min(1, "Debe especificar al menos un paso de trabajo")
})

export const createJobSafetyAnalysisSchema = jobSafetyAnalysisSchema

export const updateJobSafetyAnalysisSchema = jobSafetyAnalysisSchema.partial()

export const reviewJSASchema = z.object({
  approved: z.boolean(),
  reviewedBy: z.string().min(1, "El revisor es requerido"),
  comments: z.string().max(1000).optional()
})

export const approveJSASchema = z.object({
  approvedBy: z.string().min(1, "El aprobador es requerido"),
  comments: z.string().max(1000).optional()
})

export const rejectJSASchema = z.object({
  rejectedBy: z.string().min(1, "El responsable del rechazo es requerido"),
  comments: z.string().min(1, "Los comentarios son requeridos para rechazar").max(1000)
})

// ============================================================================
// Type Exports
// ============================================================================

export type JSAStepFormData = z.infer<typeof jsaStepSchema>
export type JobSafetyAnalysisFormData = z.infer<typeof jobSafetyAnalysisSchema>
export type CreateJobSafetyAnalysisData = z.infer<typeof createJobSafetyAnalysisSchema>
export type UpdateJobSafetyAnalysisData = z.infer<typeof updateJobSafetyAnalysisSchema>
export type ReviewJSAData = z.infer<typeof reviewJSASchema>
export type ApproveJSAData = z.infer<typeof approveJSASchema>
export type RejectJSAData = z.infer<typeof rejectJSASchema>

// ============================================================================
// Helper Functions
// ============================================================================

export const getJSAStatusLabel = (status: z.infer<typeof jsaStatusSchema>): string => {
  const labels = {
    DRAFT: "Borrador",
    PENDING_REVIEW: "Pendiente Revisión",
    PENDING_APPROVAL: "Pendiente Aprobación",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado"
  }
  return labels[status]
}

export const getJSAStatusColor = (status: z.infer<typeof jsaStatusSchema>): string => {
  const colors = {
    DRAFT: "gray",
    PENDING_REVIEW: "yellow",
    PENDING_APPROVAL: "orange",
    APPROVED: "green",
    REJECTED: "red"
  }
  return colors[status]
}

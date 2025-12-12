/**
 * Safety Briefing Schemas
 * Zod validation schemas for safety briefing with digital signature
 */

import { z } from "zod"

// ============================================================================
// Schemas
// ============================================================================

/**
 * Schema for creating/updating a safety briefing
 */
export const safetyBriefingSchema = z.object({
  workOrderId: z.string().min(1, "El ID de la orden de trabajo es requerido"),
  userId: z.string().min(1, "El ID del usuario es requerido"),
  confirmedWorkPermits: z.boolean(),
  confirmedLOTO: z.boolean(),
  confirmedJSA: z.boolean(),
  signature: z.string().optional()
}).refine(
  (data) => data.confirmedWorkPermits || data.confirmedLOTO || data.confirmedJSA,
  {
    message: "Debe confirmar al menos un documento de seguridad",
    path: ["confirmedWorkPermits"]
  }
)

/**
 * Schema for creating a safety briefing
 */
export const createSafetyBriefingSchema = safetyBriefingSchema

/**
 * Schema for checking if user has confirmed
 */
export const checkConfirmationSchema = z.object({
  workOrderId: z.string().min(1, "El ID de la orden de trabajo es requerido"),
  userId: z.string().min(1, "El ID del usuario es requerido")
})

// ============================================================================
// Type Exports
// ============================================================================

export type SafetyBriefingFormData = z.infer<typeof safetyBriefingSchema>
export type CreateSafetyBriefingData = z.infer<typeof createSafetyBriefingSchema>
export type CheckConfirmationData = z.infer<typeof checkConfirmationSchema>

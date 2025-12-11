/**
 * Work Permit Schemas
 * Zod validation schemas for work permit forms
 */

import { z } from "zod"

// ============================================================================
// Enums
// ============================================================================

export const permitTypeSchema = z.enum([
  "HOT_WORK",
  "CONFINED_SPACE",
  "ELECTRICAL",
  "HEIGHT_WORK",
  "EXCAVATION",
  "CHEMICAL",
  "RADIATION",
  "GENERAL"
])

export const permitStatusSchema = z.enum([
  "DRAFT",
  "PENDING_AUTHORIZATION",
  "ACTIVE",
  "SUSPENDED",
  "CLOSED",
  "EXPIRED"
])

// Constants
export const PERMIT_TYPES = [
  "HOT_WORK",
  "CONFINED_SPACE",
  "ELECTRICAL",
  "HEIGHT_WORK",
  "EXCAVATION",
  "CHEMICAL",
  "RADIATION",
  "GENERAL"
] as const

export const PERMIT_STATUSES = [
  "DRAFT",
  "PENDING_AUTHORIZATION",
  "ACTIVE",
  "SUSPENDED",
  "CLOSED",
  "EXPIRED"
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

export const workPermitSchema = z.object({
  workOrderId: z.string().min(1, "El ID de la orden de trabajo es requerido"),
  permitType: permitTypeSchema,
  validFrom: z.preprocess(datePreprocessor, z.date()),
  validUntil: z.preprocess(datePreprocessor, z.date()),
  location: z.string().min(1, "La ubicación es requerida").max(500),
  hazards: z.array(z.string()).min(1, "Debe especificar al menos un peligro"),
  precautions: z.array(z.string()).min(1, "Debe especificar al menos una precaución"),
  ppe: z.array(z.string()).min(1, "Debe especificar al menos un EPP"),
  emergencyContact: z.string().min(1, "El contacto de emergencia es requerido").max(255)
}).refine((data) => data.validUntil > data.validFrom, {
  message: "La fecha de fin debe ser posterior a la fecha de inicio",
  path: ["validUntil"]
})

export const createWorkPermitSchema = workPermitSchema

export const updateWorkPermitSchema = workPermitSchema.partial()

export const authorizePermitSchema = z.object({
  authorizedBy: z.string().min(1, "El autorizador es requerido"),
  comments: z.string().max(1000).optional()
})

export const closePermitSchema = z.object({
  closedBy: z.string().min(1, "El responsable del cierre es requerido"),
  comments: z.string().min(1, "Los comentarios de cierre son requeridos").max(1000)
})

// ============================================================================
// Type Exports
// ============================================================================

export type WorkPermitFormData = z.infer<typeof workPermitSchema>
export type CreateWorkPermitData = z.infer<typeof createWorkPermitSchema>
export type UpdateWorkPermitData = z.infer<typeof updateWorkPermitSchema>
export type AuthorizePermitData = z.infer<typeof authorizePermitSchema>
export type ClosePermitData = z.infer<typeof closePermitSchema>

// ============================================================================
// Helper Functions
// ============================================================================

export const getPermitTypeLabel = (type: z.infer<typeof permitTypeSchema>): string => {
  const labels = {
    HOT_WORK: "Trabajo en Caliente",
    CONFINED_SPACE: "Espacio Confinado",
    ELECTRICAL: "Eléctrico",
    HEIGHT_WORK: "Trabajo en Altura",
    EXCAVATION: "Excavación",
    CHEMICAL: "Químico",
    RADIATION: "Radiación",
    GENERAL: "General"
  }
  return labels[type]
}

export const getPermitStatusLabel = (status: z.infer<typeof permitStatusSchema>): string => {
  const labels = {
    DRAFT: "Borrador",
    PENDING_AUTHORIZATION: "Pendiente Autorización",
    ACTIVE: "Activo",
    SUSPENDED: "Suspendido",
    CLOSED: "Cerrado",
    EXPIRED: "Expirado"
  }
  return labels[status]
}

export const getPermitStatusColor = (status: z.infer<typeof permitStatusSchema>): string => {
  const colors = {
    DRAFT: "gray",
    PENDING_AUTHORIZATION: "yellow",
    ACTIVE: "green",
    SUSPENDED: "orange",
    CLOSED: "blue",
    EXPIRED: "red"
  }
  return colors[status]
}

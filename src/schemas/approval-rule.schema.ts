/**
 * Approval Rule Schemas
 * Zod validation schemas for approval rule forms
 */

import { z } from "zod"

export const workOrderPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
export const workOrderTypeSchema = z.enum([
  "PREVENTIVE",
  "CORRECTIVE",
  "PREDICTIVE",
  "INSPECTION",
  "MODIFICATION"
])
export const componentCriticalitySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])

// Constants
export const WORK_ORDER_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const
export const WORK_ORDER_TYPES = [
  "PREVENTIVE",
  "CORRECTIVE",
  "PREDICTIVE",
  "INSPECTION",
  "MODIFICATION"
] as const
export const COMPONENT_CRITICALITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const

export const approvalRuleSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(255),
  description: z.string().optional(),
  minCost: z.number().min(0, "El costo mínimo debe ser mayor o igual a 0").optional(),
  maxCost: z.number().min(0, "El costo máximo debe ser mayor o igual a 0").optional(),
  priority: workOrderPrioritySchema.optional(),
  type: workOrderTypeSchema.optional(),
  assetCriticality: componentCriticalitySchema.optional(),
  approvalLevels: z
    .number()
    .int("Los niveles deben ser un número entero")
    .min(1, "Debe haber al menos 1 nivel de aprobación")
    .max(3, "Máximo 3 niveles de aprobación"),
  isActive: z.boolean()
})

export const createApprovalRuleSchema = approvalRuleSchema

export const updateApprovalRuleSchema = approvalRuleSchema.partial()

// Type exports
export type ApprovalRuleFormData = z.infer<typeof approvalRuleSchema>
export type CreateApprovalRuleData = z.infer<typeof createApprovalRuleSchema>
export type UpdateApprovalRuleData = z.infer<typeof updateApprovalRuleSchema>

// Helper functions
export const getWorkOrderPriorityLabel = (priority: z.infer<typeof workOrderPrioritySchema>): string => {
  const labels = {
    LOW: "Baja",
    MEDIUM: "Media",
    HIGH: "Alta",
    URGENT: "Urgente"
  }
  return labels[priority]
}

export const getWorkOrderPriorityColor = (priority: z.infer<typeof workOrderPrioritySchema>): string => {
  const colors = {
    LOW: "blue",
    MEDIUM: "yellow",
    HIGH: "orange",
    URGENT: "red"
  }
  return colors[priority]
}

export const getWorkOrderTypeLabel = (type: z.infer<typeof workOrderTypeSchema>): string => {
  const labels = {
    PREVENTIVE: "Preventivo",
    CORRECTIVE: "Correctivo",
    PREDICTIVE: "Predictivo",
    INSPECTION: "Inspección",
    MODIFICATION: "Modificación"
  }
  return labels[type]
}

export const getComponentCriticalityLabel = (
  criticality: z.infer<typeof componentCriticalitySchema>
): string => {
  const labels = {
    LOW: "Baja",
    MEDIUM: "Media",
    HIGH: "Alta",
    CRITICAL: "Crítica"
  }
  return labels[criticality]
}

export const getComponentCriticalityColor = (
  criticality: z.infer<typeof componentCriticalitySchema>
): string => {
  const colors = {
    LOW: "blue",
    MEDIUM: "yellow",
    HIGH: "orange",
    CRITICAL: "red"
  }
  return colors[criticality]
}

/**
 * Work Order Approval Schemas
 * Zod validation schemas for work order approval forms
 */

import { z } from "zod"

export const approvalStatusSchema = z.enum(["PENDING", "APPROVED", "REJECTED"])

export const APPROVAL_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const

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

export const workOrderApprovalSchema = z.object({
  workOrderId: z.string().min(1, "El ID de la orden de trabajo es requerido"),
  level: z.number().int().min(1).max(3),
  approverId: z.string().optional(),
  requiredCost: z.number().min(0).optional()
})

export const createWorkOrderApprovalSchema = workOrderApprovalSchema

export const updateWorkOrderApprovalSchema = z.object({
  status: approvalStatusSchema.optional(),
  comments: z.string().max(1000).optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.preprocess(datePreprocessor, z.date().optional()),
  rejectedAt: z.preprocess(datePreprocessor, z.date().optional())
})

export const approveWorkOrderSchema = z.object({
  comments: z.string().max(1000).optional()
})

export const rejectWorkOrderSchema = z.object({
  comments: z.string().min(1, "Los comentarios son requeridos para rechazar").max(1000)
})

// Type exports
export type WorkOrderApprovalFormData = z.infer<typeof workOrderApprovalSchema>
export type CreateWorkOrderApprovalData = z.infer<typeof createWorkOrderApprovalSchema>
export type UpdateWorkOrderApprovalData = z.infer<typeof updateWorkOrderApprovalSchema>
export type ApproveWorkOrderData = z.infer<typeof approveWorkOrderSchema>
export type RejectWorkOrderData = z.infer<typeof rejectWorkOrderSchema>

// Helper functions
export const getApprovalStatusLabel = (status: z.infer<typeof approvalStatusSchema>): string => {
  const labels = {
    PENDING: "Pendiente",
    APPROVED: "Aprobado",
    REJECTED: "Rechazado"
  }
  return labels[status]
}

export const getApprovalStatusColor = (status: z.infer<typeof approvalStatusSchema>): string => {
  const colors = {
    PENDING: "yellow",
    APPROVED: "green",
    REJECTED: "red"
  }
  return colors[status]
}

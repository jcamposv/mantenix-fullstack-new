import { z } from "zod"

/**
 * Schema for assigning technicians to a work order
 */
export const assignTechniciansSchema = z.object({
  workOrderId: z.string().min(1, "ID de orden requerido"),
  technicianIds: z.array(z.string()).min(1, "Debe asignar al menos un técnico"),
})

/**
 * Schema for quick editing a work order from calendar
 */
export const workOrderQuickEditSchema = z.object({
  workOrderId: z.string().min(1, "ID de orden requerido"),
  title: z.string().min(1, "El título es requerido").max(200),
  scheduledDate: z.string().datetime("Fecha inválida"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["DRAFT", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  estimatedDuration: z.coerce.number().positive("Duración debe ser positiva").optional(),
  description: z.string().optional(),
})

/**
 * Schema for deleting a work order
 */
export const deleteWorkOrderSchema = z.object({
  workOrderId: z.string().min(1, "ID de orden requerido"),
  reason: z.string().min(10, "Debe proporcionar una razón (mínimo 10 caracteres)").optional(),
})

/**
 * Schema for quick status change
 */
export const changeStatusSchema = z.object({
  workOrderId: z.string().min(1, "ID de orden requerido"),
  status: z.enum(["DRAFT", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional(),
})

// Type exports
export type AssignTechniciansData = z.infer<typeof assignTechniciansSchema>
export type WorkOrderQuickEditData = z.infer<typeof workOrderQuickEditSchema>
export type DeleteWorkOrderData = z.infer<typeof deleteWorkOrderSchema>
export type ChangeStatusData = z.infer<typeof changeStatusSchema>

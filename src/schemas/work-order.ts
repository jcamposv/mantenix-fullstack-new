import { z } from "zod"

// Enum schemas
export const workOrderTypeSchema = z.enum(["PREVENTIVO", "CORRECTIVO", "REPARACION"])
export const workOrderPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
export const workOrderStatusSchema = z.enum(["DRAFT", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"])

// Constants for iteration
export const WORK_ORDER_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const
export const WORK_ORDER_STATUSES = ["DRAFT", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const

// Main work order form schema
export const workOrderSchema = z.object({
  title: z.string().min(1, "El título es requerido").max(255),
  description: z.string().optional(),
  type: workOrderTypeSchema,
  priority: workOrderPrioritySchema.optional(),
  status: workOrderStatusSchema.optional(),
  prefixId: z.string().optional(),

  // Location and asset (optional if EXTERNAL_CLIENT_MANAGEMENT feature is disabled)
  siteId: z.string().optional(),
  assetId: z.string().optional(),
  
  // Template integration
  templateId: z.string().optional(),
  customFieldValues: z.record(z.string(), z.unknown()).optional(),
  
  // Scheduling
  scheduledDate: z.preprocess(
    (val) => (typeof val === "string" ? new Date(val) : val),
    z.date()
  ).optional(),
  
  // Estimations
  estimatedDuration: z.number().min(1, "La duración debe ser mayor a 0").optional(),
  estimatedCost: z.number().min(0, "El costo debe ser mayor o igual a 0").optional(),
  
  // Instructions and safety
  instructions: z.string().optional(),
  safetyNotes: z.string().optional(),
  tools: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  
  // Assignment (optional - can be assigned later)
  assignedUserIds: z.array(z.string()).optional(),
  
  // Final notes (for completion)
  observations: z.string().optional(),
  completionNotes: z.string().optional(),
  actualDuration: z.number().min(0, "La duración real debe ser mayor o igual a 0").optional(),
  actualCost: z.number().min(0, "El costo real debe ser mayor o igual a 0").optional()
})

// Schema for creating work orders
export const createWorkOrderSchema = workOrderSchema.omit({
  observations: true,
  completionNotes: true,
  actualDuration: true,
  actualCost: true
})

// Schema for updating work orders
export const updateWorkOrderSchema = workOrderSchema.partial()

// Schema for quick creating work orders from calendar
export const quickCreateWorkOrderSchema = z.object({
  templateId: z.string().min(1, "Debes seleccionar un template"),
  title: z.string().min(1, "El título es requerido").max(255),
  description: z.string().optional(),
  priority: workOrderPrioritySchema,
  scheduledDate: z.date().optional(),
  siteId: z.string().optional(),
  assetId: z.string().optional(),
  assignedUserIds: z.array(z.string()).optional()
})

// Schema for completing work orders
export const completeWorkOrderSchema = z.object({
  observations: z.string().optional(),
  completionNotes: z.string().optional(),
  actualDuration: z.number().min(0, "La duración real debe ser mayor o igual a 0").optional(),
  actualCost: z.number().min(0, "El costo real debe ser mayor o igual a 0").optional(),
  customFieldValues: z.record(z.string(), z.unknown()).optional() // For updating custom field values during completion
})

// Schema for work order assignment
export const workOrderAssignmentSchema = z.object({
  userIds: z.array(z.string()).min(1, "Debe seleccionar al menos un usuario")
})

// Type exports
export type WorkOrderFormData = z.infer<typeof workOrderSchema>
export type CreateWorkOrderData = z.infer<typeof createWorkOrderSchema>
export type UpdateWorkOrderData = z.infer<typeof updateWorkOrderSchema>
export type QuickCreateWorkOrderData = z.infer<typeof quickCreateWorkOrderSchema>
export type CompleteWorkOrderData = z.infer<typeof completeWorkOrderSchema>
export type WorkOrderAssignmentData = z.infer<typeof workOrderAssignmentSchema>
export type WorkOrderType = z.infer<typeof workOrderTypeSchema>
export type WorkOrderPriority = z.infer<typeof workOrderPrioritySchema>
export type WorkOrderStatus = z.infer<typeof workOrderStatusSchema>

// Helper function to get type label
export const getWorkOrderTypeLabel = (type: WorkOrderType): string => {
  const labels: Record<WorkOrderType, string> = {
    PREVENTIVO: "Preventivo",
    CORRECTIVO: "Correctivo", 
    REPARACION: "Reparación"
  }
  return labels[type]
}

// Helper function to get priority label
export const getWorkOrderPriorityLabel = (priority: WorkOrderPriority): string => {
  const labels: Record<WorkOrderPriority, string> = {
    LOW: "Baja",
    MEDIUM: "Media",
    HIGH: "Alta",
    URGENT: "Urgente"
  }
  return labels[priority]
}

// Helper function to get status label
export const getWorkOrderStatusLabel = (status: WorkOrderStatus): string => {
  const labels: Record<WorkOrderStatus, string> = {
    DRAFT: "Borrador",
    ASSIGNED: "Asignada",
    IN_PROGRESS: "En Progreso",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada"
  }
  return labels[status]
}

// Helper function to get status color
export const getWorkOrderStatusColor = (status: WorkOrderStatus): string => {
  const colors: Record<WorkOrderStatus, string> = {
    DRAFT: "gray",
    ASSIGNED: "blue",
    IN_PROGRESS: "yellow",
    COMPLETED: "green",
    CANCELLED: "red"
  }
  return colors[status]
}

// Helper function to get priority color (for badges)
export const getWorkOrderPriorityColor = (priority: WorkOrderPriority): string => {
  const colors: Record<WorkOrderPriority, string> = {
    LOW: "gray",
    MEDIUM: "blue",
    HIGH: "orange",
    URGENT: "red"
  }
  return colors[priority]
}

// Priority colors removed - priorities are displayed as text labels only
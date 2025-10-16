import { z } from "zod"

// Enum schemas
export const workOrderTemplateStatusSchema = z.enum(["ACTIVE", "INACTIVE"])
export const workOrderTemplatePrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
export const customFieldTypeSchema = z.enum([
  "TEXT", "TEXTAREA", "NUMBER", "SELECT", "RADIO", "CHECKBOX", 
  "CHECKLIST", "DATE", "TIME", "DATETIME", "IMAGE_BEFORE", 
  "IMAGE_AFTER", "VIDEO_BEFORE", "VIDEO_AFTER", "FILE"
])

// Role enum for assignment config
export const roleSchema = z.enum([
  "SUPER_ADMIN", "ADMIN_EMPRESA", "SUPERVISOR", "TECNICO",
  "CLIENTE_ADMIN_GENERAL", "CLIENTE_ADMIN_SEDE", "CLIENTE_OPERARIO"
])

// Assignment configuration schema
export const assignmentConfigSchema = z.object({
  requiredRoles: z.array(roleSchema).min(1, "Al menos un rol es requerido"),
  optionalRoles: z.array(roleSchema).optional(),
  autoAssign: z.boolean().optional(),
  requiresApproval: z.boolean().optional()
})

// Custom field validation schema
export const customFieldValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  message: z.string().optional()
}).optional()

// Custom field schema
export const customFieldSchema = z.object({
  id: z.string().min(1, "ID del campo es requerido"),
  type: customFieldTypeSchema,
  label: z.string().min(1, "Etiqueta del campo es requerida").max(255),
  description: z.string().optional(),
  required: z.boolean().optional(),
  order: z.number().min(0, "El orden debe ser mayor o igual a 0"),
  options: z.array(z.string()).optional(),
  validation: customFieldValidationSchema,
  defaultValue: z.unknown().optional(),
  placeholder: z.string().optional(),
  multiple: z.boolean().optional()
}).refine((data) => {
  // Validar que campos de tipo SELECT, RADIO y CHECKLIST tengan opciones
  if (["SELECT", "RADIO", "CHECKLIST"].includes(data.type)) {
    return data.options && data.options.length > 0
  }
  return true
}, {
  message: "Los campos SELECT, RADIO y CHECKLIST deben tener opciones definidas",
  path: ["options"]
})

// Custom fields configuration schema
export const customFieldsConfigSchema = z.object({
  fields: z.array(customFieldSchema).optional()
}).refine((data) => {
  // Validar que los IDs de campos sean únicos
  if (!data.fields) return true
  const ids = data.fields.map(field => field.id)
  const uniqueIds = new Set(ids)
  return ids.length === uniqueIds.size
}, {
  message: "Los IDs de los campos deben ser únicos",
  path: ["fields"]
}).refine((data) => {
  // Validar que los órdenes sean únicos
  if (!data.fields) return true
  const orders = data.fields.map(field => field.order)
  const uniqueOrders = new Set(orders)
  return orders.length === uniqueOrders.size
}, {
  message: "Los órdenes de los campos deben ser únicos",
  path: ["fields"]
})

// Main work order template form schema
export const workOrderTemplateSchema = z.object({
  name: z.string().min(1, "El nombre del template es requerido").max(255),
  description: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  status: workOrderTemplateStatusSchema.optional(),
  estimatedDuration: z.number().min(1, "La duración debe ser mayor a 0").nullable().optional(),
  estimatedCost: z.number().min(0, "El costo debe ser mayor o igual a 0").nullable().optional(),
  instructions: z.string().nullable().optional(),
  safetyNotes: z.string().nullable().optional(),
  tools: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  customFields: customFieldsConfigSchema.nullable().optional()
})

// Type exports
export type WorkOrderTemplateFormData = z.infer<typeof workOrderTemplateSchema>
export type CustomField = z.infer<typeof customFieldSchema>
export type CustomFieldsConfig = z.infer<typeof customFieldsConfigSchema>
export type AssignmentConfig = z.infer<typeof assignmentConfigSchema>
export type WorkOrderTemplateStatus = z.infer<typeof workOrderTemplateStatusSchema>
export type WorkOrderTemplatePriority = z.infer<typeof workOrderTemplatePrioritySchema>
export type CustomFieldType = z.infer<typeof customFieldTypeSchema>

// Helper function to create empty custom field
export const createEmptyCustomField = (type: CustomFieldType, order: number): CustomField => ({
  id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  type,
  label: "",
  required: false,
  order,
  options: ["SELECT", "RADIO", "CHECKLIST"].includes(type) ? [""] : undefined,
  multiple: false
})

// Helper function to get field type label
export const getFieldTypeLabel = (type: CustomFieldType): string => {
  const labels: Record<CustomFieldType, string> = {
    TEXT: "Texto",
    TEXTAREA: "Área de Texto",
    NUMBER: "Número",
    SELECT: "Lista Desplegable",
    RADIO: "Opción Única",
    CHECKBOX: "Casilla de Verificación",
    CHECKLIST: "Lista de Verificación",
    DATE: "Fecha",
    TIME: "Hora",
    DATETIME: "Fecha y Hora",
    IMAGE_BEFORE: "Imágenes Antes",
    IMAGE_AFTER: "Imágenes Después",
    VIDEO_BEFORE: "Videos Antes",
    VIDEO_AFTER: "Videos Después",
    FILE: "Archivo"
  }
  return labels[type]
}

// Helper function to get priority label
export const getPriorityLabel = (priority: WorkOrderTemplatePriority): string => {
  const labels: Record<WorkOrderTemplatePriority, string> = {
    LOW: "Baja",
    MEDIUM: "Media",
    HIGH: "Alta",
    URGENT: "Urgente"
  }
  return labels[priority]
}

// Helper function to get role label
export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Super Administrador",
    ADMIN_EMPRESA: "Administrador de Empresa",
    SUPERVISOR: "Supervisor",
    TECNICO: "Técnico",
    CLIENTE_ADMIN_GENERAL: "Admin General Cliente",
    CLIENTE_ADMIN_SEDE: "Admin Sede Cliente",
    CLIENTE_OPERARIO: "Operario Cliente"
  }
  return labels[role] || role
}
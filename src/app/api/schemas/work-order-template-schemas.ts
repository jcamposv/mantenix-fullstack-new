import { z } from "zod"

// Enum schemas
export const workOrderTemplateStatusSchema = z.enum(["ACTIVE", "INACTIVE"])
export const workOrderTemplatePrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"])
export const customFieldTypeSchema = z.enum([
  "TEXT", "TEXTAREA", "NUMBER", "SELECT", "RADIO", "CHECKBOX",
  "CHECKLIST", "DATE", "TIME", "DATETIME", "IMAGE_BEFORE",
  "IMAGE_AFTER", "VIDEO_BEFORE", "VIDEO_AFTER", "FILE", "TABLE"
])

// Role enum for assignment config
export const roleSchema = z.enum([
  "SUPER_ADMIN", "ADMIN_EMPRESA", "SUPERVISOR", "TECNICO",
  "CLIENTE_ADMIN_GENERAL", "CLIENTE_ADMIN_SEDE", "CLIENTE_OPERARIO"
])

// Assignment configuration schema
export const assignmentConfigSchema = z.object({
  requiredRoles: z.array(roleSchema).min(1, "Al menos un rol es requerido"),
  optionalRoles: z.array(roleSchema).optional().default([]),
  autoAssign: z.boolean().optional().default(false),
  requiresApproval: z.boolean().optional().default(false)
})

// Custom field validation schema
export const customFieldValidationSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  message: z.string().optional()
}).optional()

// Table column schema
export const tableColumnSchema = z.object({
  id: z.string().min(1, "ID de columna es requerido"),
  label: z.string().min(1, "Etiqueta de columna es requerida"),
  type: z.enum(["text", "number", "select", "checkbox"]),
  readonly: z.boolean().default(false),
  width: z.string().optional(),
  options: z.array(z.string()).optional(),
  required: z.boolean().default(false)
})

// Table row schema
export const tableRowSchema = z.record(z.string(), z.any())

// Table configuration schema
export const tableConfigSchema = z.object({
  columns: z.array(tableColumnSchema).min(1, "Al menos una columna es requerida"),
  rows: z.array(tableRowSchema).optional(),
  allowAddRows: z.boolean().default(false),
  allowDeleteRows: z.boolean().default(false),
  minRows: z.number().min(0).optional(),
  maxRows: z.number().min(1).optional()
})

// Custom field schema
export const customFieldSchema = z.object({
  id: z.string().min(1, "ID del campo es requerido"),
  type: customFieldTypeSchema,
  label: z.string().min(1, "Etiqueta del campo es requerida").max(255),
  description: z.string().optional(),
  required: z.boolean().default(false),
  order: z.number().min(0, "El orden debe ser mayor o igual a 0"),
  options: z.array(z.string()).optional(),
  validation: customFieldValidationSchema,
  defaultValue: z.unknown().optional(),
  placeholder: z.string().optional(),
  multiple: z.boolean().optional().default(false),
  tableConfig: tableConfigSchema.optional()
}).refine((data) => {
  // Validar que campos de tipo SELECT, RADIO y CHECKLIST tengan opciones
  if (["SELECT", "RADIO", "CHECKLIST"].includes(data.type)) {
    return data.options && data.options.length > 0
  }
  return true
}, {
  message: "Los campos SELECT, RADIO y CHECKLIST deben tener opciones definidas",
  path: ["options"]
}).refine((data) => {
  // Validar que campos de tipo TABLE tengan tableConfig
  if (data.type === "TABLE") {
    return data.tableConfig !== undefined && data.tableConfig !== null
  }
  return true
}, {
  message: "Los campos TABLE deben tener configuración de tabla (tableConfig)",
  path: ["tableConfig"]
})

// Custom fields configuration schema
export const customFieldsConfigSchema = z.object({
  fields: z.array(customFieldSchema).default([])
}).refine((data) => {
  // Validar que los IDs de campos sean únicos
  const ids = data.fields.map(field => field.id)
  const uniqueIds = new Set(ids)
  return ids.length === uniqueIds.size
}, {
  message: "Los IDs de los campos deben ser únicos",
  path: ["fields"]
}).refine((data) => {
  // Validar que los órdenes sean únicos
  const orders = data.fields.map(field => field.order)
  const uniqueOrders = new Set(orders)
  return orders.length === uniqueOrders.size
}, {
  message: "Los órdenes de los campos deben ser únicos",
  path: ["fields"]
})

// Create work order template schema
export const createWorkOrderTemplateSchema = z.object({
  name: z.string().min(1, "El nombre del template es requerido").max(255),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  priority: workOrderTemplatePrioritySchema.optional().default("MEDIUM"),
  status: workOrderTemplateStatusSchema.optional().default("ACTIVE"),
  estimatedDuration: z.number().min(1, "La duración debe ser mayor a 0").optional().nullable(),
  estimatedCost: z.number().min(0, "El costo debe ser mayor o igual a 0").optional().nullable(),
  assignmentConfig: assignmentConfigSchema.optional().nullable(),
  instructions: z.string().optional().nullable(),
  safetyNotes: z.string().optional().nullable(),
  tools: z.array(z.string()).optional().default([]),
  materials: z.array(z.string()).optional().default([]),
  customFields: customFieldsConfigSchema.optional().nullable()
})

// Update work order template schema
export const updateWorkOrderTemplateSchema = z.object({
  name: z.string().min(1, "El nombre del template es requerido").max(255).optional(),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  priority: workOrderTemplatePrioritySchema.optional(),
  status: workOrderTemplateStatusSchema.optional(),
  estimatedDuration: z.number().min(1, "La duración debe ser mayor a 0").optional().nullable(),
  estimatedCost: z.number().min(0, "El costo debe ser mayor o igual a 0").optional().nullable(),
  assignmentConfig: assignmentConfigSchema.optional().nullable(),
  instructions: z.string().optional().nullable(),
  safetyNotes: z.string().optional().nullable(),
  tools: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  customFields: customFieldsConfigSchema.optional().nullable()
})

// Template filters schema
export const workOrderTemplateFiltersSchema = z.object({
  category: z.string().optional(),
  status: workOrderTemplateStatusSchema.optional(),
  priority: workOrderTemplatePrioritySchema.optional(),
  search: z.string().optional(),
  isActive: z.string().transform((val) => val === 'true').optional(),
  createdBy: z.string().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20)
})

// Template execution schema (for creating work orders from template)
export const templateExecutionSchema = z.object({
  templateId: z.string().min(1, "ID del template es requerido"),
  assetId: z.string().optional().nullable(),
  siteId: z.string().min(1, "ID de la sede es requerido"),
  assignedUserIds: z.array(z.string()).min(1, "Al menos un usuario debe ser asignado"),
  customFieldValues: z.record(z.string(), z.unknown()).default({}),
  notes: z.string().optional(),
  scheduledDate: z.string().datetime().optional().nullable().transform((val) => val ? new Date(val) : null)
})

// Type exports
export type CreateWorkOrderTemplateInput = z.infer<typeof createWorkOrderTemplateSchema>
export type UpdateWorkOrderTemplateInput = z.infer<typeof updateWorkOrderTemplateSchema>
export type WorkOrderTemplateFiltersInput = z.infer<typeof workOrderTemplateFiltersSchema>
export type TemplateExecutionInput = z.infer<typeof templateExecutionSchema>
export type AssignmentConfig = z.infer<typeof assignmentConfigSchema>
export type CustomFieldsConfig = z.infer<typeof customFieldsConfigSchema>
export type CustomField = z.infer<typeof customFieldSchema>
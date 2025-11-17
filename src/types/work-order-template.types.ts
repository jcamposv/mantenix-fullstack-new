import type { SystemRoleKey } from "@/types/auth.types"

// Enum types from Prisma
export type WorkOrderTemplateStatus = "ACTIVE" | "INACTIVE"

// Custom field types for dynamic form building
export type CustomFieldType =
  | "TEXT"           // Input de texto simple
  | "TEXTAREA"       // Área de texto multilinea
  | "NUMBER"         // Input numérico
  | "SELECT"         // Select con opciones predefinidas
  | "RADIO"          // Radio buttons
  | "CHECKBOX"       // Checkbox individual
  | "CHECKLIST"      // Lista de checkboxes (instrucciones)
  | "DATE"           // Selector de fecha
  | "TIME"           // Selector de hora
  | "DATETIME"       // Selector de fecha y hora
  | "IMAGE_BEFORE"   // Campo para imágenes antes
  | "IMAGE_AFTER"    // Campo para imágenes después
  | "VIDEO_BEFORE"   // Campo para videos antes
  | "VIDEO_AFTER"    // Campo para videos después
  | "FILE"           // Campo para archivos generales
  | "TABLE"          // Campo para tablas dinámicas

// Table column configuration
export interface TableColumn {
  id: string
  label: string
  type: "text" | "number" | "select" | "checkbox"
  readonly?: boolean
  width?: string
  options?: string[]
  required?: boolean
}

// Table row type
export type TableRow = Record<string, unknown>

// Table configuration
export interface TableConfig {
  columns: TableColumn[]
  rows?: TableRow[]
  allowAddRows?: boolean
  allowDeleteRows?: boolean
  minRows?: number
  maxRows?: number
}

// Custom field configuration for dynamic forms
export interface CustomField {
  id: string                    // Identificador único del campo
  type: CustomFieldType         // Tipo de campo
  label: string                 // Etiqueta del campo
  description?: string          // Descripción o ayuda del campo
  required?: boolean            // Si el campo es obligatorio
  order: number                 // Orden de aparición en el formulario
  options?: string[]            // Opciones para SELECT, RADIO, CHECKLIST
  validation?: {
    min?: number                // Valor mínimo (para NUMBER, TEXT length)
    max?: number                // Valor máximo (para NUMBER, TEXT length)
    pattern?: string            // Regex pattern para validación
    message?: string            // Mensaje de error personalizado
  }
  defaultValue?: unknown        // Valor por defecto
  placeholder?: string          // Placeholder para inputs
  multiple?: boolean            // Para campos que aceptan múltiples valores (FILES, IMAGES)
  tableConfig?: TableConfig     // Configuración de tabla para campos tipo TABLE
}

// Custom fields configuration structure
export interface CustomFieldsConfig {
  fields: CustomField[]
}

// Base WorkOrderTemplate interface
export interface WorkOrderTemplate {
  id: string
  name: string
  description: string | null
  category: string | null
  status: WorkOrderTemplateStatus
  customFields: CustomFieldsConfig | null
  companyId: string
  createdBy: string
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

// WorkOrderTemplate with relations
export interface WorkOrderTemplateWithRelations extends WorkOrderTemplate {
  company?: {
    id: string
    name: string
    subdomain: string
  } | null
  creator?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  } | null
  _count?: {
    workOrders?: number  // For future implementation
  }
}

// Create template data interface
export interface CreateWorkOrderTemplateData {
  name: string
  description?: string
  category?: string
  status?: WorkOrderTemplateStatus
  customFields?: CustomFieldsConfig
}

// Update template data interface
export interface UpdateWorkOrderTemplateData {
  name?: string
  description?: string
  category?: string
  status?: WorkOrderTemplateStatus
  customFields?: CustomFieldsConfig
}

// Template filters for listing
export interface WorkOrderTemplateFilters {
  category?: string
  status?: WorkOrderTemplateStatus
  search?: string
  isActive?: boolean
  createdBy?: string
}

// Paginated response for template lists
export interface PaginatedWorkOrderTemplatesResponse {
  templates: WorkOrderTemplateWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Form data when creating/editing a custom field
export interface CustomFieldFormData {
  type: CustomFieldType
  label: string
  description?: string
  required: boolean
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
  defaultValue?: unknown
  placeholder?: string
  multiple?: boolean
}

// Template execution data (for when creating work orders from template)
export interface TemplateExecutionData {
  templateId: string
  assetId?: string              // Asset related to the work order
  siteId: string                // Site where work order will be executed
  assignedUserIds: string[]     // Users assigned to the work order
  customFieldValues: Record<string, unknown> // Values for custom fields
  notes?: string                // Additional notes or modifications
  scheduledDate?: Date          // When the work order should be executed
}

// Response interface for API calls
export interface WorkOrderTemplatesResponse {
  templates?: WorkOrderTemplateWithRelations[]
  items?: WorkOrderTemplateWithRelations[]
}
import type { ComponentCriticality, FrequencyUnit } from "@prisma/client"
import type { SystemRoleKey } from "@/types/auth.types"
import type { PaginatedResponse } from "@/types/common.types"

// Define JsonValue type since it's not exported from Prisma client
type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[]

// Enum types from Prisma
export type WorkOrderType = "PREVENTIVO" | "CORRECTIVO" | "REPARACION"
export type WorkOrderPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT"
export type WorkOrderStatus = "DRAFT" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

// Base WorkOrder interface
export interface WorkOrder {
  id: string
  number: string
  prefixId: string | null
  title: string
  description: string | null
  type: WorkOrderType
  priority: WorkOrderPriority
  status: WorkOrderStatus

  // Location and asset
  siteId: string | null
  assetId: string | null

  // Predictive maintenance (PREDICTIVE_MAINTENANCE feature)
  maintenanceComponentId: string | null

  // Template integration
  templateId: string | null
  customFieldValues: JsonValue | null
  
  // Recurring work orders
  isRecurring: boolean
  scheduleId: string | null
  
  // Dates
  scheduledDate: string | null
  startedAt: string | null
  completedAt: string | null
  
  // Estimations and costs
  estimatedDuration: number | null
  estimatedCost: number | null
  actualDuration: number | null
  actualCost: number | null
  laborCost: number | null
  partsCost: number | null
  otherCosts: number | null
  downtimeCost: number | null

  // Time tracking detailed
  activeWorkTime: number | null
  waitingTime: number | null
  diagnosticTime: number | null
  travelTime: number | null
  
  // Instructions and resources
  instructions: string | null
  safetyNotes: string | null
  tools: string[]
  materials: string[]
  
  // Final notes
  observations: string | null
  completionNotes: string | null
  
  // Control and ownership
  companyId: string
  createdBy: string
  
  // Timestamps
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

// WorkOrder with relations
export interface WorkOrderWithRelations extends WorkOrder {
  company?: {
    id: string
    name: string
    subdomain: string
  } | null
  site?: {
    id: string
    name: string
    address: string | null
    clientCompany?: {
      id: string
      name: string
    } | null
  } | null
  asset?: {
    id: string
    name: string
    code: string
    manufacturer: string | null
    model: string | null
    location: string | null
    status: string
  } | null
  maintenanceComponent?: {
    id: string
    name: string
    partNumber: string | null
    criticality: ComponentCriticality | null
    mtbf: number | null
    lifeExpectancy: number | null
    // Hybrid maintenance scheduling
    manufacturerMaintenanceInterval: number | null
    manufacturerMaintenanceIntervalUnit: FrequencyUnit | null
    workOrderSchedule?: {
      id: string
      name: string
      recurrenceType: string
      nextGenerationDate: string | null
      isActive: boolean
    } | null
  } | null
  template?: {
    id: string
    name: string
    category: string | null
    customFields: JsonValue | null
  } | null
  prefix?: {
    id: string
    code: string
    name: string
  } | null
  creator?: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
  } | null
  assignments?: WorkOrderAssignmentWithUser[]
  comments?: Array<{
    id: string
    content: string
    createdAt: string
    author: {
      id: string
      name: string
      email: string
      avatar?: string | null
    }
  }>
  maintenanceAlerts?: Array<{
    id: string
    componentName: string
    assetName: string
    partNumber: string | null
    severity: 'CRITICAL' | 'WARNING' | 'INFO'
    message: string
    createdAt: string
    resolvedAt: string | null
    resolutionNotes: string | null
    resolvedBy: {
      id: string
      name: string
      email: string
    } | null
  }>
  _count?: {
    assignments?: number
  }
}

// WorkOrderAssignment interface
export interface WorkOrderAssignment {
  id: string
  workOrderId: string
  userId: string
  assignedAt: string
  assignedBy: string
}

// WorkOrderAssignment with user details
export interface WorkOrderAssignmentWithUser extends WorkOrderAssignment {
  user: {
    id: string
    name: string
    email: string
    role: SystemRoleKey
    image: string | null
  }
  assigner: {
    id: string
    name: string
    email: string
  }
}

// Create work order data interface
export interface CreateWorkOrderData {
  title: string
  description?: string
  type: WorkOrderType
  priority?: WorkOrderPriority
  status?: WorkOrderStatus
  prefixId?: string
  siteId: string
  assetId?: string
  maintenanceComponentId?: string
  templateId?: string
  customFieldValues?: Record<string, unknown>
  scheduledDate?: Date
  estimatedDuration?: number
  estimatedCost?: number
  instructions?: string
  safetyNotes?: string
  tools?: string[]
  materials?: string[]
  assignedUserIds: string[]
}

// Update work order data interface
export interface UpdateWorkOrderData {
  title?: string
  description?: string
  type?: WorkOrderType
  priority?: WorkOrderPriority
  status?: WorkOrderStatus
  siteId?: string
  assetId?: string
  maintenanceComponentId?: string
  templateId?: string
  customFieldValues?: Record<string, unknown>
  scheduledDate?: Date
  estimatedDuration?: number
  estimatedCost?: number
  instructions?: string
  safetyNotes?: string
  tools?: string[]
  materials?: string[]
  assignedUserIds?: string[]
  observations?: string
  completionNotes?: string
  actualDuration?: number
  actualCost?: number
}

// Complete work order data interface
export interface CompleteWorkOrderData {
  observations?: string
  completionNotes?: string
  actualDuration?: number
  actualCost?: number
  customFieldValues?: Record<string, unknown>
}

// Work order filters for listing
export interface WorkOrderFilters {
  siteId?: string
  clientCompanyId?: string
  assetId?: string
  templateId?: string
  type?: WorkOrderType
  priority?: WorkOrderPriority
  status?: WorkOrderStatus
  assignedToMe?: boolean | string
  createdByMe?: boolean
  scheduledDateFrom?: Date
  scheduledDateTo?: Date
  createdAtFrom?: Date
  createdAtTo?: Date
  search?: string
  isActive?: boolean
}

// Paginated response for work order lists
export type PaginatedWorkOrdersResponse = PaginatedResponse<WorkOrderWithRelations>

/**
 * @deprecated Use PaginatedWorkOrdersResponse instead. This type is kept for backward compatibility.
 * Will be removed in a future version.
 */
export interface LegacyWorkOrdersResponse {
  workOrders: WorkOrderWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Work order assignment data
export interface WorkOrderAssignmentData {
  userIds: string[]
}

// Work order statistics
export interface WorkOrderStats {
  total: number
  byStatus: Record<WorkOrderStatus, number>
  byType: Record<WorkOrderType, number>
  byPriority: Record<WorkOrderPriority, number>
  overdue: number
  dueToday: number
  dueThisWeek: number
}

// Work order number generation data
export interface WorkOrderNumberData {
  companyId: string
  year?: number
  month?: number
}

// Template execution data (when creating from template)
export interface WorkOrderFromTemplateData {
  templateId: string
  title: string
  description?: string
  siteId: string
  assetId?: string
  scheduledDate?: Date
  assignedUserIds: string[]
  customFieldValues?: Record<string, unknown>
  priority?: WorkOrderPriority
  instructions?: string
  safetyNotes?: string
  tools?: string[]
  materials?: string[]
}

/**
 * @deprecated Use PaginatedWorkOrdersResponse for paginated responses.
 * This inconsistent type is kept for backward compatibility only.
 * Will be removed in a future version.
 */
export interface WorkOrdersResponse {
  workOrders?: WorkOrderWithRelations[]
  items?: WorkOrderWithRelations[]
}

// Work order activity log entry
export interface WorkOrderActivity {
  id: string
  workOrderId: string
  type: "CREATED" | "ASSIGNED" | "STATUS_CHANGED" | "UPDATED" | "COMPLETED" | "CANCELLED" | "COMMENT_ADDED"
  description: string
  metadata?: Record<string, unknown>
  createdBy: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}
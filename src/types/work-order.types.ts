import type { Role } from "@prisma/client"

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
  title: string
  description: string | null
  type: WorkOrderType
  priority: WorkOrderPriority
  status: WorkOrderStatus
  
  // Location and asset
  siteId: string
  assetId: string | null
  
  // Template integration
  templateId: string | null
  customFieldValues: JsonValue | null
  
  // Dates
  scheduledDate: string | null
  startedAt: string | null
  completedAt: string | null
  
  // Estimations and costs
  estimatedDuration: number | null
  estimatedCost: number | null
  actualDuration: number | null
  actualCost: number | null
  
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
  } | null
  template?: {
    id: string
    name: string
    category: string | null
    customFields: JsonValue | null
  } | null
  creator?: {
    id: string
    name: string
    email: string
    role: Role
  } | null
  assignments?: WorkOrderAssignmentWithUser[]
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
    role: Role
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
  siteId: string
  assetId?: string
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
  templateId?: string
  customFieldValues?: Record<string, unknown>
  scheduledDate?: Date
  estimatedDuration?: number
  estimatedCost?: number
  instructions?: string
  safetyNotes?: string
  tools?: string[]
  materials?: string[]
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
  assetId?: string
  templateId?: string
  type?: WorkOrderType
  priority?: WorkOrderPriority
  status?: WorkOrderStatus
  assignedToMe?: boolean
  createdByMe?: boolean
  scheduledDateFrom?: Date
  scheduledDateTo?: Date
  search?: string
  isActive?: boolean
}

// Paginated response for work order lists
export interface PaginatedWorkOrdersResponse {
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

// Response interface for API calls
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
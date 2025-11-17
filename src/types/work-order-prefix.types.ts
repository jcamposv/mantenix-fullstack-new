import type { SystemRoleKey } from "@/types/auth.types"

// Base WorkOrderPrefix interface
export interface WorkOrderPrefix {
  id: string
  code: string
  name: string
  description: string | null

  // Control and ownership
  companyId: string
  createdBy: string

  // Timestamps
  isActive: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

// WorkOrderPrefix with relations
export interface WorkOrderPrefixWithRelations extends WorkOrderPrefix {
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
    workOrders?: number
  }
}

// Create work order prefix data interface
export interface CreateWorkOrderPrefixData {
  code: string
  name: string
  description?: string
}

// Update work order prefix data interface
export interface UpdateWorkOrderPrefixData {
  code?: string
  name?: string
  description?: string
  isActive?: boolean
}

// Work order prefix filters for listing
export interface WorkOrderPrefixFilters {
  search?: string
  isActive?: boolean
}

// Paginated response for work order prefix lists
export interface PaginatedWorkOrderPrefixesResponse {
  prefixes: WorkOrderPrefixWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Response interface for API calls
export interface WorkOrderPrefixesResponse {
  prefixes?: WorkOrderPrefixWithRelations[]
  items?: WorkOrderPrefixWithRelations[]
}

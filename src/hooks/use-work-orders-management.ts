/**
 * useWorkOrdersManagement Hook
 *
 * Wrapper around useServerTable for work orders with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import type {
  WorkOrderType,
  WorkOrderPriority,
  WorkOrderStatus,
  WorkOrderWithRelations,
} from '@/types/work-order.types'
import { useServerTable } from './use-server-table'

// Re-export types for convenience
export type { WorkOrderType, WorkOrderPriority, WorkOrderStatus }

/**
 * Filters for work orders management
 */
export interface WorkOrderManagementFilters {
  siteId?: string
  assetId?: string
  templateId?: string
  type?: WorkOrderType
  priority?: WorkOrderPriority
  status?: WorkOrderStatus
  search?: string
  assignedToMe?: boolean
  createdByMe?: boolean
  scheduledDateFrom?: Date
  scheduledDateTo?: Date
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseWorkOrdersManagementOptions {
  page?: number
  limit?: number
  filters?: WorkOrderManagementFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseWorkOrdersManagementResult {
  workOrders: WorkOrderWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for work orders management with comprehensive filtering
 */
export function useWorkOrdersManagement(
  options: UseWorkOrdersManagementOptions = {}
): UseWorkOrdersManagementResult {
  const {
    page = 1,
    limit = 20,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<WorkOrderWithRelations, WorkOrderManagementFilters>({
      endpoint: '/api/work-orders',
      page,
      limit,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    workOrders: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

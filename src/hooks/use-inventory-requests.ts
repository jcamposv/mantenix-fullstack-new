/**
 * useInventoryRequests Hook
 *
 * Wrapper around useServerTable for inventory requests with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import { useServerTable } from './use-server-table'
import type { InventoryRequestStatus } from '@/types/inventory.types'

/**
 * Urgency type
 */
export type RequestUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

/**
 * Inventory request item type (from API response)
 */
export interface InventoryRequestItem {
  id: string
  workOrder: {
    id: string
    number: string
    title: string
  }
  inventoryItem: {
    id: string
    code: string
    name: string
    unit: string
  }
  quantityRequested: number
  quantityApproved: number | null
  quantityDelivered: number
  status: InventoryRequestStatus
  urgency: RequestUrgency
  requestedAt: string
  requester: {
    id: string
    name: string
  }
  notes: string | null
}

/**
 * Filters for inventory requests
 */
export interface InventoryRequestFilters {
  status?: InventoryRequestStatus
  urgency?: RequestUrgency
  workOrderId?: string
  inventoryItemId?: string
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseInventoryRequestsOptions {
  page?: number
  limit?: number
  search?: string
  filters?: InventoryRequestFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseInventoryRequestsResult {
  requests: InventoryRequestItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for inventory requests with comprehensive filtering
 */
export function useInventoryRequests(
  options: UseInventoryRequestsOptions = {}
): UseInventoryRequestsResult {
  const {
    page = 1,
    limit = 20,
    search,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<InventoryRequestItem, InventoryRequestFilters>({
      endpoint: '/api/admin/inventory/requests',
      page,
      limit,
      search,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    requests: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

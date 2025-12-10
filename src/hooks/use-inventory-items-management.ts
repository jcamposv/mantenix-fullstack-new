/**
 * useInventoryItemsManagement Hook
 *
 * Wrapper around useServerTable for inventory items with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import { useServerTable } from './use-server-table'

/**
 * Filters for inventory items management
 */
export interface InventoryItemManagementFilters {
  search?: string
  category?: string
  isActive?: boolean
  companyId?: string
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseInventoryItemsManagementOptions {
  page?: number
  limit?: number
  search?: string
  filters?: InventoryItemManagementFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Inventory item type (from API response)
 */
export interface InventoryItemItem {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  subcategory: string | null
  unit: string
  minStock: number
  maxStock: number | null
  reorderPoint: number
  unitCost: number | null
  totalQuantity?: number
  totalAvailable?: number
  totalReserved?: number
  isActive: boolean
  company: {
    id: string
    name: string
  }
  _count?: {
    stock: number
    movements: number
    requests: number
  }
}

/**
 * Hook result
 */
interface UseInventoryItemsManagementResult {
  items: InventoryItemItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for inventory items management with comprehensive filtering
 */
export function useInventoryItemsManagement(
  options: UseInventoryItemsManagementOptions = {}
): UseInventoryItemsManagementResult {
  const {
    page = 1,
    limit = 20,
    search,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<InventoryItemItem, InventoryItemManagementFilters>({
      endpoint: '/api/admin/inventory/items',
      page,
      limit,
      search,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    items: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

/**
 * useInventoryMovements Hook
 *
 * Wrapper around useServerTable for inventory movements with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import { useServerTable } from './use-server-table'

/**
 * Movement type
 */
export type MovementType = 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT'

/**
 * Inventory movement item type (from API response)
 */
export interface InventoryMovementItem {
  id: string
  type: MovementType
  inventoryItem: {
    id: string
    code: string
    name: string
    unit: string
  }
  fromLocationId: string | null
  fromLocationType: string | null
  toLocationId: string | null
  toLocationType: string | null
  quantity: number
  unitCost: number | null
  totalCost: number | null
  reason: string | null
  notes: string | null
  createdAt: string
  creator: {
    id: string
    name: string
  }
}

/**
 * Filters for inventory movements
 */
export interface InventoryMovementFilters {
  type?: MovementType
  inventoryItemId?: string
  startDate?: Date
  endDate?: Date
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseInventoryMovementsOptions {
  page?: number
  limit?: number
  search?: string
  filters?: InventoryMovementFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseInventoryMovementsResult {
  movements: InventoryMovementItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for inventory movements with comprehensive filtering
 */
export function useInventoryMovements(
  options: UseInventoryMovementsOptions = {}
): UseInventoryMovementsResult {
  const {
    page = 1,
    limit = 20,
    search,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<InventoryMovementItem, InventoryMovementFilters>({
      endpoint: '/api/admin/inventory/movements',
      page,
      limit,
      search,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    movements: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

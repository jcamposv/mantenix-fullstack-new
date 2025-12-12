/**
 * useAssetsManagement Hook
 *
 * Wrapper around useServerTable for assets with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import { useServerTable } from './use-server-table'

/**
 * Asset status type
 */
export type AssetStatus = 'OPERATIVO' | 'EN_MANTENIMIENTO' | 'FUERA_DE_SERVICIO'

/**
 * Filters for assets management
 */
export interface AssetManagementFilters {
  siteId?: string
  status?: AssetStatus
  category?: string
  isActive?: boolean
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseAssetsManagementOptions {
  page?: number
  limit?: number
  search?: string
  filters?: AssetManagementFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Asset item type (from API response)
 */
export interface AssetItem {
  id: string
  name: string
  code: string
  description: string | null
  location: string
  status: AssetStatus
  category: string | null
  manufacturer: string | null
  model: string | null
  serialNumber: string | null
  registrationDate: string
  images: string[]
  site: {
    id: string
    name: string
    clientCompany: {
      id: string
      name: string
    }
  }
  _count: {
    workOrders: number
  }
}

/**
 * Hook result
 */
interface UseAssetsManagementResult {
  assets: AssetItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for assets management with comprehensive filtering
 */
export function useAssetsManagement(
  options: UseAssetsManagementOptions = {}
): UseAssetsManagementResult {
  const {
    page = 1,
    limit = 20,
    search,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<AssetItem, AssetManagementFilters>({
      endpoint: '/api/admin/assets',
      page,
      limit,
      search,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    assets: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

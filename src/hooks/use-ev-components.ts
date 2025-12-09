/**
 * useEVComponents Hook
 *
 * Wrapper around useServerTable for exploded view components with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import { useServerTable } from './use-server-table'
import type { ExplodedViewComponentWithRelations } from '@/types/exploded-view.types'

/**
 * Filters for exploded view components
 */
export interface EVComponentFilters {
  search?: string
  manufacturer?: string
  hasInventoryItem?: boolean
  isActive?: boolean
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseEVComponentsOptions {
  page?: number
  limit?: number
  filters?: EVComponentFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseEVComponentsResult {
  components: ExplodedViewComponentWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for exploded view components with comprehensive filtering
 */
export function useEVComponents(
  options: UseEVComponentsOptions = {}
): UseEVComponentsResult {
  const {
    page = 1,
    limit = 20,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<ExplodedViewComponentWithRelations, EVComponentFilters>({
      endpoint: '/api/exploded-view-components',
      page,
      limit,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    components: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

/**
 * useEVViews Hook
 *
 * Wrapper around useServerTable for exploded views with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import { useServerTable } from './use-server-table'
import type { AssetExplodedViewWithRelations } from '@/types/exploded-view.types'

/**
 * Filters for exploded views
 */
export interface EVViewFilters {
  assetId?: string
  search?: string
  isActive?: boolean
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseEVViewsOptions {
  page?: number
  limit?: number
  filters?: EVViewFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseEVViewsResult {
  views: AssetExplodedViewWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for exploded views with comprehensive filtering
 */
export function useEVViews(
  options: UseEVViewsOptions = {}
): UseEVViewsResult {
  const {
    page = 1,
    limit = 20,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<AssetExplodedViewWithRelations, EVViewFilters>({
      endpoint: '/api/exploded-views',
      page,
      limit,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    views: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

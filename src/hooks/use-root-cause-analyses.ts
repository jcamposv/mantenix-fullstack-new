/**
 * useRootCauseAnalyses Hook
 *
 * Wrapper around useServerTable for root cause analyses with type-safe filters.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import type { RootCauseAnalysisWithRelations } from '@/types/root-cause-analysis.types'
import { useServerTable } from './use-server-table'

/**
 * Filters for root cause analyses
 */
export interface RootCauseAnalysisFilters {
  search?: string
  workOrderId?: string
  assetId?: string
  analysisType?: string
  status?: string
  analyzedBy?: string
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseRootCauseAnalysesOptions {
  page?: number
  limit?: number
  search?: string
  filters?: RootCauseAnalysisFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseRootCauseAnalysesResult {
  rootCauseAnalyses: RootCauseAnalysisWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for root cause analyses management
 */
export function useRootCauseAnalyses(
  options: UseRootCauseAnalysesOptions = {}
): UseRootCauseAnalysesResult {
  const {
    page = 1,
    limit = 20,
    search,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const {
    data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  } = useServerTable<RootCauseAnalysisWithRelations, RootCauseAnalysisFilters>({
    endpoint: '/api/root-cause-analyses',
    page,
    limit,
    search,
    filters,
    autoRefresh,
    refreshInterval,
  })

  return {
    rootCauseAnalyses: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

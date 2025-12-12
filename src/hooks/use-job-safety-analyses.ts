/**
 * useJobSafetyAnalyses Hook
 *
 * Wrapper around useServerTable for job safety analyses with type-safe filters.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import type { JobSafetyAnalysisWithRelations } from '@/types/job-safety-analysis.types'
import { useServerTable } from './use-server-table'

/**
 * Filters for job safety analyses
 */
export interface JobSafetyAnalysisFilters {
  search?: string
  workOrderId?: string
  status?: string
  preparedBy?: string
  reviewedBy?: string
  approvedBy?: string
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseJobSafetyAnalysesOptions {
  page?: number
  limit?: number
  search?: string
  filters?: JobSafetyAnalysisFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseJobSafetyAnalysesResult {
  jobSafetyAnalyses: JobSafetyAnalysisWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for job safety analyses management
 */
export function useJobSafetyAnalyses(
  options: UseJobSafetyAnalysesOptions = {}
): UseJobSafetyAnalysesResult {
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
  } = useServerTable<JobSafetyAnalysisWithRelations, JobSafetyAnalysisFilters>({
    endpoint: '/api/job-safety-analyses',
    page,
    limit,
    search,
    filters,
    autoRefresh,
    refreshInterval,
  })

  return {
    jobSafetyAnalyses: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

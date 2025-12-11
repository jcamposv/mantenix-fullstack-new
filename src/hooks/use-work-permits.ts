/**
 * useWorkPermits Hook
 *
 * Wrapper around useServerTable for work permits with type-safe filters.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import type { WorkPermitWithRelations } from '@/types/work-permit.types'
import { useServerTable } from './use-server-table'

/**
 * Filters for work permits
 */
export interface WorkPermitFilters {
  search?: string
  workOrderId?: string
  permitType?: string
  status?: string
  issuedBy?: string
  location?: string
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseWorkPermitsOptions {
  page?: number
  limit?: number
  search?: string
  filters?: WorkPermitFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseWorkPermitsResult {
  workPermits: WorkPermitWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for work permits management
 */
export function useWorkPermits(
  options: UseWorkPermitsOptions = {}
): UseWorkPermitsResult {
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
  } = useServerTable<WorkPermitWithRelations, WorkPermitFilters>({
    endpoint: '/api/work-permits',
    page,
    limit,
    search,
    filters,
    autoRefresh,
    refreshInterval,
  })

  return {
    workPermits: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

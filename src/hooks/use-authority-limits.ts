/**
 * useAuthorityLimits Hook
 *
 * Wrapper around useServerTable for authority limits with type-safe filters.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import type { AuthorityLimitWithRelations } from '@/types/authority-limit.types'
import { useServerTable } from './use-server-table'

/**
 * Filters for authority limits
 */
export interface AuthorityLimitFilters {
  search?: string
  roleKey?: string
  isActive?: boolean
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseAuthorityLimitsOptions {
  page?: number
  limit?: number
  search?: string
  filters?: AuthorityLimitFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseAuthorityLimitsResult {
  authorityLimits: AuthorityLimitWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for authority limits management
 */
export function useAuthorityLimits(
  options: UseAuthorityLimitsOptions = {}
): UseAuthorityLimitsResult {
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
  } = useServerTable<AuthorityLimitWithRelations, AuthorityLimitFilters>({
    endpoint: '/api/authority-limits',
    page,
    limit,
    search,
    filters,
    autoRefresh,
    refreshInterval,
  })

  return {
    authorityLimits: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

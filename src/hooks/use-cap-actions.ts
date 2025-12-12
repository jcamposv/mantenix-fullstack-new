/**
 * useCAPActions Hook
 *
 * Wrapper around useServerTable for CAP actions with type-safe filters.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import type { CAPActionWithRelations } from '@/types/cap-action.types'
import { useServerTable } from './use-server-table'

/**
 * Filters for CAP actions
 */
export interface CAPActionFilters {
  search?: string
  rcaId?: string
  actionType?: string
  status?: string
  assignedTo?: string
  priority?: string
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseCAPActionsOptions {
  page?: number
  limit?: number
  search?: string
  filters?: CAPActionFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseCAPActionsResult {
  capActions: CAPActionWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for CAP actions management
 */
export function useCAPActions(
  options: UseCAPActionsOptions = {}
): UseCAPActionsResult {
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
  } = useServerTable<CAPActionWithRelations, CAPActionFilters>({
    endpoint: '/api/cap-actions',
    page,
    limit,
    search,
    filters,
    autoRefresh,
    refreshInterval,
  })

  return {
    capActions: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

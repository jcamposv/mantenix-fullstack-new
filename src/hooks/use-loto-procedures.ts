/**
 * useLOTOProcedures Hook
 *
 * Wrapper around useServerTable for LOTO procedures with type-safe filters.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import type { LOTOProcedureWithRelations } from '@/types/loto-procedure.types'
import { useServerTable } from './use-server-table'

/**
 * Filters for LOTO procedures
 */
export interface LOTOProcedureFilters {
  search?: string
  workOrderId?: string
  assetId?: string
  status?: string
  authorizedBy?: string
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseLOTOProceduresOptions {
  page?: number
  limit?: number
  search?: string
  filters?: LOTOProcedureFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseLOTOProceduresResult {
  lotoProcedures: LOTOProcedureWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for LOTO procedures management
 */
export function useLOTOProcedures(
  options: UseLOTOProceduresOptions = {}
): UseLOTOProceduresResult {
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
  } = useServerTable<LOTOProcedureWithRelations, LOTOProcedureFilters>({
    endpoint: '/api/loto-procedures',
    page,
    limit,
    search,
    filters,
    autoRefresh,
    refreshInterval,
  })

  return {
    lotoProcedures: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

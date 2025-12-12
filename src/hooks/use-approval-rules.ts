/**
 * useApprovalRules Hook
 *
 * Wrapper around useServerTable for approval rules with type-safe filters.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import type { ApprovalRuleWithRelations } from '@/types/approval-rule.types'
import { useServerTable } from './use-server-table'

/**
 * Filters for approval rules
 */
export interface ApprovalRuleFilters {
  search?: string
  priority?: string
  type?: string
  isActive?: boolean
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseApprovalRulesOptions {
  page?: number
  limit?: number
  search?: string
  filters?: ApprovalRuleFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseApprovalRulesResult {
  approvalRules: ApprovalRuleWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for approval rules management
 */
export function useApprovalRules(
  options: UseApprovalRulesOptions = {}
): UseApprovalRulesResult {
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
  } = useServerTable<ApprovalRuleWithRelations, ApprovalRuleFilters>({
    endpoint: '/api/approval-rules',
    page,
    limit,
    search,
    filters,
    autoRefresh,
    refreshInterval,
  })

  return {
    approvalRules: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

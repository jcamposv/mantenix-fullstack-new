/**
 * useSAEmailConfigs Hook (Super Admin)
 *
 * Wrapper around useServerTable for email configurations with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import { useServerTable } from './use-server-table'

/**
 * Email configuration item type (from API response)
 */
export interface SAEmailConfigItem {
  id: string
  companyId: string
  fromEmail: string
  fromName: string
  replyToEmail: string | null
  isActive: boolean
  company: {
    id: string
    name: string
    subdomain: string
  } | null
  _count: {
    emailTemplates: number
  }
}

/**
 * Filters for email configurations
 */
export interface SAEmailConfigFilters {
  isActive?: boolean
  companyId?: string
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseSAEmailConfigsOptions {
  page?: number
  limit?: number
  search?: string
  filters?: SAEmailConfigFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseSAEmailConfigsResult {
  configurations: SAEmailConfigItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for super admin email configs with comprehensive filtering
 */
export function useSAEmailConfigs(
  options: UseSAEmailConfigsOptions = {}
): UseSAEmailConfigsResult {
  const {
    page = 1,
    limit = 20,
    search,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<SAEmailConfigItem, SAEmailConfigFilters>({
      endpoint: '/api/admin/email-configurations',
      page,
      limit,
      search,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    configurations: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

/**
 * useSACompanies Hook (Super Admin)
 *
 * Wrapper around useServerTable for companies with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import { useServerTable } from './use-server-table'

/**
 * Company item type (from API response)
 */
export interface SACompanyItem {
  id: string
  name: string
  subdomain: string
  tier: string
  primaryColor: string
  logo: string | null
  createdAt: string
  _count: {
    users: number
  }
  subscription?: {
    id: string
    planId: string
    plan: {
      id: string
      name: string
      tier: string
    }
  } | null
}

/**
 * Filters for companies
 */
export interface SACompanyFilters {
  tier?: string
  hasSubscription?: boolean
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseSACompaniesOptions {
  page?: number
  limit?: number
  search?: string
  filters?: SACompanyFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseSACompaniesResult {
  companies: SACompanyItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for super admin companies with comprehensive filtering
 */
export function useSACompanies(
  options: UseSACompaniesOptions = {}
): UseSACompaniesResult {
  const {
    page = 1,
    limit = 20,
    search,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<SACompanyItem, SACompanyFilters>({
      endpoint: '/api/admin/companies',
      page,
      limit,
      search,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    companies: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

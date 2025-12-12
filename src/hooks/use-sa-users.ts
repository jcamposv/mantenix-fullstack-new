/**
 * useSAUsers Hook (Super Admin)
 *
 * Wrapper around useServerTable for users with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import { useServerTable } from './use-server-table'

/**
 * User item type (from API response)
 */
export interface SAUserItem {
  id: string
  name: string
  email: string
  emailVerified: boolean
  role: {
    id: string
    key: string | null
    name: string
    color: string
  }
  image: string | null
  isExternalUser: boolean
  createdAt: string
  company: {
    id: string
    name: string
    subdomain: string
  } | null
  clientCompany: {
    id: string
    name: string
    contactName: string
  } | null
}

/**
 * Filters for users
 */
export interface SAUserFilters {
  emailVerified?: boolean
  companyId?: string
  roleId?: string
  isExternalUser?: boolean
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseSAUsersOptions {
  page?: number
  limit?: number
  search?: string
  filters?: SAUserFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseSAUsersResult {
  users: SAUserItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for super admin users with comprehensive filtering
 */
export function useSAUsers(
  options: UseSAUsersOptions = {}
): UseSAUsersResult {
  const {
    page = 1,
    limit = 20,
    search,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<SAUserItem, SAUserFilters>({
      endpoint: '/api/super-admin/users',
      page,
      limit,
      search,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    users: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

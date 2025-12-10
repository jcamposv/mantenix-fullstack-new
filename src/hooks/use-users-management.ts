/**
 * useUsersManagement Hook
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
export interface UserItem {
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
  createdAt: string
  company: {
    id: string
    name: string
    subdomain: string
  } | null
}

/**
 * Filters for users management
 */
export interface UserManagementFilters {
  roleId?: string
  emailVerified?: boolean
  companyId?: string
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseUsersManagementOptions {
  page?: number
  limit?: number
  search?: string
  filters?: UserManagementFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseUsersManagementResult {
  users: UserItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for users management with comprehensive filtering
 */
export function useUsersManagement(
  options: UseUsersManagementOptions = {}
): UseUsersManagementResult {
  const {
    page = 1,
    limit = 20,
    search,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<UserItem, UserManagementFilters>({
      endpoint: '/api/admin/users',
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

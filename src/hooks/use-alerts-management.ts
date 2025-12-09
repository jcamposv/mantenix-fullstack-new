/**
 * useAlertsManagement Hook
 *
 * Wrapper around useServerTable for alerts with type-safe filters.
 * Uses the generic server pagination hook to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - DRY principle with generic hook
 * - Clean API
 */

import type { AlertStatus, AlertPriority, AlertType } from '@prisma/client'
import { useServerTable } from './use-server-table'

/**
 * Filters for alerts management
 */
export interface AlertManagementFilters {
  status?: AlertStatus
  priority?: AlertPriority
  type?: AlertType
  siteId?: string
  my?: 'reported' | 'assigned'
  startDate?: Date
  endDate?: Date
  [key: string]: unknown
}

/**
 * Hook options
 */
interface UseAlertsManagementOptions {
  page?: number
  limit?: number
  filters?: AlertManagementFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Alert item type (from API response)
 */
export interface AlertItem {
  id: string
  title: string
  description: string
  type: AlertType
  priority: AlertPriority
  status: AlertStatus
  location?: string
  reportedAt: string
  site: {
    id: string
    name: string
    clientCompany?: {
      id: string
      name: string
    }
  }
  reportedBy: {
    id: string
    name: string
    email: string
  }
  assignedTo?: {
    id: string
    name: string
    email: string
  }
  _count: {
    comments: number
  }
}

/**
 * Hook result
 */
interface UseAlertsManagementResult {
  alerts: AlertItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook for alerts management with comprehensive filtering
 */
export function useAlertsManagement(
  options: UseAlertsManagementOptions = {}
): UseAlertsManagementResult {
  const {
    page = 1,
    limit = 20,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  const { data, total, page: currentPage, limit: currentLimit, totalPages, loading, error, refetch } =
    useServerTable<AlertItem, AlertManagementFilters>({
      endpoint: '/api/alerts',
      page,
      limit,
      filters,
      autoRefresh,
      refreshInterval,
    })

  return {
    alerts: data,
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    loading,
    error,
    refetch,
  }
}

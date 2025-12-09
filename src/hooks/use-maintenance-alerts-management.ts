/**
 * useMaintenanceAlertsManagement Hook
 *
 * Enhanced SWR hook for full maintenance alerts management page.
 * Supports comprehensive filtering, pagination, and actions.
 *
 * Following Next.js Expert standards:
 * - Type-safe with explicit types
 * - SWR for caching and revalidation
 * - Clean API with useMemo for performance
 */

import { useMemo } from 'react'
import useSWR from 'swr'
import type {
  MaintenanceAlert,
  AlertFilters,
  PaginatedAlertsResponse,
  StockStatus,
} from '@/types/maintenance-alert.types'
import type { MaintenanceAlertStatus } from '@prisma/client'

/**
 * Extended filters for management page
 */
export interface AlertManagementFilters extends AlertFilters {
  siteId?: string
  status?: MaintenanceAlertStatus
  startDate?: Date
  endDate?: Date
}

/**
 * Hook options
 */
interface UseMaintenanceAlertsManagementOptions {
  page?: number
  limit?: number
  filters?: AlertManagementFilters
  autoRefresh?: boolean
  refreshInterval?: number
}

/**
 * Hook result
 */
interface UseMaintenanceAlertsManagementResult {
  alerts: MaintenanceAlert[]
  total: number
  page: number
  limit: number
  totalPages: number
  summary: PaginatedAlertsResponse['summary'] | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

const fetcher = async (url: string): Promise<PaginatedAlertsResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar alertas')
  }
  return response.json()
}

/**
 * Hook for maintenance alerts management with comprehensive filtering
 */
export function useMaintenanceAlertsManagement(
  options: UseMaintenanceAlertsManagementOptions = {}
): UseMaintenanceAlertsManagementResult {
  const {
    page = 1,
    limit = 20,
    filters,
    autoRefresh = false,
    refreshInterval = 60000,
  } = options

  // Build query URL with params
  const queryUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    // Severity filters
    if (filters?.severity && filters.severity.length > 0) {
      filters.severity.forEach((s) => params.append('severity', s))
    }

    // Criticality filters
    if (filters?.criticality && filters.criticality.length > 0) {
      filters.criticality.forEach((c) => params.append('criticality', c))
    }

    // Days until maintenance
    if (filters?.daysUntilMaintenance) {
      if (filters.daysUntilMaintenance.min !== undefined) {
        params.append('min_days', filters.daysUntilMaintenance.min.toString())
      }
      if (filters.daysUntilMaintenance.max !== undefined) {
        params.append('max_days', filters.daysUntilMaintenance.max.toString())
      }
    }

    // Stock status filters
    if (filters?.stockStatus && filters.stockStatus.length > 0) {
      filters.stockStatus.forEach((s) => params.append('stock_status', s))
    }

    // Status filter
    if (filters?.status) {
      params.append('status', filters.status)
    }

    // Date range filters
    if (filters?.startDate) {
      params.append('startDate', filters.startDate.toISOString())
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate.toISOString())
    }

    // Site filter (future support)
    if (filters?.siteId) {
      params.append('site_id', filters.siteId)
    }

    return `/api/maintenance/alerts?${params}`
  }, [page, limit, filters])

  // Use SWR with auto-refresh if enabled
  const {
    data,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<PaginatedAlertsResponse>(queryUrl, fetcher, {
    refreshInterval: autoRefresh ? refreshInterval : 0,
    revalidateOnFocus: autoRefresh,
    dedupingInterval: 5000,
    onError: (err) => {
      console.error('Error fetching maintenance alerts:', err)
    },
  })

  const error = swrError?.message ?? null

  // Refetch function
  const refetch = async () => {
    await mutate()
  }

  return {
    alerts: data?.items ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? limit,
    totalPages: data?.totalPages ?? 0,
    summary: data?.summary ?? null,
    loading: isLoading,
    error,
    refetch,
  }
}

/**
 * Helper to get stock status from alert
 */
export function getAlertStockStatus(alert: MaintenanceAlert): StockStatus {
  if (alert.currentStock === 0) return 'CRITICAL'
  if (alert.currentStock < alert.reorderPoint) return 'LOW'
  return 'SUFFICIENT'
}

/**
 * Helper to get stock status badge variant
 */
export function getStockStatusVariant(
  status: StockStatus
): 'destructive' | 'warning' | 'secondary' {
  switch (status) {
    case 'CRITICAL':
      return 'destructive'
    case 'LOW':
      return 'warning'
    case 'SUFFICIENT':
      return 'secondary'
  }
}

/**
 * Helper to get stock status label
 */
export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case 'CRITICAL':
      return 'Stock Crítico'
    case 'LOW':
      return 'Stock Bajo'
    case 'SUFFICIENT':
      return 'Stock Suficiente'
  }
}

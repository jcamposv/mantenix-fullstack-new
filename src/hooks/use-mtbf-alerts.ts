/**
 * useMTBFAlerts Hook
 *
 * Custom hook for fetching and managing MTBF-based maintenance alerts.
 * Optimized with SWR for caching, deduplication, and automatic polling.
 */

import { useMemo } from 'react'
import useSWR from 'swr'
import type { MaintenanceAlert } from '@/types/maintenance-alert.types'

interface UseMTBFAlertsOptions {
  limit?: number
  criticalOnly?: boolean
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

interface UseMTBFAlertsResult {
  alerts: MaintenanceAlert[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

interface MTBFAlertsResponse {
  items: MaintenanceAlert[]
}

const fetcher = async (url: string): Promise<MTBFAlertsResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar alertas')
  }
  return response.json()
}

/**
 * Hook to fetch and manage MTBF alerts
 */
export function useMTBFAlerts(
  options: UseMTBFAlertsOptions = {}
): UseMTBFAlertsResult {
  const {
    limit = 10,
    criticalOnly = false,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minute default
  } = options

  // Build query URL with params
  const queryUrl = useMemo(() => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(criticalOnly && { critical_only: 'true' }),
    })
    return `/api/maintenance/alerts?${params}`
  }, [limit, criticalOnly])

  // Use SWR with automatic polling if enabled
  const { data, error: swrError, isLoading, mutate } = useSWR<MTBFAlertsResponse>(
    queryUrl,
    fetcher,
    {
      refreshInterval: autoRefresh ? refreshInterval : 0, // Auto-polling when enabled
      revalidateOnFocus: autoRefresh, // Revalidate on focus if auto-refresh is enabled
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
      onError: (err) => {
        console.error('Error fetching MTBF alerts:', err)
      }
    }
  )

  const alerts = data?.items ?? []
  const error = swrError?.message ?? null

  // Refetch function for manual updates
  const refetch = async () => {
    await mutate()
  }

  return {
    alerts,
    loading: isLoading,
    error,
    refetch,
  }
}

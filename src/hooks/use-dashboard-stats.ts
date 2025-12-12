/**
 * Dashboard Stats Hook
 *
 * SWR hook for fetching dashboard statistics with auto-refresh.
 *
 * Following Next.js Expert standards:
 * - Custom hook pattern
 * - SWR for data fetching
 * - Type-safe
 */

import useSWR from 'swr'
import type { DashboardStats } from '@/server/services/dashboard.service'
import type { TimeRange, DateRange } from '@/components/dashboard/time-range-selector'

const fetcher = async (url: string): Promise<DashboardStats> => {
  const res = await fetch(url, {
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || 'Error al cargar estadísticas')
  }

  return res.json()
}

interface UseDashboardStatsOptions {
  refreshInterval?: number
  revalidateOnFocus?: boolean
  timeRange?: TimeRange
  dateRange?: DateRange
}

export function useDashboardStats(options?: UseDashboardStatsOptions) {
  const {
    refreshInterval = 30000, // 30 seconds default
    revalidateOnFocus = true,
    timeRange = 'month',
    dateRange,
  } = options || {}

  // Build query URL with time range params
  const queryUrl = `/api/dashboard/stats?timeRange=${timeRange}${
    dateRange
      ? `&startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
      : ''
  }`

  const { data, error, isLoading, mutate } = useSWR<DashboardStats>(
    queryUrl,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus,
      dedupingInterval: 10000, // 10 seconds
    }
  )

  return {
    stats: data,
    loading: isLoading,
    error,
    refetch: mutate,
  }
}

"use client"

import useSWR from "swr"
import type { DashboardKPIs } from "@/types/analytics.types"
import type { PeriodPreset } from "@/schemas/analytics"

// ============================================================================
// TYPES
// ============================================================================

interface AnalyticsDashboardFilters {
  period?: PeriodPreset
  siteId?: string
  clientCompanyId?: string
  assetId?: string
  userId?: string
  includeTimeseries?: boolean
  includeAssetReliability?: boolean
  includeMaintenancePerformance?: boolean
  includeCosts?: boolean
  includeResources?: boolean
}

// ============================================================================
// FETCHER
// ============================================================================

const fetcher = async (url: string): Promise<DashboardKPIs> => {
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al cargar KPIs del dashboard")
  }

  return response.json()
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to fetch dashboard KPIs
 *
 * @param filters - Optional filters for dashboard KPIs
 * @returns SWR response with dashboard KPIs data
 *
 * @example
 * ```tsx
 * const { data, error, isLoading } = useAnalyticsDashboard({
 *   period: "last_30_days",
 *   siteId: "site_123"
 * })
 * ```
 */
export function useAnalyticsDashboard(filters?: AnalyticsDashboardFilters) {
  // Build query params from filters
  const buildUrl = (): string => {
    const params = new URLSearchParams()

    if (filters?.period) {
      params.append("period", filters.period)
    }

    if (filters?.siteId) {
      params.append("siteId", filters.siteId)
    }

    if (filters?.clientCompanyId) {
      params.append("clientCompanyId", filters.clientCompanyId)
    }

    if (filters?.assetId) {
      params.append("assetId", filters.assetId)
    }

    if (filters?.userId) {
      params.append("userId", filters.userId)
    }

    // Optional inclusions (default true, only send if false)
    if (filters?.includeTimeseries === false) {
      params.append("includeTimeseries", "false")
    }

    if (filters?.includeAssetReliability === false) {
      params.append("includeAssetReliability", "false")
    }

    if (filters?.includeMaintenancePerformance === false) {
      params.append("includeMaintenancePerformance", "false")
    }

    if (filters?.includeCosts === false) {
      params.append("includeCosts", "false")
    }

    if (filters?.includeResources === false) {
      params.append("includeResources", "false")
    }

    const queryString = params.toString()
    return `/api/analytics/dashboard${queryString ? `?${queryString}` : ""}`
  }

  return useSWR<DashboardKPIs, Error>(buildUrl(), fetcher, {
    refreshInterval: 60000, // 60 seconds (analytics don't need to be real-time)
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 10000, // Dedupe requests within 10 seconds
    keepPreviousData: true, // Keep showing old data while revalidating
  })
}

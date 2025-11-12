"use client"

import useSWR from "swr"
import type { AnalyticsResponse } from "@/types/analytics.types"
import type { PeriodPreset } from "@/schemas/analytics"

// ============================================================================
// TYPES
// ============================================================================

interface ComprehensiveAnalyticsFilters {
  period?: PeriodPreset
  siteId?: string
  clientCompanyId?: string
  assetId?: string
  userId?: string
}

// ============================================================================
// FETCHER
// ============================================================================

const fetcher = async (url: string): Promise<AnalyticsResponse> => {
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Error al cargar analytics completos")
  }

  return response.json()
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to fetch comprehensive analytics (all metrics)
 *
 * Use this for the main analytics page to get all data in one request
 *
 * @param filters - Optional filters for analytics
 * @returns SWR response with comprehensive analytics data
 *
 * @example
 * ```tsx
 * const { data, error, isLoading, mutate } = useComprehensiveAnalytics({
 *   period: "last_30_days",
 *   siteId: "site_123"
 * })
 *
 * if (isLoading) return <LoadingSpinner />
 * if (error) return <ErrorMessage error={error} />
 *
 * return (
 *   <div>
 *     <KPICards data={data.kpis} />
 *     <AssetReliabilityChart data={data.assetReliability} />
 *     <CostBreakdown data={data.costs} />
 *   </div>
 * )
 * ```
 */
export function useComprehensiveAnalytics(
  filters?: ComprehensiveAnalyticsFilters
) {
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

    const queryString = params.toString()
    return `/api/analytics/comprehensive${queryString ? `?${queryString}` : ""}`
  }

  return useSWR<AnalyticsResponse, Error>(buildUrl(), fetcher, {
    refreshInterval: 120000, // 2 minutes (comprehensive data is expensive to compute)
    revalidateOnFocus: false, // Don't revalidate on focus for performance
    revalidateOnReconnect: true,
    dedupingInterval: 30000, // Dedupe requests within 30 seconds
    keepPreviousData: true, // Keep showing old data while revalidating
  })
}

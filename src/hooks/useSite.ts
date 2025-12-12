/**
 * useSite Hook
 *
 * Custom hook for fetching and managing individual site data.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 *
 * Usage:
 * const { site, loading, error, mutate } = useSite(siteId)
 */

"use client"

import useSWR from "swr"

export interface Site {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  contactName: string | null
  latitude: number | null
  longitude: number | null
  timezone: string
  notes: string | null
  clientCompany: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface SiteResponse {
  site?: Site
  // API might return site directly or wrapped
  id?: string
  name?: string
}

const fetcher = async (url: string): Promise<Site> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar la sede')
  }
  const data: SiteResponse = await response.json()

  // Handle both response formats: { site: {...} } or direct site
  return (data.site || data) as Site
}

interface UseSiteOptions {
  // Revalidate on focus (useful for detail pages)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
}

interface UseSiteReturn {
  site: Site | undefined
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<Site | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage a single site by ID
 *
 * @param siteId - The ID of the site to fetch
 * @param options - SWR configuration options
 * @returns Site data, loading state, error, and mutate function
 */
export function useSite(
  siteId: string | null | undefined,
  options: UseSiteOptions = {}
): UseSiteReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
  } = options

  const { data, error, isLoading, mutate, isValidating } = useSWR<Site>(
    siteId ? `/api/admin/sites/${siteId}` : null,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Sites don't change super frequently, so we can cache for a bit
      focusThrottleInterval: 60000, // 1 minute cache
      onError: (err) => {
        console.error('Error fetching site:', err)
      }
    }
  )

  return {
    site: data,
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}

/**
 * useSites Hook
 *
 * Custom hook for fetching and managing sites list.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 * Commonly used in dropdowns, selects, and forms.
 *
 * Usage:
 * const { sites, loading, error, mutate } = useSites()
 */

"use client"

import useSWR from "swr"

export interface SiteListItem {
  id: string
  name: string
  address: string | null
  clientCompany?: {
    id: string
    name: string
  }
}

interface SitesResponse {
  sites?: SiteListItem[]
  items?: SiteListItem[]
}

const fetcher = async (url: string): Promise<SiteListItem[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar sedes')
  }
  const data: SitesResponse = await response.json()

  // Handle both response formats: { sites: [...] } or { items: [...] }
  return (data.sites || data.items || []) as SiteListItem[]
}

interface UseSitesOptions {
  // Revalidate on focus (useful for real-time updates)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
  // Limit results
  limit?: number
}

interface UseSitesReturn {
  sites: SiteListItem[]
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<SiteListItem[] | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage sites list
 *
 * @param options - SWR configuration options and query params
 * @returns Sites array, loading state, error, and mutate function
 */
export function useSites(
  options: UseSitesOptions = {}
): UseSitesReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
    limit,
  } = options

  // Build query params
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  const queryString = params.toString()
  const endpoint = `/api/admin/sites${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate, isValidating } = useSWR<SiteListItem[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Sites list changes moderately, cache for 30 seconds
      focusThrottleInterval: 30000,
      onError: (err) => {
        console.error('Error fetching sites:', err)
      }
    }
  )

  return {
    sites: data || [],
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}

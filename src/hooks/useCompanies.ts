/**
 * useCompanies Hook
 *
 * Custom hook for fetching and managing companies list (super-admin).
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 * Commonly used in super-admin forms and company selectors.
 *
 * Usage:
 * const { companies, loading, error, mutate } = useCompanies()
 */

"use client"

import useSWR from "swr"

export interface Company {
  id: string
  name: string
  domain: string | null
  logo: string | null
  contactEmail: string | null
  contactPhone: string | null
  isActive: boolean
  tier: string | null
}

interface CompaniesResponse {
  companies?: Company[]
  items?: Company[]
}

const fetcher = async (url: string): Promise<Company[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar empresas')
  }
  const data: CompaniesResponse = await response.json()

  // Handle both response formats
  return (data.companies || data.items || []) as Company[]
}

interface UseCompaniesOptions {
  // Revalidate on focus (useful for real-time updates)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
  // Limit results
  limit?: number
  // Filter by active status
  isActive?: boolean
}

interface UseCompaniesReturn {
  companies: Company[]
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<Company[] | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage companies list (super-admin)
 *
 * @param options - SWR configuration options and query params
 * @returns Companies array, loading state, error, and mutate function
 */
export function useCompanies(
  options: UseCompaniesOptions = {}
): UseCompaniesReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
    limit,
    isActive,
  } = options

  // Build query params
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  if (isActive !== undefined) params.append('isActive', isActive.toString())
  const queryString = params.toString()
  const endpoint = `/api/admin/companies${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate, isValidating } = useSWR<Company[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Companies don't change often, cache for 30 seconds
      focusThrottleInterval: 30000,
      onError: (err) => {
        console.error('Error fetching companies:', err)
      }
    }
  )

  return {
    companies: data || [],
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}

/**
 * useClientCompanies Hook
 *
 * Custom hook for fetching and managing client companies list.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 * Commonly used in dropdowns, selects, and forms.
 *
 * Usage:
 * const { clientCompanies, loading, error, mutate } = useClientCompanies()
 */

"use client"

import useSWR from "swr"

export interface ClientCompany {
  id: string
  name: string
  companyId: string | null
  email: string | null
  contactName: string | null
  phone: string | null
}

interface ClientCompaniesResponse {
  clientCompanies?: ClientCompany[]
  items?: ClientCompany[]
}

const fetcher = async (url: string): Promise<ClientCompany[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar empresas cliente')
  }
  const data: ClientCompaniesResponse = await response.json()

  // Handle both response formats
  return (data.clientCompanies || data.items || []) as ClientCompany[]
}

interface UseClientCompaniesOptions {
  // Revalidate on focus (useful for real-time updates)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
  // Limit results
  limit?: number
}

interface UseClientCompaniesReturn {
  clientCompanies: ClientCompany[]
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<ClientCompany[] | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage client companies list
 *
 * @param options - SWR configuration options and query params
 * @returns Client companies array, loading state, error, and mutate function
 */
export function useClientCompanies(
  options: UseClientCompaniesOptions = {}
): UseClientCompaniesReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
    limit,
  } = options

  // Build query params
  const params = new URLSearchParams()
  if (limit) params.append('limit', limit.toString())
  const queryString = params.toString()
  const endpoint = `/api/admin/client-companies${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate, isValidating } = useSWR<ClientCompany[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Client companies don't change often, cache for 30 seconds
      focusThrottleInterval: 30000,
      onError: (err) => {
        console.error('Error fetching client companies:', err)
      }
    }
  )

  return {
    clientCompanies: data || [],
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}

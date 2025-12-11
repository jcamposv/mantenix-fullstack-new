/**
 * useCustomRoles Hook
 *
 * Custom hook for fetching and managing custom roles list.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 * Commonly used in user management forms and role selectors.
 *
 * Usage:
 * const { customRoles, loading, error, mutate } = useCustomRoles()
 */

"use client"

import useSWR from "swr"

export interface CustomRole {
  id: string
  name: string
  key: string | null
  description: string | null
  color: string
  isActive: boolean
  permissions?: Array<{
    id: string
    resource: string
    action: string
  }>
}

interface CustomRolesResponse {
  customRoles?: CustomRole[]
  roles?: CustomRole[]
  items?: CustomRole[]
}

const fetcher = async (url: string): Promise<CustomRole[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar roles personalizados')
  }
  const data: CustomRolesResponse = await response.json()

  // Handle multiple response formats
  return (data.customRoles || data.roles || data.items || []) as CustomRole[]
}

interface UseCustomRolesOptions {
  // Revalidate on focus (useful for real-time updates)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
  // Filter by active status
  isActive?: boolean
}

interface UseCustomRolesReturn {
  customRoles: CustomRole[]
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<CustomRole[] | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage custom roles list
 *
 * @param options - SWR configuration options and query params
 * @returns Custom roles array, loading state, error, and mutate function
 */
export function useCustomRoles(
  options: UseCustomRolesOptions = {}
): UseCustomRolesReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
    isActive,
  } = options

  // Build query params
  const params = new URLSearchParams()
  if (isActive !== undefined) params.append('isActive', isActive.toString())
  const queryString = params.toString()
  const endpoint = `/api/admin/custom-roles${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate, isValidating } = useSWR<CustomRole[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Custom roles rarely change, cache for 1 minute
      focusThrottleInterval: 60000,
      onError: (err) => {
        console.error('Error fetching custom roles:', err)
      }
    }
  )

  return {
    customRoles: data || [],
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}

/**
 * useUser Hook
 *
 * Custom hook for fetching and managing individual user data.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 *
 * Usage:
 * const { user, loading, error, mutate } = useUser(userId)
 */

"use client"

import useSWR from "swr"

export interface User {
  id: string
  name: string
  email: string
  role: string
  image: string | null
  phone: string | null
  active: boolean
  // Add other user fields as needed
}

interface UserResponse {
  user?: User
  // API might return user directly or wrapped
  id?: string
  name?: string
}

const fetcher = async (url: string): Promise<User> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar el usuario')
  }
  const data: UserResponse = await response.json()

  // Handle both response formats: { user: {...} } or direct user
  return (data.user || data) as User
}

interface UseUserOptions {
  // Revalidate on focus (useful for detail pages)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
}

interface UseUserReturn {
  user: User | undefined
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<User | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage a single user by ID
 *
 * @param userId - The ID of the user to fetch
 * @param options - SWR configuration options
 * @returns User data, loading state, error, and mutate function
 */
export function useUser(
  userId: string | null | undefined,
  options: UseUserOptions = {}
): UseUserReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
  } = options

  const { data, error, isLoading, mutate, isValidating } = useSWR<User>(
    userId ? `/api/admin/users/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Users don't change super frequently, cache for 1 minute
      focusThrottleInterval: 60000,
      onError: (err) => {
        console.error('Error fetching user:', err)
      }
    }
  )

  return {
    user: data,
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}

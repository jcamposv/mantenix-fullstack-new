/**
 * useUsers Hook
 *
 * Custom hook for fetching and managing users list.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 * Commonly used in dropdowns, selects, and assignment components.
 *
 * Usage:
 * const { users, loading, error, mutate } = useUsers()
 */

"use client"

import useSWR from "swr"
import type { UserWithRelations } from "@/types/user.types"
import type { PaginatedResponse } from "@/types/common.types"

type UsersResponse = PaginatedResponse<UserWithRelations> | { users?: UserWithRelations[]; items?: UserWithRelations[] }

const fetcher = async (url: string): Promise<UserWithRelations[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar usuarios')
  }
  const data: UsersResponse = await response.json()

  // Handle both response formats: { users: [...] } or { items: [...] } or PaginatedResponse
  if ('items' in data && Array.isArray(data.items)) {
    return data.items
  }
  if ('users' in data && Array.isArray(data.users)) {
    return data.users
  }
  return []
}

interface UseUsersOptions {
  // Revalidate on focus (useful for real-time updates)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
}

interface UseUsersReturn {
  users: UserWithRelations[]
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<UserWithRelations[] | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage users list
 *
 * @param options - SWR configuration options
 * @returns Users array, loading state, error, and mutate function
 */
export function useUsers(
  options: UseUsersOptions = {}
): UseUsersReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
  } = options

  const { data, error, isLoading, mutate, isValidating } = useSWR<UserWithRelations[]>(
    '/api/admin/users',
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Users list changes moderately, cache for 30 seconds
      focusThrottleInterval: 30000,
      onError: (err) => {
        console.error('Error fetching users:', err)
      }
    }
  )

  return {
    users: data || [],
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}

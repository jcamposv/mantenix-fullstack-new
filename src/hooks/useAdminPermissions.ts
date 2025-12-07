/**
 * useAdminPermissions Hook
 *
 * Custom hook for fetching the complete list of permissions available in the system.
 * Used for role management and permission assignment.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 *
 * Usage:
 * const { permissionGroups, loading, error } = useAdminPermissions()
 */

"use client"

import useSWR from "swr"

interface Permission {
  id: string
  key: string
  name: string
  description: string | null
  module: string
}

export interface PermissionGroup {
  module: string
  label: string
  permissions: Permission[]
}


const fetcher = async (url: string): Promise<PermissionGroup[]> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar permisos')
  }
  const data: PermissionGroup[] = await response.json()
  return data
}

interface UseAdminPermissionsOptions {
  // Whether to group permissions by module
  grouped?: boolean
  // Whether to filter for custom role permissions only
  forCustomRole?: boolean
  // Revalidate on focus (default: false for admin data)
  revalidateOnFocus?: boolean
}

interface UseAdminPermissionsReturn {
  permissionGroups: PermissionGroup[]
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<PermissionGroup[] | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch all available permissions in the system (for admin)
 *
 * @param options - Configuration options for filtering and grouping
 * @returns Permission groups data, loading state, error, and mutate function
 */
export function useAdminPermissions(
  options: UseAdminPermissionsOptions = {}
): UseAdminPermissionsReturn {
  const {
    grouped = true,
    forCustomRole = true,
    revalidateOnFocus = false,
  } = options

  // Build query params
  const params = new URLSearchParams()
  if (grouped) params.append('grouped', 'true')
  if (forCustomRole) params.append('forCustomRole', 'true')

  const endpoint = `/api/admin/permissions?${params.toString()}`

  const { data, error, isLoading, mutate, isValidating } = useSWR<PermissionGroup[]>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Permissions list rarely changes, cache for 2 minutes
      focusThrottleInterval: 120000,
      onError: (err) => {
        console.error('Error fetching admin permissions:', err)
      }
    }
  )

  return {
    permissionGroups: data || [],
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}

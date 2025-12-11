/**
 * useWorkOrderTemplates Hook
 *
 * Custom hook for fetching and managing work order templates list.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 * Commonly used in work order creation forms and dropdowns.
 *
 * Usage:
 * const { templates, loading, error, mutate } = useWorkOrderTemplates()
 */

"use client"

import useSWR from "swr"
import type { WorkOrderTemplateWithRelations, PaginatedWorkOrderTemplatesResponse } from "@/types/work-order-template.types"

const fetcher = async (url: string): Promise<PaginatedWorkOrderTemplatesResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar plantillas')
  }
  const data: PaginatedWorkOrderTemplatesResponse = await response.json()
  return data
}

interface UseWorkOrderTemplatesOptions {
  // Revalidate on focus (useful for real-time updates)
  revalidateOnFocus?: boolean
  // Refresh interval in milliseconds (0 = no auto-refresh)
  refreshInterval?: number
  // Pagination
  page?: number
  limit?: number
}

interface UseWorkOrderTemplatesReturn {
  templates: WorkOrderTemplateWithRelations[]
  loading: boolean
  error: Error | undefined
  mutate: () => Promise<PaginatedWorkOrderTemplatesResponse | undefined>
  isValidating: boolean
}

/**
 * Hook to fetch and manage work order templates list
 *
 * @param options - SWR configuration options and query params
 * @returns Templates array, loading state, error, and mutate function
 */
export function useWorkOrderTemplates(
  options: UseWorkOrderTemplatesOptions = {}
): UseWorkOrderTemplatesReturn {
  const {
    revalidateOnFocus = false,
    refreshInterval = 0,
    page,
    limit,
  } = options

  // Build query params
  const params = new URLSearchParams()
  if (page) params.append('page', page.toString())
  if (limit) params.append('limit', limit.toString())
  const queryString = params.toString()
  const endpoint = `/api/work-order-templates${queryString ? `?${queryString}` : ''}`

  const { data, error, isLoading, mutate, isValidating } = useSWR<PaginatedWorkOrderTemplatesResponse>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Templates don't change often, cache for 1 minute
      focusThrottleInterval: 60000,
      onError: (err) => {
        console.error('Error fetching work order templates:', err)
      }
    }
  )

  return {
    templates: data?.items || [],
    loading: isLoading,
    error,
    mutate,
    isValidating,
  }
}

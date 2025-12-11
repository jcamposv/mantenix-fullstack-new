/**
 * useServerTable Hook
 *
 * Generic SWR hook for server-side pagination and filtering.
 * Centralizes all table pagination logic to avoid code duplication.
 *
 * Following Next.js Expert standards:
 * - Type-safe with generics
 * - SWR for caching and revalidation
 * - Reusable across all tables
 * - Clean API with useMemo for performance
 * - Debounced search (500ms) to avoid excessive API calls
 */

import { useMemo, useState, useEffect } from 'react'
import useSWR from 'swr'

/**
 * Options for the hook
 */
export interface UseServerTableOptions<TItem, TFilters extends Record<string, unknown>> {
  /** Base API endpoint (e.g., '/api/alerts') */
  endpoint: string
  /** Current page number (1-indexed) */
  page?: number
  /** Items per page */
  limit?: number
  /** Search term for server-side search (debounced automatically) */
  search?: string
  /** Debounce delay for search in milliseconds (default: 500ms) */
  searchDebounce?: number
  /** Filter object - will be converted to query params */
  filters?: TFilters
  /** Function to transform API response to items array */
  transform?: (data: unknown) => TItem[]
  /** Enable auto-refresh */
  autoRefresh?: boolean
  /** Refresh interval in milliseconds */
  refreshInterval?: number
  /** Custom fetcher function */
  fetcher?: (url: string) => Promise<ServerTableResponse<TItem>>
  /** Custom query param builder */
  buildQueryParams?: (filters: TFilters) => URLSearchParams
}

/**
 * Standard API response format
 */
export interface ServerTableResponse<TItem> {
  // Support multiple response formats
  items?: TItem[]
  data?: TItem[]
  alerts?: TItem[]
  workOrders?: TItem[]
  assets?: TItem[]
  // Pagination info
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

/**
 * Hook result
 */
export interface UseServerTableResult<TItem> {
  /** Array of items for current page */
  data: TItem[]
  /** Total number of items across all pages */
  total: number
  /** Current page number */
  page: number
  /** Items per page */
  limit: number
  /** Total number of pages */
  totalPages: number
  /** Loading state */
  loading: boolean
  /** Error message if any */
  error: string | null
  /** Function to manually refetch data */
  refetch: () => Promise<void>
}

/**
 * Default fetcher function
 */
const defaultFetcher = async <TItem>(url: string): Promise<ServerTableResponse<TItem>> => {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error('Error al cargar datos')
  }
  return response.json() as Promise<ServerTableResponse<TItem>>
}

/**
 * Default query param builder
 * Converts filters object to URLSearchParams
 */
const defaultBuildQueryParams = <TFilters extends Record<string, unknown>>(
  filters?: TFilters
): URLSearchParams => {
  const params = new URLSearchParams()

  if (!filters) return params

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null) return

    // Handle arrays (for multi-select filters)
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, String(item)))
      return
    }

    // Handle Date objects
    if (value instanceof Date) {
      params.append(key, value.toISOString())
      return
    }

    // Handle booleans
    if (typeof value === 'boolean') {
      params.append(key, value.toString())
      return
    }

    // Handle all other types
    params.append(key, String(value))
  })

  return params
}

/**
 * Extract items from various response formats
 */
const extractItems = <TItem>(
  data: unknown,
  transform?: (data: unknown) => TItem[]
): TItem[] => {
  if (transform) {
    return transform(data)
  }

  // Type guard to check if data has the expected structure
  const response = data as Record<string, unknown>

  // Try common response formats
  return (
    (response?.items as TItem[]) ||
    (response?.data as TItem[]) ||
    (response?.alerts as TItem[]) ||
    (response?.workOrders as TItem[]) ||
    (response?.assets as TItem[]) ||
    []
  )
}

/**
 * Extract pagination info from response
 */
const extractPagination = (
  data: unknown,
  currentPage: number,
  currentLimit: number
) => {
  const response = data as Record<string, unknown>

  // Check if pagination is in nested object
  if (response?.pagination && typeof response.pagination === 'object') {
    const pagination = response.pagination as Record<string, unknown>
    return {
      page: (pagination.page as number) ?? currentPage,
      limit: (pagination.limit as number) ?? currentLimit,
      total: (pagination.total as number) ?? 0,
      totalPages: (pagination.totalPages as number) ?? 0,
    }
  }

  // Check if pagination is at root level
  return {
    page: (response?.page as number) ?? currentPage,
    limit: (response?.limit as number) ?? currentLimit,
    total: (response?.total as number) ?? 0,
    totalPages: (response?.totalPages as number) ?? 0,
  }
}

/**
 * Generic hook for server-side table with pagination and filtering
 *
 * @example
 * ```tsx
 * const { data, loading, total, totalPages, refetch } = useServerTable({
 *   endpoint: '/api/alerts',
 *   page: 1,
 *   limit: 20,
 *   filters: { status: 'OPEN', priority: 'HIGH' },
 *   autoRefresh: true,
 * })
 * ```
 */
export function useServerTable<
  TItem = unknown,
  TFilters extends Record<string, unknown> = Record<string, unknown>
>(
  options: UseServerTableOptions<TItem, TFilters>
): UseServerTableResult<TItem> {
  const {
    endpoint,
    page = 1,
    limit = 20,
    search,
    searchDebounce = 500,
    filters,
    transform,
    autoRefresh = false,
    refreshInterval = 60000,
    fetcher,
    buildQueryParams = defaultBuildQueryParams,
  } = options

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, searchDebounce)

    return () => clearTimeout(timer)
  }, [search, searchDebounce])

  // Use the provided fetcher or default to our generic fetcher
  const fetchData = fetcher || ((url: string) => defaultFetcher<TItem>(url))

  // Build query URL with params
  const queryUrl = useMemo(() => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    // Add search param if provided (using debounced value)
    if (debouncedSearch && debouncedSearch.trim()) {
      params.append('search', debouncedSearch.trim())
    }

    // Add custom filters
    if (filters) {
      const filterParams = buildQueryParams(filters)
      filterParams.forEach((value, key) => {
        params.append(key, value)
      })
    }

    return `${endpoint}?${params.toString()}`
  }, [endpoint, page, limit, debouncedSearch, filters, buildQueryParams])

  // Use SWR with auto-refresh if enabled
  const {
    data: responseData,
    error: swrError,
    isLoading,
    mutate,
  } = useSWR<ServerTableResponse<TItem>>(queryUrl, fetchData, {
    refreshInterval: autoRefresh ? refreshInterval : 0,
    revalidateOnFocus: autoRefresh,
    dedupingInterval: 5000,
    onError: (err) => {
      console.error('Error fetching table data:', err)
    },
  })

  const error = swrError?.message ?? null

  // Extract data and pagination
  const data = extractItems<TItem>(responseData, transform)
  const pagination = extractPagination(responseData, page, limit)

  // Refetch function
  const refetch = async () => {
    await mutate()
  }

  return {
    data,
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: pagination.totalPages,
    loading: isLoading,
    error,
    refetch,
  }
}

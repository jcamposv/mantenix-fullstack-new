/**
 * useWorkOrderPrefixes Hook
 *
 * Custom hook for fetching and managing work order prefixes.
 * Optimized with SWR for caching, deduplication, and automatic revalidation.
 */

"use client"

import useSWR from 'swr'
import { useMemo, useState, useCallback, useEffect } from 'react'
import type {
  WorkOrderPrefixWithRelations,
  WorkOrderPrefixFilters,
  PaginatedWorkOrderPrefixesResponse,
  CreateWorkOrderPrefixData,
  UpdateWorkOrderPrefixData,
} from '@/types/work-order-prefix.types'

const fetcher = async (url: string): Promise<PaginatedWorkOrderPrefixesResponse> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Error al cargar los prefijos de órdenes de trabajo')
  }
  return response.json()
}

interface UseWorkOrderPrefixesOptions {
  filters?: WorkOrderPrefixFilters
  pagination?: {
    page: number
    limit: number
  }
  revalidateOnFocus?: boolean
  refreshInterval?: number
}

export function useWorkOrderPrefixes(options: UseWorkOrderPrefixesOptions = {}) {
  const { filters, pagination, revalidateOnFocus = false, refreshInterval = 0 } = options

  // Build query params
  const endpoint = useMemo(() => {
    const searchParams = new URLSearchParams()

    // Add pagination
    if (pagination?.page) {
      searchParams.append('page', pagination.page.toString())
    }
    if (pagination?.limit) {
      searchParams.append('limit', pagination.limit.toString())
    }

    // Add filters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString())
        }
      })
    }

    return `/api/work-order-prefixes?${searchParams.toString()}`
  }, [pagination?.page, pagination?.limit, filters])

  const { data, error, isLoading, mutate, isValidating } = useSWR<PaginatedWorkOrderPrefixesResponse>(
    endpoint,
    fetcher,
    {
      revalidateOnFocus,
      refreshInterval,
      dedupingInterval: 10000, // Dedupe requests within 10 seconds
      // Prefixes rarely change, cache for 2 minutes
      focusThrottleInterval: 120000,
      onError: (err) => {
        console.error('Error fetching work order prefixes:', err)
      }
    }
  )

  return {
    prefixes: data?.items || [],
    loading: isLoading,
    error: error?.message || null,
    pagination: {
      page: data?.page || 1,
      limit: data?.limit || 50,
      total: data?.total || 0,
      totalPages: data?.totalPages || 0
    },
    refetch: mutate,
    isValidating,
  }
}

/**
 * Hook for managing a single work order prefix
 */
export function useWorkOrderPrefix(id?: string) {
  const [prefix, setPrefix] = useState<WorkOrderPrefixWithRelations | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPrefix = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/work-order-prefixes/${id}`)

      if (!response.ok) {
        throw new Error('Error al cargar el prefijo')
      }

      const data = await response.json()
      setPrefix(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      fetchPrefix()
    }
  }, [id, fetchPrefix])

  return {
    prefix,
    loading,
    error,
    refetch: fetchPrefix,
  }
}

/**
 * Hook for prefix mutations (create, update, delete)
 */
export function useWorkOrderPrefixMutations() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createPrefix = async (data: CreateWorkOrderPrefixData): Promise<WorkOrderPrefixWithRelations> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/work-order-prefixes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el prefijo')
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const updatePrefix = async (
    id: string,
    data: UpdateWorkOrderPrefixData
  ): Promise<WorkOrderPrefixWithRelations> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/work-order-prefixes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar el prefijo')
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deletePrefix = async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/work-order-prefixes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar el prefijo')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createPrefix,
    updatePrefix,
    deletePrefix,
  }
}

/**
 * Hook to fetch all active prefixes (for dropdowns/selectors)
 * Optimized with longer cache since active prefixes rarely change
 */
export function useActivePrefixes() {
  const { prefixes, loading, error, refetch } = useWorkOrderPrefixes({
    filters: { isActive: true },
    pagination: { page: 1, limit: 100 },
  })

  return {
    prefixes,
    loading,
    error,
    refetch,
  }
}

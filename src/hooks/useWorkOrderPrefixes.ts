"use client"

import { useState, useEffect, useCallback } from 'react'
import type {
  WorkOrderPrefixWithRelations,
  WorkOrderPrefixFilters,
  PaginatedWorkOrderPrefixesResponse,
  CreateWorkOrderPrefixData,
  UpdateWorkOrderPrefixData,
} from '@/types/work-order-prefix.types'

interface UseWorkOrderPrefixesOptions {
  filters?: WorkOrderPrefixFilters
  pagination?: {
    page: number
    limit: number
  }
  autoFetch?: boolean
}

export function useWorkOrderPrefixes(options: UseWorkOrderPrefixesOptions = {}) {
  const [prefixes, setPrefixes] = useState<WorkOrderPrefixWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })

  const fetchPrefixes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()

      // Add pagination
      if (options.pagination?.page) {
        searchParams.append('page', options.pagination.page.toString())
      }
      if (options.pagination?.limit) {
        searchParams.append('limit', options.pagination.limit.toString())
      }

      // Add filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value.toString())
          }
        })
      }

      const response = await fetch(`/api/work-order-prefixes?${searchParams.toString()}`)

      if (!response.ok) {
        throw new Error('Error al cargar los prefijos de órdenes de trabajo')
      }

      const data: PaginatedWorkOrderPrefixesResponse = await response.json()

      setPrefixes(data.items)
      setPagination({
        page: data.page || 1,
        limit: data.limit || 50,
        total: data.total || 0,
        totalPages: data.totalPages || 0
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.pagination?.page, options.pagination?.limit, JSON.stringify(options.filters)])

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchPrefixes()
    }
  }, [fetchPrefixes, options.autoFetch])

  return {
    prefixes,
    loading,
    error,
    pagination,
    refetch: fetchPrefixes,
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
 */
export function useActivePrefixes() {
  const { prefixes, loading, error, refetch } = useWorkOrderPrefixes({
    filters: { isActive: true },
    pagination: { page: 1, limit: 100 },
    autoFetch: true,
  })

  return {
    prefixes,
    loading,
    error,
    refetch,
  }
}

"use client"

import { useState, useEffect } from 'react'
import type { WorkOrderWithRelations, WorkOrderFilters, PaginatedWorkOrdersResponse } from '@/types/work-order.types'

interface UseWorkOrdersOptions {
  filters?: WorkOrderFilters
  pagination?: {
    page: number
    limit: number
  }
}

export function useWorkOrders(options: UseWorkOrdersOptions = {}) {
  const [workOrders, setWorkOrders] = useState<WorkOrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  })

  const fetchWorkOrders = async () => {
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
            if (value instanceof Date) {
              searchParams.append(key, value.toISOString())
            } else {
              searchParams.append(key, value.toString())
            }
          }
        })
      }

      const response = await fetch(`/api/work-orders?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar las órdenes de trabajo')
      }

      const data: PaginatedWorkOrdersResponse = await response.json()
      
      setWorkOrders(data.workOrders)
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
  }

  useEffect(() => {
    fetchWorkOrders()
  }, [JSON.stringify(options)])

  return {
    workOrders,
    loading,
    error,
    pagination,
    refetch: fetchWorkOrders
  }
}

export function useMyWorkOrders(options: UseWorkOrdersOptions = {}) {
  const [workOrders, setWorkOrders] = useState<WorkOrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyWorkOrders = async () => {
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

      // Add filters (excluding assignedToMe since this endpoint is specifically for assigned orders)
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (key !== 'assignedToMe' && value !== undefined && value !== null && value !== '') {
            if (value instanceof Date) {
              searchParams.append(key, value.toISOString())
            } else {
              searchParams.append(key, value.toString())
            }
          }
        })
      }

      const response = await fetch(`/api/work-orders/my?${searchParams.toString()}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar tus órdenes de trabajo')
      }

      const data: PaginatedWorkOrdersResponse = await response.json()
      setWorkOrders(data.workOrders)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyWorkOrders()
  }, [JSON.stringify(options)])

  return {
    workOrders,
    loading,
    error,
    refetch: fetchMyWorkOrders
  }
}
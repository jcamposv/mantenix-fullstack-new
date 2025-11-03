"use client"

import useSWR from "swr"
import { DateRange } from "react-day-picker"

interface DashboardFilters {
  dateRange?: DateRange
}

interface WorkOrderDashboardStats {
  total: number
  inProgress: number
  completed: number
  pending: number
  overdue: number
  completionRate: number
  avgCompletionTime: number
  activeUsers: number
  recentActivity: Array<{
    id: string
    type: "completed" | "started" | "assigned" | "overdue"
    workOrderNumber: string
    workOrderTitle: string
    userName: string
    timestamp: Date
  }>
  performanceMetrics: Array<{
    date: string
    completed: number
    efficiency: number
  }>
  upcomingWorkOrders: Array<{
    id: string
    number: string
    title: string
    scheduledDate: Date
    priority: string
    status: string
    site?: {
      id: string
      name: string
    }
    _count?: {
      assignments: number
    }
  }>
}

const fetcher = async (url: string): Promise<WorkOrderDashboardStats> => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Error al cargar estadísticas del dashboard')
  }

  return response.json()
}

export function useWorkOrdersDashboard(filters?: DashboardFilters) {
  // Build query params from filters
  const buildUrl = () => {
    const params = new URLSearchParams()

    if (filters?.dateRange?.from) {
      params.append('dateFrom', filters.dateRange.from.toISOString())
    }

    if (filters?.dateRange?.to) {
      params.append('dateTo', filters.dateRange.to.toISOString())
    }

    const queryString = params.toString()
    return `/api/work-orders/dashboard${queryString ? `?${queryString}` : ''}`
  }

  return useSWR(buildUrl(), fetcher, {
    refreshInterval: 30 * 20000, // 20 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 100000, // Dedupe requests within 5 seconds
  })
}
"use client"

import useSWR from "swr"

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
}

const fetcher = async (url: string): Promise<WorkOrderDashboardStats> => {
  const response = await fetch(url)
  
  if (!response.ok) {
    throw new Error('Error al cargar estadísticas del dashboard')
  }

  return response.json()
}

export function useWorkOrdersDashboard() {
  return useSWR('/api/work-orders/dashboard', fetcher, {
    refreshInterval: 30 * 20000, // 20 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    dedupingInterval: 100000, // Dedupe requests within 5 seconds
  })
}
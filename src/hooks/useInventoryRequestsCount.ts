"use client"

import { useState, useEffect, useCallback } from "react"
import { useCurrentUser } from "./useCurrentUser"

interface UseInventoryRequestsCountReturn {
  pendingApprovalsCount: number
  pendingDeliveriesCount: number
  loading: boolean
  refetch: () => Promise<void>
}

export function useInventoryRequestsCount(): UseInventoryRequestsCountReturn {
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0)
  const [pendingDeliveriesCount, setPendingDeliveriesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const { user } = useCurrentUser()

  // Fetch counts from API
  const fetchCounts = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch counts based on user role
      const isWarehouseManager = user.role === 'ENCARGADO_BODEGA'
      const canApprove = user.role ? ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA', 'JEFE_MANTENIMIENTO'].includes(user.role) : false

      // Fetch pending approvals count (for managers/admins)
      if (canApprove) {
        const approvalsResponse = await fetch('/api/admin/inventory/requests?status=PENDING&limit=1')
        if (approvalsResponse.ok) {
          const data = await approvalsResponse.json()
          setPendingApprovalsCount(data.total || 0)
        }
      }

      // Fetch pending deliveries count (for warehouse managers)
      if (isWarehouseManager) {
        const deliveriesResponse = await fetch('/api/admin/inventory/requests?status=APPROVED&limit=1')
        if (deliveriesResponse.ok) {
          const data = await deliveriesResponse.json()
          setPendingDeliveriesCount(data.total || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching inventory requests counts:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Initial fetch
  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  // Refetch every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [fetchCounts])

  return {
    pendingApprovalsCount,
    pendingDeliveriesCount,
    loading,
    refetch: fetchCounts
  }
}

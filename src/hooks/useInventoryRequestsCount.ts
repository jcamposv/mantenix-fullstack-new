"use client"

import useSWR from "swr"
import { useCurrentUser } from "./useCurrentUser"

interface UseInventoryRequestsCountReturn {
  pendingApprovalsCount: number
  pendingDeliveriesCount: number
  loading: boolean
  refetch: () => Promise<void>
}

interface InventoryRequestsResponse {
  total: number
}

const fetcher = async (url: string): Promise<InventoryRequestsResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

export function useInventoryRequestsCount(): UseInventoryRequestsCountReturn {
  const { user } = useCurrentUser()

  // Determine user role capabilities
  const isWarehouseManager = user?.role === 'ENCARGADO_BODEGA'
  const canApprove = user?.role ? ['SUPER_ADMIN', 'ADMIN_GRUPO', 'ADMIN_EMPRESA', 'JEFE_MANTENIMIENTO'].includes(user.role) : false

  // Fetch pending approvals count (for managers/admins)
  const { data: approvalsData, isLoading: approvalsLoading, mutate: refetchApprovals } = useSWR<InventoryRequestsResponse>(
    canApprove ? '/api/admin/inventory/requests?status=PENDING&limit=1' : null,
    fetcher,
    {
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      revalidateOnFocus: true, // Revalidate when window gets focus
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  )

  // Fetch pending deliveries count (for warehouse managers)
  const { data: deliveriesData, isLoading: deliveriesLoading, mutate: refetchDeliveries } = useSWR<InventoryRequestsResponse>(
    isWarehouseManager ? '/api/admin/inventory/requests?status=APPROVED&limit=1' : null,
    fetcher,
    {
      refreshInterval: 30000, // Auto-refresh every 30 seconds
      revalidateOnFocus: true, // Revalidate when window gets focus
      dedupingInterval: 5000, // Dedupe requests within 5 seconds
    }
  )

  const pendingApprovalsCount = approvalsData?.total ?? 0
  const pendingDeliveriesCount = deliveriesData?.total ?? 0
  const loading = approvalsLoading || deliveriesLoading

  // Refetch function to manually trigger updates
  const refetch = async () => {
    await Promise.all([
      canApprove ? refetchApprovals() : Promise.resolve(),
      isWarehouseManager ? refetchDeliveries() : Promise.resolve(),
    ])
  }

  return {
    pendingApprovalsCount,
    pendingDeliveriesCount,
    loading,
    refetch
  }
}

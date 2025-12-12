import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { DeliverFromWarehouseFormData, ConfirmReceiptFormData } from "@/schemas/inventory"

interface UseInventoryRequestActionsProps {
  requestId: string
  onSuccess?: () => void
}

export function useInventoryRequestActions({
  requestId,
  onSuccess
}: UseInventoryRequestActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const deliverFromWarehouse = async (data: DeliverFromWarehouseFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/inventory/requests/${requestId}/deliver-from-warehouse`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al entregar desde bodega")
      }

      toast.success("Entrega registrada exitosamente")
      onSuccess?.()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al entregar")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const receiveAtDestination = async (data: DeliverFromWarehouseFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/inventory/requests/${requestId}/receive-at-destination`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al recibir en bodega destino")
      }

      toast.success("Recepción en bodega destino confirmada exitosamente")
      onSuccess?.()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al recibir en destino")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const confirmReceipt = async (data: ConfirmReceiptFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/admin/inventory/requests/${requestId}/confirm-receipt`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al confirmar recepción")
      }

      toast.success("Recepción confirmada exitosamente")
      onSuccess?.()
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al confirmar")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    deliverFromWarehouse,
    receiveAtDestination,
    confirmReceipt,
    isLoading
  }
}

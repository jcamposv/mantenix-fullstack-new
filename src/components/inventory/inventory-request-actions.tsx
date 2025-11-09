"use client"

import { Button } from "@/components/ui/button"
import { Package, CheckCircle2, XCircle, Trash2 } from "lucide-react"
import type { InventoryRequestStatus } from "@/types/inventory.types"
import type { Role } from "@prisma/client"

interface InventoryRequestActionsProps {
  status: InventoryRequestStatus
  userRole: Role
  userCompanyId: string
  sourceCompanyId?: string | null
  destinationCompanyId?: string | null
  warehouseDeliveredAt?: string | null
  destinationWarehouseReceivedAt?: string | null
  receivedAt?: string | null
  onDeliverFromWarehouse?: () => void
  onReceiveAtDestination?: () => void
  onConfirmReceipt?: () => void
  onApprove?: () => void
  onReject?: () => void
  onCancel?: () => void
  isLoading?: boolean
}

const canApprove = (role: Role): boolean => {
  return ["SUPER_ADMIN", "ADMIN_GRUPO", "ADMIN_EMPRESA", "JEFE_MANTENIMIENTO"].includes(role)
}

const canDeliverFromWarehouse = (role: Role): boolean => {
  return ["SUPER_ADMIN", "ADMIN_GRUPO", "ADMIN_EMPRESA", "ENCARGADO_BODEGA"].includes(role)
}

const canConfirmReceipt = (role: Role): boolean => {
  return ["SUPER_ADMIN", "ADMIN_GRUPO", "ADMIN_EMPRESA", "TECNICO", "JEFE_MANTENIMIENTO"].includes(role)
}

export function InventoryRequestActions({
  status,
  userRole,
  userCompanyId,
  sourceCompanyId,
  destinationCompanyId,
  warehouseDeliveredAt,
  destinationWarehouseReceivedAt,
  receivedAt,
  onDeliverFromWarehouse,
  onReceiveAtDestination,
  onConfirmReceipt,
  onApprove,
  onReject,
  onCancel,
  isLoading = false
}: InventoryRequestActionsProps) {
  const actions: React.ReactNode[] = []

  // PENDING: Show approve/reject buttons
  if (status === "PENDING" && canApprove(userRole)) {
    if (onApprove) {
      actions.push(
        <Button
          key="approve"
          onClick={onApprove}
          disabled={isLoading}
          size="sm"
          variant="default"
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Aprobar
        </Button>
      )
    }
    if (onReject) {
      actions.push(
        <Button
          key="reject"
          onClick={onReject}
          disabled={isLoading}
          variant="outline"
          size="sm"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Rechazar
        </Button>
      )
    }
  }

  // APPROVED: Show deliver from warehouse button ONLY if user is in SOURCE company
  const isSourceCompany = sourceCompanyId === userCompanyId
  if (status === "APPROVED" && canDeliverFromWarehouse(userRole) && isSourceCompany && onDeliverFromWarehouse) {
    actions.push(
      <Button
        key="deliver"
        onClick={onDeliverFromWarehouse}
        disabled={isLoading}
        size="sm"
        variant="default"
      >
        <Package className="mr-2 h-4 w-4" />
        Entregar desde Bodega
      </Button>
    )
  }

  // IN_TRANSIT: Show receive at destination button ONLY if user is in DESTINATION company
  const isDestinationCompany = destinationCompanyId === userCompanyId
  if (status === "IN_TRANSIT" && canDeliverFromWarehouse(userRole) && isDestinationCompany && onReceiveAtDestination) {
    actions.push(
      <Button
        key="receive-destination"
        onClick={onReceiveAtDestination}
        disabled={isLoading}
        size="sm"
        variant="default"
      >
        <Package className="mr-2 h-4 w-4" />
        Recibir en Bodega Destino
      </Button>
    )
  }

  // READY_FOR_PICKUP: Show confirm receipt (technician confirms)
  const canConfirm = !receivedAt && status === "READY_FOR_PICKUP"
  if (canConfirm && canConfirmReceipt(userRole) && onConfirmReceipt) {
    actions.push(
      <Button
        key="confirm"
        onClick={onConfirmReceipt}
        disabled={isLoading}
        size="sm"
        variant="default"
      >
        <CheckCircle2 className="mr-2 h-4 w-4" />
        Confirmar Recepción
      </Button>
    )
  }

  // PENDING: Show cancel button
  if (status === "PENDING" && onCancel) {
    actions.push(
      <Button
        key="cancel"
        onClick={onCancel}
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Cancelar
      </Button>
    )
  }

  if (actions.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2">
      {actions}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { InventoryRequestStatusBadge } from "./inventory-request-status-badge"
import { InventoryRequestTimeline } from "./inventory-request-timeline"
import { InventoryRequestActions } from "./inventory-request-actions"
import { DeliverFromWarehouseDialog } from "./deliver-from-warehouse-dialog"
import { ReceiveAtDestinationDialog } from "./receive-at-destination-dialog"
import { ConfirmReceiptDialog } from "./confirm-receipt-dialog"
import { useInventoryRequestActions } from "@/hooks/use-inventory-request-actions"
import type { WorkOrderInventoryRequestWithRelations } from "@/types/inventory.types"
import type { SystemRoleKey } from "@/types/auth.types"

interface InventoryRequestDetailCardProps {
  request: WorkOrderInventoryRequestWithRelations
  userRole: SystemRoleKey
  userCompanyId: string
  onApprove?: () => void
  onReject?: () => void
  onCancel?: () => void
}

export function InventoryRequestDetailCard({
  request,
  userRole,
  userCompanyId,
  onApprove,
  onReject,
  onCancel
}: InventoryRequestDetailCardProps) {
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false)
  const [receiveDestinationDialogOpen, setReceiveDestinationDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const { deliverFromWarehouse, receiveAtDestination, confirmReceipt, isLoading } = useInventoryRequestActions({
    requestId: request.id,
    onSuccess: () => {
      setDeliverDialogOpen(false)
      setReceiveDestinationDialogOpen(false)
      setConfirmDialogOpen(false)
    }
  })

  const quantity = request.quantityApproved || request.quantityRequested

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Solicitud de Inventario</CardTitle>
              <CardDescription>ID: {request.id}</CardDescription>
            </div>
            <InventoryRequestStatusBadge status={request.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Repuesto</div>
              <div className="mt-1 font-medium">
                {request.inventoryItem?.code} - {request.inventoryItem?.name}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Cantidad</div>
              <div className="mt-1 font-medium">{quantity}</div>
            </div>
          </div>

          <Separator />

          <div>
            <div className="mb-4 text-sm font-medium">Trazabilidad</div>
            <InventoryRequestTimeline request={request} />
          </div>

          <Separator />

          <InventoryRequestActions
            status={request.status}
            userRole={userRole}
            userCompanyId={userCompanyId}
            sourceCompanyId={request.sourceCompanyId}
            destinationCompanyId={request.workOrder?.companyId}
            warehouseDeliveredAt={request.warehouseDeliveredAt}
            destinationWarehouseReceivedAt={request.destinationWarehouseReceivedAt}
            receivedAt={request.receivedAt}
            onDeliverFromWarehouse={() => setDeliverDialogOpen(true)}
            onReceiveAtDestination={() => setReceiveDestinationDialogOpen(true)}
            onConfirmReceipt={() => setConfirmDialogOpen(true)}
            onApprove={onApprove}
            onReject={onReject}
            onCancel={onCancel}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <DeliverFromWarehouseDialog
        open={deliverDialogOpen}
        onOpenChange={setDeliverDialogOpen}
        onSubmit={deliverFromWarehouse}
        itemName={request.inventoryItem?.name || ""}
        itemCode={request.inventoryItem?.code || ""}
        quantity={quantity}
        sourceLocationName={request.sourceLocation?.name}
        isLoading={isLoading}
      />

      <ReceiveAtDestinationDialog
        open={receiveDestinationDialogOpen}
        onOpenChange={setReceiveDestinationDialogOpen}
        onSubmit={receiveAtDestination}
        itemName={request.inventoryItem?.name || ""}
        itemCode={request.inventoryItem?.code || ""}
        quantity={quantity}
        isLoading={isLoading}
      />

      <ConfirmReceiptDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onSubmit={confirmReceipt}
        itemName={request.inventoryItem?.name || ""}
        itemCode={request.inventoryItem?.code || ""}
        quantity={quantity}
        warehouseDeliveredAt={request.warehouseDeliveredAt || undefined}
        isLoading={isLoading}
      />
    </>
  )
}

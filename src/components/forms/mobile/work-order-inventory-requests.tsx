"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Loader2, ChevronRight, CheckCircle2, PackageOpen, AlertCircle } from "lucide-react"
import { CreateInventoryRequestMobileDialog } from "./create-inventory-request-mobile-dialog"
import { ConfirmReceiptDialog } from "@/components/inventory/confirm-receipt-dialog"
import { REQUEST_STATUS_OPTIONS } from "@/schemas/inventory"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTableData } from "@/components/hooks/use-table-data"
import { useInventoryRequestActions } from "@/hooks/use-inventory-request-actions"
import type { PaginatedInventoryRequestsResponse, WorkOrderInventoryRequestWithRelations, InventoryRequestStatus, RequestUrgency } from "@/types/inventory.types"
import { cn } from "@/lib/utils"

interface InventoryRequest {
  id: string
  inventoryItem: {
    id: string
    code: string
    name: string
    unit: string
  }
  sourceCompany?: {
    id: string
    name: string
  } | null
  quantityRequested: number
  quantityApproved: number | null
  quantityDelivered: number
  status: InventoryRequestStatus
  urgency: RequestUrgency
  requestedAt: string
  warehouseDeliveredAt?: string | null
  receivedAt?: string | null
}

interface WorkOrderInventoryRequestsMobileProps {
  workOrderId: string
}

export function WorkOrderInventoryRequestsMobile({ workOrderId }: WorkOrderInventoryRequestsMobileProps) {
  const router = useRouter()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  // Use the table data hook for consistent data fetching
  const { data: requests, loading, refetch } = useTableData<InventoryRequest>({
    endpoint: `/api/admin/inventory/requests?workOrderId=${workOrderId}`,
    transform: (data: unknown) => {
      const response = data as PaginatedInventoryRequestsResponse
      return (response.items || [])
        .filter((req): req is WorkOrderInventoryRequestWithRelations & { inventoryItem: NonNullable<WorkOrderInventoryRequestWithRelations['inventoryItem']> } =>
          req.inventoryItem !== undefined
        )
        .map((req): InventoryRequest => ({
          id: req.id,
          inventoryItem: {
            id: req.inventoryItem.id,
            code: req.inventoryItem.code,
            name: req.inventoryItem.name,
            unit: req.inventoryItem.unit
          },
          sourceCompany: req.sourceCompany,
          quantityRequested: req.quantityRequested,
          quantityApproved: req.quantityApproved,
          quantityDelivered: req.quantityDelivered,
          status: req.status,
          urgency: req.urgency,
          requestedAt: req.requestedAt,
          warehouseDeliveredAt: req.warehouseDeliveredAt,
          receivedAt: req.receivedAt
        }))
    },
    dependencies: [workOrderId]
  })

  const { confirmReceipt, isLoading: actionLoading } = useInventoryRequestActions({
    requestId: selectedRequestId || '',
    onSuccess: () => {
      setShowConfirmDialog(false)
      setSelectedRequestId(null)
      refetch()
    }
  })

  const handleRequestCreated = () => {
    setShowCreateDialog(false)
    refetch()
    toast.success("Solicitud creada exitosamente")
  }

  const handleViewRequest = (requestId: string) => {
    router.push(`/admin/inventory/requests/${requestId}`)
  }

  const handleConfirmReceipt = (requestId: string) => {
    setSelectedRequestId(requestId)
    setShowConfirmDialog(true)
  }

  const canConfirmReceipt = (request: InventoryRequest): boolean => {
    // Can only confirm if not already received
    if (request.receivedAt) return false

    return (request.status === "DELIVERED" && !!request.warehouseDeliveredAt) || request.status === "IN_TRANSIT"
  }

  const selectedRequest = requests.find((r: InventoryRequest) => r.id === selectedRequestId)

  const getStatusBadge = (status: string) => {
    const statusOption = REQUEST_STATUS_OPTIONS.find((opt: { value: string; label: string; color: string }) => opt.value === status)
    return (
      <Badge className={`${statusOption?.color || "bg-gray-500"} text-xs`}>
        {statusOption?.label || status}
      </Badge>
    )
  }


  const pendingConfirmationCount = requests.filter((r: InventoryRequest) => canConfirmReceipt(r)).length

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageOpen className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Repuestos</CardTitle>
              {pendingConfirmationCount > 0 && (
                <Badge variant="default" className="ml-1 h-5 px-1.5 text-xs">
                  {pendingConfirmationCount}
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreateDialog(true)}
              className="h-9 shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Solicitar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Cargando repuestos...</p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="bg-muted/30 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Sin solicitudes</p>
              <p className="text-xs text-muted-foreground">
                Solicita repuestos necesarios para realizar el trabajo
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCreateDialog(true)}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Solicitar Repuesto
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request: InventoryRequest) => {
                const needsConfirmation = canConfirmReceipt(request)
                const isUrgent = request.urgency === 'CRITICAL'

                return (
                  <div
                    key={request.id}
                    className={cn(
                      "rounded-lg border-2 transition-all overflow-hidden",
                      needsConfirmation && "border-primary/30 bg-primary/5",
                      !needsConfirmation && "border-border hover:border-border/80"
                    )}
                  >
                    <div
                      className="cursor-pointer active:bg-accent/50 transition-colors p-4"
                      onClick={() => handleViewRequest(request.id)}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "rounded-full p-2 flex-shrink-0",
                            needsConfirmation ? "bg-primary/10" : "bg-muted"
                          )}>
                            <Package className={cn(
                              "h-5 w-5",
                              needsConfirmation ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate leading-tight mb-1">
                              {request.inventoryItem.name}
                            </p>
                            <p className="text-xs text-muted-foreground font-mono">
                              {request.inventoryItem.code}
                            </p>
                            {request.sourceCompany && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                                📍 {request.sourceCompany.name}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>

                      <div className="flex items-center justify-between gap-3 pt-3 border-t">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {getStatusBadge(request.status)}
                          {isUrgent && (
                            <Badge variant="destructive" className="text-xs gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Urgente
                            </Badge>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-base">
                            {request.quantityRequested} <span className="text-xs font-normal text-muted-foreground">{request.inventoryItem.unit}</span>
                          </div>
                          {request.quantityApproved && (
                            <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                              ✓ Aprobado: {request.quantityApproved}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {needsConfirmation && (
                      <div className="px-4 pb-4">
                        <Button
                          size="lg"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleConfirmReceipt(request.id)
                          }}
                          className="w-full h-12 font-semibold shadow-md hover:shadow-lg transition-all"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                          )}
                          Confirmar Recepción
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateInventoryRequestMobileDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        workOrderId={workOrderId}
        onSuccess={handleRequestCreated}
      />

      {selectedRequest && (
        <ConfirmReceiptDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          onSubmit={confirmReceipt}
          itemName={selectedRequest.inventoryItem.name}
          itemCode={selectedRequest.inventoryItem.code}
          quantity={selectedRequest.quantityApproved || selectedRequest.quantityRequested}
          warehouseDeliveredAt={selectedRequest.warehouseDeliveredAt || undefined}
          isLoading={actionLoading}
        />
      )}
    </>
  )
}

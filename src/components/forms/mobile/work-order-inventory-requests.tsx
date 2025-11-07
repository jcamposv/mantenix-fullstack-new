"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Loader2, ChevronRight } from "lucide-react"
import { CreateInventoryRequestMobileDialog } from "./create-inventory-request-mobile-dialog"
import { REQUEST_STATUS_OPTIONS, REQUEST_URGENCY_OPTIONS } from "@/schemas/inventory"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useTableData } from "@/components/hooks/use-table-data"
import type { PaginatedInventoryRequestsResponse, WorkOrderInventoryRequestWithRelations } from "@/types/inventory.types"

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
  status: "PENDING" | "APPROVED" | "REJECTED" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED"
  urgency: "LOW" | "NORMAL" | "HIGH" | "CRITICAL"
  requestedAt: string
}

interface WorkOrderInventoryRequestsMobileProps {
  workOrderId: string
}

export function WorkOrderInventoryRequestsMobile({ workOrderId }: WorkOrderInventoryRequestsMobileProps) {
  const router = useRouter()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Use the table data hook for consistent data fetching
  const { data: requests, loading, refetch } = useTableData<InventoryRequest>({
    endpoint: `/api/admin/inventory/requests?workOrderId=${workOrderId}`,
    transform: (data: unknown) => {
      const response = data as PaginatedInventoryRequestsResponse
      return (response.requests || [])
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
          requestedAt: req.requestedAt
        }))
    },
    dependencies: [workOrderId]
  })

  const handleRequestCreated = () => {
    setShowCreateDialog(false)
    refetch()
    toast.success("Solicitud creada exitosamente")
  }

  const handleViewRequest = (requestId: string) => {
    router.push(`/admin/inventory/requests/${requestId}`)
  }

  const getStatusBadge = (status: string) => {
    const statusOption = REQUEST_STATUS_OPTIONS.find(opt => opt.value === status)
    return (
      <Badge className={`${statusOption?.color || "bg-gray-500"} text-xs`}>
        {statusOption?.label || status}
      </Badge>
    )
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyOption = REQUEST_URGENCY_OPTIONS.find(opt => opt.value === urgency)
    return (
      <Badge variant="outline" className={`${urgencyOption?.color || "text-gray-500"} text-xs`}>
        {urgencyOption?.label || urgency}
      </Badge>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">Repuestos Solicitados</CardTitle>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Solicitar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-6">
              <Package className="mx-auto h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No hay solicitudes</p>
              <p className="text-xs text-muted-foreground mt-1">
                Solicita repuestos necesarios para este trabajo
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-3 border rounded-lg active:bg-accent/50 transition-colors"
                  onClick={() => handleViewRequest(request.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <Package className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{request.inventoryItem.name}</p>
                        <p className="text-xs text-muted-foreground">{request.inventoryItem.code}</p>
                        {request.sourceCompany && (
                          <p className="text-xs text-blue-600 mt-0.5">
                            {request.sourceCompany.name}
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2">
                    <div className="flex flex-wrap items-center gap-1">
                      {getStatusBadge(request.status)}
                      {getUrgencyBadge(request.urgency)}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-sm">
                        {request.quantityRequested} {request.inventoryItem.unit}
                      </div>
                      {request.quantityApproved && (
                        <div className="text-xs text-green-600">
                          ✓ {request.quantityApproved}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
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
    </>
  )
}

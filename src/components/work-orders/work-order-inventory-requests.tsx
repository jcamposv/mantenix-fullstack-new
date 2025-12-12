"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Loader2 } from "lucide-react"
import { CreateInventoryRequestDialog } from "@/components/inventory/create-inventory-request-dialog"
import { REQUEST_STATUS_OPTIONS, REQUEST_URGENCY_OPTIONS } from "@/schemas/inventory"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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
  requester: {
    id: string
    name: string
  }
}

interface WorkOrderInventoryRequestsProps {
  workOrderId: string
}

export function WorkOrderInventoryRequests({ workOrderId }: WorkOrderInventoryRequestsProps) {
  const router = useRouter()
  const [requests, setRequests] = useState<InventoryRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/inventory/requests?workOrderId=${workOrderId}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error("Error fetching inventory requests:", error)
      toast.error(error instanceof Error ? error.message : "Error al cargar solicitudes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workOrderId])

  const handleRequestCreated = () => {
    setShowCreateDialog(false)
    fetchRequests()
    toast.success("Solicitud de inventario creada exitosamente")
  }

  const handleViewRequest = (requestId: string) => {
    router.push(`/admin/inventory/requests/${requestId}`)
  }

  const getStatusBadge = (status: string) => {
    const statusOption = REQUEST_STATUS_OPTIONS.find(opt => opt.value === status)
    return (
      <Badge className={statusOption?.color || "bg-gray-500"}>
        {statusOption?.label || status}
      </Badge>
    )
  }

  const getUrgencyBadge = (urgency: string) => {
    const urgencyOption = REQUEST_URGENCY_OPTIONS.find(opt => opt.value === urgency)
    return (
      <Badge variant="outline" className={urgencyOption?.color || "text-gray-500"}>
        {urgencyOption?.label || urgency}
      </Badge>
    )
  }

  return (
    <>
      <Card className="shadow-none">
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Solicitudes de Inventario</CardTitle>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Solicitud
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">No hay solicitudes de inventario</p>
              <p className="text-xs text-muted-foreground mt-1">
                Crea una solicitud para requerir repuestos o materiales
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleViewRequest(request.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium truncate">{request.inventoryItem.name}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        <div>Código: {request.inventoryItem.code}</div>
                        {request.sourceCompany && (
                          <div className="text-blue-600 mt-1">
                            Empresa: {request.sourceCompany.name}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(request.status)}
                        {getUrgencyBadge(request.urgency)}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-semibold text-sm">
                        {request.quantityRequested} {request.inventoryItem.unit}
                      </div>
                      {request.quantityApproved && (
                        <div className="text-xs text-green-600 mt-1">
                          Aprobado: {request.quantityApproved}
                        </div>
                      )}
                      {request.quantityDelivered > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          Entregado: {request.quantityDelivered}
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

      <CreateInventoryRequestDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        workOrderId={workOrderId}
        onSuccess={handleRequestCreated}
      />
    </>
  )
}

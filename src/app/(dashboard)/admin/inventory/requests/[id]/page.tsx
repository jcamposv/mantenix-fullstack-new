"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Calendar, Loader2, ArrowRight, Warehouse, Building2, Truck } from "lucide-react"
import { toast } from "sonner"
import { REQUEST_URGENCY_OPTIONS, type ApproveRequestFormData, type RejectRequestFormData } from "@/schemas/inventory"
import { ApproveRequestDialog } from "@/components/inventory/approve-request-dialog"
import { RejectRequestDialog } from "@/components/inventory/reject-request-dialog"
import { InventoryRequestStatusBadge } from "@/components/inventory/inventory-request-status-badge"
import { InventoryRequestTimeline } from "@/components/inventory/inventory-request-timeline"
import { InventoryRequestActions } from "@/components/inventory/inventory-request-actions"
import { DeliverFromWarehouseDialog } from "@/components/inventory/deliver-from-warehouse-dialog"
import { ReceiveAtDestinationDialog } from "@/components/inventory/receive-at-destination-dialog"
import { ConfirmReceiptDialog } from "@/components/inventory/confirm-receipt-dialog"
import { useInventoryRequestActions } from "@/hooks/use-inventory-request-actions"
import type { WorkOrderInventoryRequestWithRelations } from "@/types/inventory.types"
import { Badge } from "@/components/ui/badge"
import type { SystemRoleKey } from "@/types/auth.types"

export default function InventoryRequestDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { data: session } = useSession()
  const id = params.id as string

  const [request, setRequest] = useState<(WorkOrderInventoryRequestWithRelations & {
    sourceLocationName?: string
    destinationLocationName?: string
    destinationLocationId?: string
    destinationLocationType?: 'WAREHOUSE' | 'VEHICLE' | 'SITE'
  }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [approveDialogOpen, setApproveDialogOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false)
  const [receiveDestinationDialogOpen, setReceiveDestinationDialogOpen] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { deliverFromWarehouse, receiveAtDestination, confirmReceipt, isLoading: actionLoading } = useInventoryRequestActions({
    requestId: id,
    onSuccess: () => {
      setDeliverDialogOpen(false)
      setReceiveDestinationDialogOpen(false)
      setConfirmDialogOpen(false)
      fetchRequestData()
    }
  })

  useEffect(() => {
    fetchRequestData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const fetchRequestData = async () => {
    try {
      const response = await fetch(`/api/admin/inventory/requests/${id}`)
      if (!response.ok) throw new Error('Error al cargar la solicitud')
      const data = await response.json()
      setRequest(data)
    } catch (error) {
      console.error('Error fetching request:', error)
      toast.error('Error al cargar la solicitud')
      router.push('/admin/inventory/requests')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (data: ApproveRequestFormData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/admin/inventory/requests/${id}/approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al aprobar la solicitud')
      }

      toast.success('Solicitud aprobada exitosamente')
      setApproveDialogOpen(false)
      fetchRequestData()
    } catch (error) {
      console.error('Error approving request:', error)
      toast.error(error instanceof Error ? error.message : 'Error al aprobar la solicitud')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async (data: RejectRequestFormData) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/admin/inventory/requests/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al rechazar la solicitud')
      }

      toast.success('Solicitud rechazada')
      setRejectDialogOpen(false)
      fetchRequestData()
    } catch (error) {
      console.error('Error rejecting request:', error)
      toast.error(error instanceof Error ? error.message : 'Error al rechazar la solicitud')
    } finally {
      setIsSubmitting(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!request) return null

  const urgencyOption = REQUEST_URGENCY_OPTIONS.find(opt => opt.value === request.urgency)
  const quantity = request.quantityApproved || request.quantityRequested

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">Solicitud de Inventario</h2>
                <InventoryRequestStatusBadge status={request.status} />
                <Badge variant="outline" className={urgencyOption?.color}>{urgencyOption?.label}</Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                OT-{request.workOrder?.number} - {request.workOrder?.title}
              </p>
            </div>
          </div>

          {/* Actions */}
          {session?.user && (session.user as unknown as { role?: SystemRoleKey; companyId?: string }).role && (session.user as unknown as { companyId?: string }).companyId && (
            <InventoryRequestActions
              status={request.status}
              userRole={(session.user as unknown as { role: SystemRoleKey }).role}
              userCompanyId={(session.user as unknown as { companyId: string }).companyId}
              sourceCompanyId={request.sourceCompanyId}
              destinationCompanyId={request.workOrder?.companyId}
              warehouseDeliveredAt={request.warehouseDeliveredAt}
              destinationWarehouseReceivedAt={request.destinationWarehouseReceivedAt}
              receivedAt={request.receivedAt}
              onDeliverFromWarehouse={() => setDeliverDialogOpen(true)}
              onReceiveAtDestination={() => setReceiveDestinationDialogOpen(true)}
              onConfirmReceipt={() => setConfirmDialogOpen(true)}
              onApprove={() => setApproveDialogOpen(true)}
              onReject={() => setRejectDialogOpen(true)}
              isLoading={isSubmitting || actionLoading}
            />
          )}
        </div>

        {/* Timeline Horizontal */}
        <InventoryRequestTimeline request={request} horizontal />
      </div>

      {/* Transfer Route */}
      {(request.sourceLocationName || request.destinationLocationName) && (
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg mb-0">Ruta de Transferencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-4">
              {/* Source */}
              <div className="flex-1">
                {request.sourceLocationName ? (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                    {request.sourceLocationType === 'WAREHOUSE' && <Warehouse className="h-5 w-5 text-blue-600 mt-0.5" />}
                    {request.sourceLocationType === 'SITE' && <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />}
                    {request.sourceLocationType === 'VEHICLE' && <Truck className="h-5 w-5 text-blue-600 mt-0.5" />}
                    <div className="flex-1">
                      <div className="text-xs font-medium text-blue-600 uppercase">Origen</div>
                      <div className="font-semibold text-blue-900 mt-1">{request.sourceLocationName}</div>
                      <div className="text-xs text-blue-700 mt-0.5">
                        {request.sourceLocationType === 'WAREHOUSE' && 'Bodega'}
                        {request.sourceLocationType === 'SITE' && 'Sede'}
                        {request.sourceLocationType === 'VEHICLE' && 'Vehículo'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xs font-medium text-gray-600 uppercase">Origen</div>
                    <div className="text-sm text-gray-700 mt-1">Por determinar</div>
                  </div>
                )}
              </div>

              {/* Arrow */}
              <ArrowRight className="h-6 w-6 text-gray-400 flex-shrink-0" />

              {/* Destination */}
              <div className="flex-1">
                {request.destinationLocationName ? (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                    {request.destinationLocationType === 'WAREHOUSE' && <Warehouse className="h-5 w-5 text-green-600 mt-0.5" />}
                    {request.destinationLocationType === 'SITE' && <Building2 className="h-5 w-5 text-green-600 mt-0.5" />}
                    {request.destinationLocationType === 'VEHICLE' && <Truck className="h-5 w-5 text-green-600 mt-0.5" />}
                    <div className="flex-1">
                      <div className="text-xs font-medium text-green-600 uppercase">Destino</div>
                      <div className="font-semibold text-green-900 mt-1">{request.destinationLocationName}</div>
                      <div className="text-xs text-green-700 mt-0.5">
                        {request.destinationLocationType === 'WAREHOUSE' && 'Bodega'}
                        {request.destinationLocationType === 'SITE' && 'Sede'}
                        {request.destinationLocationType === 'VEHICLE' && 'Vehículo'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-xs font-medium text-gray-600 uppercase">Destino</div>
                    <div className="text-sm text-gray-700 mt-1">Por determinar</div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Item Info */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Ítem Solicitado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Nombre</div>
              <div className="mt-1 font-medium">{request.inventoryItem?.name}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Código</div>
              <div className="mt-1">{request.inventoryItem?.code}</div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Solicitado</div>
                <div className="mt-1 text-lg font-semibold">
                  {request.quantityRequested} {request.inventoryItem?.unit}
                </div>
              </div>
              {request.quantityApproved && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Aprobado</div>
                  <div className="mt-1 text-lg font-semibold text-green-600">
                    {request.quantityApproved} {request.inventoryItem?.unit}
                  </div>
                </div>
              )}
              {request.quantityDelivered > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Entregado</div>
                  <div className="mt-1 text-lg font-semibold text-blue-600">
                    {request.quantityDelivered} {request.inventoryItem?.unit}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Info */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Información de la Solicitud</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Solicitante</div>
              <div className="mt-1 flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{request.requester?.name}</span>
              </div>
              <div className="text-sm text-muted-foreground">{request.requester?.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Fecha de Solicitud</div>
              <div className="mt-1 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(request.requestedAt).toLocaleString('es-ES')}</span>
              </div>
            </div>
            {request.reviewer && (
              <>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Revisado por</div>
                  <div className="mt-1">{request.reviewer.name}</div>
                </div>
                {request.reviewedAt && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Fecha de Revisión</div>
                    <div className="mt-1">{new Date(request.reviewedAt).toLocaleString('es-ES')}</div>
                  </div>
                )}
              </>
            )}
            {request.notes && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Notas</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">{request.notes}</div>
              </div>
            )}
            {request.reviewNotes && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Notas de Revisión</div>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm">{request.reviewNotes}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Dialogs */}
      <ApproveRequestDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        onSubmit={handleApprove}
        defaultQuantity={request.quantityRequested}
        sourceLocationName={request.sourceLocation?.name}
        sourceLocationType={request.sourceLocationType || undefined}
        isLoading={isSubmitting}
      />

      <RejectRequestDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        onSubmit={handleReject}
        isLoading={isSubmitting}
      />

      <DeliverFromWarehouseDialog
        open={deliverDialogOpen}
        onOpenChange={setDeliverDialogOpen}
        onSubmit={deliverFromWarehouse}
        itemName={request.inventoryItem?.name || ""}
        itemCode={request.inventoryItem?.code || ""}
        quantity={quantity}
        sourceLocationName={request.sourceLocation?.name}
        isLoading={actionLoading}
      />

      <ReceiveAtDestinationDialog
        open={receiveDestinationDialogOpen}
        onOpenChange={setReceiveDestinationDialogOpen}
        onSubmit={receiveAtDestination}
        itemName={request.inventoryItem?.name || ""}
        itemCode={request.inventoryItem?.code || ""}
        quantity={quantity}
        isLoading={actionLoading}
      />

      <ConfirmReceiptDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onSubmit={confirmReceipt}
        itemName={request.inventoryItem?.name || ""}
        itemCode={request.inventoryItem?.code || ""}
        quantity={quantity}
        warehouseDeliveredAt={request.warehouseDeliveredAt || undefined}
        isLoading={actionLoading}
      />
    </div>
  )
}

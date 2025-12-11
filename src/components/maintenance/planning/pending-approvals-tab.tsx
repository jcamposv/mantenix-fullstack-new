/**
 * Pending Approvals Tab Component
 *
 * Displays work orders pending approval with approval actions.
 * Part of WORKFLOW_GAPS feature.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Type-safe
 * - Under 200 lines
 */

'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Clock, DollarSign } from 'lucide-react'
import { ApprovalDialog } from './approval-dialog'
import { WorkOrderStatusBadge } from '@/components/work-orders/work-order-status-badge'
import { WorkOrderPriorityBadge } from '@/components/work-orders/work-order-priority-badge'
import type { WorkOrderWithRelations } from '@/types/work-order.types'

type PendingApproval = WorkOrderWithRelations

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function PendingApprovalsTab() {
  const [selectedApproval, setSelectedApproval] = useState<{
    workOrderId: string
    approvalId: string
  } | null>(null)
  const [action, setAction] = useState<'approve' | 'reject' | null>(null)

  const { data, isLoading, error, mutate } = useSWR<{
    workOrders: PendingApproval[]
    total: number
  }>('/api/work-orders/pending-approval', fetcher, {
    refreshInterval: 30000, // Refresh every 30s
  })

  const handleApprove = (workOrderId: string, approvalId: string) => {
    setSelectedApproval({ workOrderId, approvalId })
    setAction('approve')
  }

  const handleReject = (workOrderId: string, approvalId: string) => {
    setSelectedApproval({ workOrderId, approvalId })
    setAction('reject')
  }

  const handleDialogClose = () => {
    setSelectedApproval(null)
    setAction(null)
    mutate() // Refresh data
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="shadow-none border-destructive">
        <CardContent className="py-12 text-center">
          <XCircle className="h-12 w-12 mx-auto mb-3 text-destructive opacity-50" />
          <p className="text-sm font-medium text-destructive">
            Error al cargar aprobaciones pendientes
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {error.message || 'Intente recargar la página'}
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.workOrders || data.workOrders.length === 0) {
    return (
      <Card className="shadow-none border-dashed">
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm font-medium text-muted-foreground">
            No hay órdenes pendientes de aprobación
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {data.workOrders.map((wo) => {
          const pendingApproval = wo.approvals?.find((a) => a.status === 'PENDING')

          return (
            <Card key={wo.id} className="shadow-none">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{wo.number}</CardTitle>
                    <p className="text-sm text-muted-foreground">{wo.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <WorkOrderStatusBadge status={wo.status} />
                    <WorkOrderPriorityBadge priority={wo.priority} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cost and Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Costo Estimado</p>
                    <div className="flex items-center gap-2 mt-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {wo.estimatedCost?.toLocaleString('es-CR', {
                          style: 'currency',
                          currency: 'CRC',
                          minimumFractionDigits: 0,
                        }) || '₡0'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Creado por</p>
                    <p className="font-medium mt-1">{wo.creator?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nivel Requerido</p>
                    <Badge variant="outline" className="mt-1">
                      Nivel {pendingApproval?.level || 1}
                    </Badge>
                  </div>
                </div>

                {/* Approval Actions */}
                {pendingApproval && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleApprove(wo.id, pendingApproval.id)}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(wo.id, pendingApproval.id)}
                      className="gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/work-orders/${wo.id}`, '_blank')}
                    >
                      Ver Detalle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Approval Dialog */}
      {selectedApproval && action && (
        <ApprovalDialog
          open={true}
          onClose={handleDialogClose}
          approvalId={selectedApproval.approvalId}
          action={action}
        />
      )}
    </>
  )
}

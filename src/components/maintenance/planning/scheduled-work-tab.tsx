/**
 * Scheduled Work Tab Component
 *
 * Displays approved and scheduled work orders.
 * Part of WORKFLOW_GAPS feature.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - SWR for data fetching
 * - Type-safe
 * - Under 200 lines
 */

'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { WorkOrderStatusBadge } from '@/components/work-orders/work-order-status-badge'
import { WorkOrderPriorityBadge } from '@/components/work-orders/work-order-priority-badge'
import type { WorkOrderWithRelations } from '@/types/work-order.types'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ScheduledWorkTab() {
  const { data, isLoading, error } = useSWR<{
    workOrders: WorkOrderWithRelations[]
    total: number
  }>('/api/work-orders?status=ASSIGNED&hasScheduledDate=true&limit=50', fetcher, {
    refreshInterval: 60000, // Refresh every 60s
  })

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
            Error al cargar trabajo programado
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
          <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-sm font-medium text-muted-foreground">
            No hay trabajo programado
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group by date
  const groupedByDate = data.workOrders.reduce((acc, wo) => {
    if (!wo.scheduledDate) return acc

    const date = new Date(wo.scheduledDate).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(wo)
    return acc
  }, {} as Record<string, WorkOrderWithRelations[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedByDate).map(([date, workOrders]) => (
        <div key={date} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {date}
          </h3>

          <div className="space-y-3">
            {workOrders.map((wo) => (
              <Card key={wo.id} className="shadow-none">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{wo.number}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{wo.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <WorkOrderStatusBadge status={wo.status} />
                      <WorkOrderPriorityBadge priority={wo.priority} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Asignado a</p>
                      <p className="font-medium mt-1">
                        {wo.assignments?.map((a) => a.user.name).join(', ') || 'Sin asignar'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Activo/Sede</p>
                      <p className="font-medium mt-1">
                        {wo.asset?.name || wo.site?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duración Est.</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">
                          {wo.estimatedDuration
                            ? `${Math.floor(wo.estimatedDuration / 60)}h ${wo.estimatedDuration % 60}m`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {wo.approvals && wo.approvals.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-muted-foreground">
                          Aprobada por {wo.approvals.filter((a) => a.status === 'APPROVED').length}{' '}
                          nivel(es)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(`/work-orders/${wo.id}`, '_blank')}
                    >
                      Ver Detalle
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

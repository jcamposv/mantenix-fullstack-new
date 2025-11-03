"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WorkOrderStatusBadge } from "@/components/work-orders/work-order-status-badge"
import { WorkOrderPriorityBadge } from "@/components/work-orders/work-order-priority-badge"
import { Calendar, Clock, MapPin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { cn } from "@/lib/utils"
import type { WorkOrderPriority } from "@/types/work-order.types"

interface UpcomingWorkOrder {
  id: string
  number: string
  title: string
  scheduledDate: Date
  priority: WorkOrderPriority
  status: string
  site?: {
    name: string
  }
  _count?: {
    assignments: number
  }
}

interface UpcomingWorkOrdersProps {
  workOrders: UpcomingWorkOrder[]
  loading?: boolean
}

export function UpcomingWorkOrders({ workOrders, loading = false }: UpcomingWorkOrdersProps) {
  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Próximas Órdenes Programadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-3">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate days remaining
  const getDaysRemaining = (scheduledDate: Date) => {
    const today = new Date()
    const scheduled = new Date(scheduledDate)
    const diffTime = scheduled.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return "border-l-red-500"
    if (daysRemaining === 0) return "border-l-orange-500"
    if (daysRemaining <= 2) return "border-l-yellow-500"
    return "border-l-blue-500"
  }

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximas Órdenes Programadas
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Órdenes con fecha programada
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workOrders.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No hay órdenes programadas próximamente
              </p>
            </div>
          ) : (
            workOrders.map((workOrder) => {
              const daysRemaining = getDaysRemaining(workOrder.scheduledDate)
              const urgencyColor = getUrgencyColor(daysRemaining)

              return (
                <Link
                  key={workOrder.id}
                  href={`/work-orders/${workOrder.id}`}
                  className="block"
                >
                  <div
                    className={cn(
                      "border-l-4 rounded-lg p-3 hover:bg-accent transition-colors",
                      urgencyColor
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {workOrder.number}
                          </Badge>
                          <WorkOrderPriorityBadge priority={workOrder.priority} />
                        </div>
                        <p className="font-medium text-sm truncate">
                          {workOrder.title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      {workOrder.site && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-[120px]">
                            {workOrder.site.name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span
                          className={cn(
                            "font-medium",
                            daysRemaining < 0
                              ? "text-red-600"
                              : daysRemaining === 0
                              ? "text-orange-600"
                              : daysRemaining <= 2
                              ? "text-yellow-600"
                              : "text-blue-600"
                          )}
                        >
                          {daysRemaining < 0
                            ? `${Math.abs(daysRemaining)}d vencido`
                            : daysRemaining === 0
                            ? "Hoy"
                            : daysRemaining === 1
                            ? "Mañana"
                            : `En ${daysRemaining}d`}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}

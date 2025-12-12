import * as React from "react"
import { CheckCircle2, Clock, Package, Truck, XCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkOrderInventoryRequestWithRelations } from "@/types/inventory.types"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface InventoryRequestTimelineProps {
  request: WorkOrderInventoryRequestWithRelations
  className?: string
  horizontal?: boolean
}

interface TimelineEvent {
  label: string
  date?: string
  user?: string
  icon: React.ReactNode
  completed: boolean
  notes?: string
}

export function InventoryRequestTimeline({
  request,
  className,
  horizontal = false
}: InventoryRequestTimelineProps) {
  const events: TimelineEvent[] = [
    {
      label: "Solicitud Creada",
      date: request.requestedAt,
      user: request.requester?.name,
      icon: <Clock className="h-5 w-5" />,
      completed: true,
      notes: request.notes || undefined
    },
    {
      label: request.status === "REJECTED" ? "Rechazado" : "Aprobado",
      date: request.reviewedAt || undefined,
      user: request.reviewer?.name,
      icon: request.status === "REJECTED" ?
        <XCircle className="h-5 w-5" /> :
        <CheckCircle2 className="h-5 w-5" />,
      completed: !!request.reviewedAt,
      notes: request.reviewNotes || undefined
    }
  ]

  // Solo agregar eventos de entrega si no está rechazado
  if (request.status !== "REJECTED") {
    // Determinar si es transferencia inter-empresa (origen y destino son empresas diferentes)
    const isInterCompanyTransfer = !!request.sourceCompanyId &&
      !!request.workOrder?.companyId &&
      request.sourceCompanyId !== request.workOrder.companyId

    events.push({
      label: "Entregado desde Bodega",
      date: request.warehouseDeliveredAt || undefined,
      user: request.warehouseDeliverer?.name,
      icon: <Package className="h-5 w-5" />,
      completed: !!request.warehouseDeliveredAt
    })

    if (isInterCompanyTransfer) {
      // Flujo INTER-empresa
      events.push({
        label: "En Tránsito",
        icon: <Truck className="h-5 w-5" />,
        completed: ["IN_TRANSIT", "RECEIVED_AT_DESTINATION", "READY_FOR_PICKUP", "DELIVERED"].includes(request.status),
        date: request.warehouseDeliveredAt || undefined,
        user: request.warehouseDeliverer?.name
      })

      events.push({
        label: "Recibido en Bodega Destino",
        date: request.destinationWarehouseReceivedAt || undefined,
        user: request.destinationWarehouseReceiver?.name,
        icon: <Package className="h-5 w-5" />,
        completed: !!request.destinationWarehouseReceivedAt
      })
    }

    events.push({
      label: "Listo para Entrega",
      date: request.warehouseDeliveredAt || request.destinationWarehouseReceivedAt || undefined,
      icon: <CheckCircle2 className="h-5 w-5" />,
      completed: ["READY_FOR_PICKUP", "DELIVERED"].includes(request.status)
    })

    events.push({
      label: "Confirmado por Técnico",
      date: request.receivedAt || undefined,
      user: request.receiver?.name,
      icon: <CheckCircle2 className="h-5 w-5" />,
      completed: !!request.receivedAt
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short'
    })
  }

  if (horizontal) {
    return (
      <TooltipProvider>
        <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="mb-0">Tracking de la Solicitud</CardTitle>
        </CardHeader>
          <CardContent>
            {/* Desktop: Horizontal */}
            <div className="hidden md:block">
              <div className="flex items-center w-full">
                {events.map((event, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "flex h-10 w-10 lg:h-12 lg:w-12 items-center justify-center rounded-full border-2 flex-shrink-0 cursor-help transition-transform hover:scale-105",
                              event.completed
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted bg-background text-muted-foreground"
                            )}
                          >
                            <div className="scale-75 lg:scale-100">
                              {event.icon}
                            </div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <div className="space-y-2">
                            <p className="font-semibold">{event.label}</p>
                            {event.date && (
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                            )}
                            {event.user && (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-3 w-3" />
                                <span>{event.user}</span>
                              </div>
                            )}
                            {event.notes && (
                              <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                                {event.notes}
                              </p>
                            )}
                            {!event.completed && (
                              <p className="text-xs text-muted-foreground italic">
                                Pendiente
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>

                      <div className="flex flex-col items-center gap-0.5 min-h-[36px] w-full px-1">
                        <span className={cn(
                          "text-[10px] lg:text-xs font-medium text-center leading-tight",
                          event.completed ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {event.label}
                        </span>
                        {event.date && (
                          <span className="text-[9px] lg:text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(event.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>

                    {index < events.length - 1 && (
                      <div
                        className={cn(
                          "h-0.5 flex-shrink-0 mx-2 lg:mx-4",
                          event.completed ? "bg-primary" : "bg-muted"
                        )}
                        style={{ width: '40px' }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Mobile: Vertical */}
            <div className="md:hidden py-4">
              {events.map((event, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full border-2 flex-shrink-0 cursor-help",
                            event.completed
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted bg-background text-muted-foreground"
                          )}
                        >
                          {event.icon}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-xs">
                        <div className="space-y-2">
                          <p className="font-semibold">{event.label}</p>
                          {event.date && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(event.date)}</span>
                            </div>
                          )}
                          {event.user && (
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3 w-3" />
                              <span>{event.user}</span>
                            </div>
                          )}
                          {event.notes && (
                            <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                              {event.notes}
                            </p>
                          )}
                          {!event.completed && (
                            <p className="text-xs text-muted-foreground italic">
                              Pendiente
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>

                    {index < events.length - 1 && (
                      <div
                        className={cn(
                          "w-0.5 flex-1 my-2",
                          event.completed ? "bg-primary" : "bg-muted"
                        )}
                        style={{ minHeight: "20px" }}
                      />
                    )}
                  </div>

                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-sm font-medium",
                        event.completed ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {event.label}
                      </span>
                    </div>

                    {event.date && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(event.date).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}

                    {event.user && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <User className="h-3 w-3" />
                        {event.user}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TooltipProvider>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {events.map((event, index) => (
        <div key={index} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border-2 flex-shrink-0",
                event.completed
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted bg-background text-muted-foreground"
              )}
            >
              {event.icon}
            </div>
            {index < events.length - 1 && (
              <div
                className={cn(
                  "w-0.5 flex-1 my-2",
                  event.completed ? "bg-primary" : "bg-muted"
                )}
                style={{ minHeight: "24px" }}
              />
            )}
          </div>

          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-medium",
                event.completed ? "text-foreground" : "text-muted-foreground"
              )}>
                {event.label}
              </span>
            </div>

            {event.date && (
              <div className="text-sm text-muted-foreground mt-1">
                {formatDate(event.date)}
              </div>
            )}

            {event.user && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <User className="h-3 w-3" />
                {event.user}
              </div>
            )}

            {event.notes && (
              <div className="text-sm text-muted-foreground mt-2 p-2 bg-muted/50 rounded">
                {event.notes}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AssetStatusBadge, getAssetStatusIcon } from "./asset-status-badge"
import { Loader2, Clock, User, FileText, Link as LinkIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useAssetStatusHistory } from "@/hooks/useAssetStatusHistory"

interface AssetStatusHistoryProps {
  assetId: string
  className?: string
}

export function AssetStatusHistory({ assetId, className }: AssetStatusHistoryProps) {
  // Use SWR hook for status history
  const { history, total, loading } = useAssetStatusHistory(assetId, {
    limit: 50
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculateDuration = (startedAt: string, endedAt: string | null) => {
    const start = new Date(startedAt)
    const end = endedAt ? new Date(endedAt) : new Date()
    const diffMs = end.getTime() - start.getTime()

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Historial de Estados</CardTitle>
          <CardDescription>Cargando historial...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Historial de Estados</CardTitle>
          <CardDescription>No hay cambios de estado registrados</CardDescription>
        </CardHeader>
        <CardContent className="py-8 text-center text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No se han registrado cambios de estado para este activo</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Historial de Estados</CardTitle>
        <CardDescription>
          {total} {total === 1 ? 'cambio registrado' : 'cambios registrados'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {history.map((record, index) => {
              const StatusIcon = getAssetStatusIcon(record.status)
              const isActive = !record.endedAt

              return (
                <div key={record.id} className="relative">
                  {/* Timeline line */}
                  {index < history.length - 1 && (
                    <div className="absolute left-[15px] top-[40px] bottom-[-16px] w-0.5 bg-border" />
                  )}

                  {/* Status change card */}
                  <div className={cn(
                    "relative pl-10 pb-4",
                    isActive && "border-l-2 border-primary pl-[38px] ml-[-2px]"
                  )}>
                    {/* Icon */}
                    <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-card">
                      {StatusIcon && <StatusIcon className="h-4 w-4" />}
                    </div>

                    <div className="space-y-2">
                      {/* Status and date */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AssetStatusBadge status={record.status} showIcon={false} />
                          {isActive && (
                            <Badge variant="outline" className="text-xs">
                              Actual
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(record.startedAt)}
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="text-sm text-muted-foreground">
                        Duración: {calculateDuration(record.startedAt, record.endedAt)}
                        {isActive && " (en curso)"}
                      </div>

                      {/* Reason */}
                      {record.reason && (
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <span className="font-medium">{record.reason}</span>
                        </div>
                      )}

                      {/* Notes */}
                      {record.notes && (
                        <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                          {record.notes}
                        </div>
                      )}

                      {/* User and Work Order */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{record.user.name}</span>
                        </div>
                        {record.workOrder && (
                          <div className="flex items-center gap-1">
                            <LinkIcon className="h-3 w-3" />
                            <span>OT: {record.workOrder.number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

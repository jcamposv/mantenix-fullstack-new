"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, DollarSign } from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface WorkOrderScheduleInfoProps {
  workOrder: WorkOrderWithRelations
}

export function WorkOrderScheduleInfo({ workOrder }: WorkOrderScheduleInfoProps) {
  const hasScheduleInfo =
    workOrder.scheduledDate ||
    workOrder.estimatedDuration ||
    workOrder.estimatedCost

  if (!hasScheduleInfo) return null

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Programación y Estimaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {workOrder.scheduledDate && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Fecha Programada</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(workOrder.scheduledDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {workOrder.estimatedDuration && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Duración Estimada</p>
                <p className="text-sm text-muted-foreground">
                  {workOrder.estimatedDuration} horas
                </p>
              </div>
            </div>
          )}

          {workOrder.estimatedCost && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Costo Estimado</p>
                <p className="text-sm text-muted-foreground">
                  ${workOrder.estimatedCost}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

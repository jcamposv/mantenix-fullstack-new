"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Wrench } from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface WorkOrderBasicInfoProps {
  workOrder: WorkOrderWithRelations
}

export function WorkOrderBasicInfo({ workOrder }: WorkOrderBasicInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Básica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Descripción</label>
          <p className="text-sm text-muted-foreground mt-1">
            {workOrder.description || "Sin descripción"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Sede</p>
              <p className="text-sm text-muted-foreground">
                {workOrder.site?.name || "N/A"}
              </p>
            </div>
          </div>

          {workOrder.asset && (
            <div className="flex items-center gap-2">
              <Wrench className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Activo</p>
                <p className="text-sm text-muted-foreground">
                  {workOrder.asset.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Código: {workOrder.asset.code}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface WorkOrderTemplateInfoProps {
  workOrder: WorkOrderWithRelations
}

export function WorkOrderTemplateInfo({ workOrder }: WorkOrderTemplateInfoProps) {
  if (!workOrder.template) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Template Utilizado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium">Nombre del Template</label>
            <p className="text-sm text-muted-foreground">{workOrder.template.name}</p>
          </div>
          {workOrder.template.category && (
            <div>
              <label className="text-sm font-medium">Categoría</label>
              <Badge variant="outline" className="ml-2">
                {workOrder.template.category}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

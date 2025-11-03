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
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg font-semibold">Template Utilizado</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nombre del Template</label>
            <p className="text-sm font-medium">{workOrder.template.name}</p>
          </div>
          {workOrder.template.category && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Categoría</label>
              <div>
                <Badge variant="outline" className="mt-1">
                  {workOrder.template.category}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

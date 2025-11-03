"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface WorkOrderToolsMaterialsProps {
  workOrder: WorkOrderWithRelations
}

export function WorkOrderToolsMaterials({ workOrder }: WorkOrderToolsMaterialsProps) {
  const hasTools = workOrder.tools && workOrder.tools.length > 0
  const hasMaterials = workOrder.materials && workOrder.materials.length > 0

  if (!hasTools && !hasMaterials) return null

  return (
    <Card>
      <CardHeader className="pb-4 border-b">
        <CardTitle className="text-lg font-semibold">Herramientas y Materiales</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hasTools && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Herramientas Requeridas</h4>
              <div className="space-y-1.5">
                {workOrder.tools!.map((tool, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span>{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasMaterials && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Materiales Necesarios</h4>
              <div className="space-y-1.5">
                {workOrder.materials!.map((material, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span>{material}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

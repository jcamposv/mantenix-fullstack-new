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
      <CardHeader>
        <CardTitle>Herramientas y Materiales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {hasTools && (
            <div>
              <h4 className="text-sm font-medium mb-2">Herramientas Requeridas</h4>
              <div className="space-y-1">
                {workOrder.tools!.map((tool, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {tool}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasMaterials && (
            <div>
              <h4 className="text-sm font-medium mb-2">Materiales Necesarios</h4>
              <div className="space-y-1">
                {workOrder.materials!.map((material, index) => (
                  <div key={index} className="text-sm text-muted-foreground">
                    • {material}
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

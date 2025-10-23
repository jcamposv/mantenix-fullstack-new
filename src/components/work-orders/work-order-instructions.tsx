"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Shield } from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface WorkOrderInstructionsProps {
  workOrder: WorkOrderWithRelations
}

export function WorkOrderInstructions({ workOrder }: WorkOrderInstructionsProps) {
  if (!workOrder.instructions && !workOrder.safetyNotes) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Instrucciones y Seguridad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {workOrder.instructions && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Instrucciones de Trabajo</label>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {workOrder.instructions}
            </p>
          </div>
        )}

        {workOrder.safetyNotes && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <label className="text-sm font-medium">Notas de Seguridad</label>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {workOrder.safetyNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

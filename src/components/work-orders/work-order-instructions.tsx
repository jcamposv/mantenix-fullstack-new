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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Instrucciones y Seguridad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {workOrder.instructions && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <label className="text-sm font-medium">Instrucciones</label>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {workOrder.instructions}
            </p>
          </div>
        )}

        {workOrder.safetyNotes && (
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <label className="text-sm font-medium">Seguridad</label>
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

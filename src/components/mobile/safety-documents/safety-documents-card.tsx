/**
 * Safety Documents Card - Mobile View
 * Displays safety documents (Work Permits, LOTO, JSA, RCA) for ISO compliance
 * Allows technicians to review required safety documentation before starting work
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ChevronDown, ChevronUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { WorkPermitCard } from "./work-permit-card"
import { LOTOProcedureCard } from "./loto-procedure-card"
import { JSACard } from "./jsa-card"
import type { WorkOrderWithRelations } from "@/types/work-order.types"
import { cn } from "@/lib/utils"

interface SafetyDocumentsCardProps {
  workOrder: WorkOrderWithRelations
  onConfirmClick?: () => void
  onRefresh?: () => void
}

export function SafetyDocumentsCard({ workOrder, onConfirmClick, onRefresh }: SafetyDocumentsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasWorkPermits = workOrder.workPermits && workOrder.workPermits.length > 0
  const hasLOTO = workOrder.lotoProcedures && workOrder.lotoProcedures.length > 0
  const hasJSA = workOrder.jobSafetyAnalyses && workOrder.jobSafetyAnalyses.length > 0

  const hasSafetyDocs = hasWorkPermits || hasLOTO || hasJSA

  // Don't show card if no safety documents
  if (!hasSafetyDocs) {
    return null
  }

  const docCount =
    (workOrder.workPermits?.length || 0) +
    (workOrder.lotoProcedures?.length || 0) +
    (workOrder.jobSafetyAnalyses?.length || 0)

  return (
    <Card className={cn(
      "border-amber-200 bg-amber-50/50",
      isExpanded && "ring-2 ring-amber-300/50"
    )}>
      <CardHeader
        className="cursor-pointer select-none active:bg-amber-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className={cn(
              "h-5 w-5",
              isExpanded ? "text-amber-600" : "text-amber-500"
            )} />
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                Documentos de Seguridad
                <Badge variant="secondary" className="text-xs">
                  {docCount}
                </Badge>
              </CardTitle>
              {!isExpanded && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Revisar antes de comenzar
                </p>
              )}
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-3">
          {/* ISO Compliance Note */}
          <div className="flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-900">
              <strong>ISO 45001:</strong> Revise estos documentos antes de iniciar el trabajo.
              Contienen información crítica sobre peligros, controles y procedimientos de seguridad.
            </p>
          </div>

          {/* Work Permits */}
          {hasWorkPermits && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Permisos de Trabajo
              </h4>
              {workOrder.workPermits!.map((permit) => (
                <WorkPermitCard key={permit.id} permit={permit} />
              ))}
            </div>
          )}

          {/* LOTO Procedures */}
          {hasLOTO && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Procedimientos LOTO
              </h4>
              {workOrder.lotoProcedures!.map((procedure) => (
                <LOTOProcedureCard
                  key={procedure.id}
                  procedure={procedure}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )}

          {/* Job Safety Analyses */}
          {hasJSA && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">
                Análisis de Seguridad (JSA)
              </h4>
              {workOrder.jobSafetyAnalyses!.map((jsa) => (
                <JSACard key={jsa.id} jsa={jsa} />
              ))}
            </div>
          )}

          {/* Confirmation Button */}
          {onConfirmClick && (
            <div className="pt-3">
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  onConfirmClick()
                }}
                className="w-full"
                variant="default"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirmar Revisión de Documentos
              </Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

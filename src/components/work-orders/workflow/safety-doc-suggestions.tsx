/**
 * Safety Document Suggestions Component
 *
 * Analyzes work order characteristics and suggests required safety documents.
 * Shows alerts for missing critical safety documentation.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Type-safe
 * - Under 200 lines
 */

"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, Lock, HardHat, AlertTriangle, Search } from "lucide-react"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface SafetyDocSuggestionsProps {
  workOrder: WorkOrderWithRelations
}

interface Suggestion {
  type: "WORK_PERMIT" | "LOTO" | "JSA" | "RCA"
  title: string
  reason: string
  icon: typeof ShieldAlert
  createUrl: string
  priority: "critical" | "recommended" | "optional"
}

export function SafetyDocSuggestions({ workOrder }: SafetyDocSuggestionsProps) {
  const router = useRouter()
  const suggestions: Suggestion[] = []

  // Check if work order already has these documents
  const hasWorkPermit = workOrder.workPermits && workOrder.workPermits.length > 0
  const hasLOTO = workOrder.lotoProcedures && workOrder.lotoProcedures.length > 0
  const hasJSA = workOrder.jobSafetyAnalyses && workOrder.jobSafetyAnalyses.length > 0
  const hasRCA = workOrder.rootCauseAnalyses && workOrder.rootCauseAnalyses.length > 0

  // Determine asset criticality
  const assetCriticality = workOrder.asset?.status // Note: Using status as proxy, should be criticality field
  const isCompleted = workOrder.status === "COMPLETED"

  // Work Permit suggestions
  if (!hasWorkPermit) {
    // Urgent or high priority work always needs permit
    if (workOrder.priority === "URGENT" || workOrder.priority === "HIGH") {
      suggestions.push({
        type: "WORK_PERMIT",
        title: "Permiso de Trabajo",
        reason: `Requerido para trabajos de prioridad ${workOrder.priority}`,
        icon: ShieldAlert,
        createUrl: `/safety/work-permits/new?workOrderId=${workOrder.id}`,
        priority: "critical"
      })
    }
    // Certain types always need permits
    else if (workOrder.type === "CORRECTIVO" && workOrder.priority !== "LOW") {
      suggestions.push({
        type: "WORK_PERMIT",
        title: "Permiso de Trabajo",
        reason: "Recomendado para trabajos correctivos",
        icon: ShieldAlert,
        createUrl: `/safety/work-permits/new?workOrderId=${workOrder.id}`,
        priority: "recommended"
      })
    }
  }

  // LOTO suggestions
  if (!hasLOTO) {
    // High energy systems or critical assets need LOTO
    if (workOrder.priority === "URGENT" || assetCriticality === "A") {
      suggestions.push({
        type: "LOTO",
        title: "Procedimiento LOTO",
        reason: "Requerido para sistemas críticos o de alta energía",
        icon: Lock,
        createUrl: `/safety/loto-procedures/new?workOrderId=${workOrder.id}`,
        priority: "critical"
      })
    }
    // Maintenance on energized equipment
    else if (workOrder.type === "PREVENTIVO" && workOrder.priority === "HIGH") {
      suggestions.push({
        type: "LOTO",
        title: "Procedimiento LOTO",
        reason: "Recomendado para mantenimiento preventivo prioritario",
        icon: Lock,
        createUrl: `/safety/loto-procedures/new?workOrderId=${workOrder.id}`,
        priority: "recommended"
      })
    }
  }

  // JSA suggestions
  if (!hasJSA) {
    // All non-routine work should have JSA
    if (workOrder.type === "CORRECTIVO" || workOrder.priority === "URGENT") {
      suggestions.push({
        type: "JSA",
        title: "Análisis de Seguridad del Trabajo",
        reason: "Requerido para identificar y mitigar riesgos laborales",
        icon: HardHat,
        createUrl: `/safety/job-safety-analyses/new?workOrderId=${workOrder.id}`,
        priority: "critical"
      })
    }
    // Recommended for all other work
    else if (!hasJSA) {
      suggestions.push({
        type: "JSA",
        title: "Análisis de Seguridad del Trabajo",
        reason: "Recomendado para todos los trabajos de mantenimiento",
        icon: HardHat,
        createUrl: `/safety/job-safety-analyses/new?workOrderId=${workOrder.id}`,
        priority: "optional"
      })
    }
  }

  // RCA suggestions - especially important when completing corrective work
  if (!hasRCA && workOrder.type === "CORRECTIVO") {
    if (isCompleted) {
      // Critical: work order is completed but no RCA documented
      suggestions.push({
        type: "RCA",
        title: "Análisis de Causa Raíz",
        reason: "Requerido para documentar la causa del fallo y prevenir recurrencia",
        icon: Search,
        createUrl: `/quality/root-cause-analyses/new?workOrderId=${workOrder.id}`,
        priority: "critical"
      })
    } else {
      // Recommended: work order in progress
      suggestions.push({
        type: "RCA",
        title: "Análisis de Causa Raíz",
        reason: "Recomendado para trabajos correctivos - documente la causa del fallo",
        icon: Search,
        createUrl: `/quality/root-cause-analyses/new?workOrderId=${workOrder.id}`,
        priority: "recommended"
      })
    }
  }

  // Don't show if no suggestions
  if (suggestions.length === 0) {
    return null
  }

  // Separate by priority
  const criticalSuggestions = suggestions.filter(s => s.priority === "critical")
  const recommendedSuggestions = suggestions.filter(s => s.priority === "recommended")
  const optionalSuggestions = suggestions.filter(s => s.priority === "optional")

  return (
    <div className="space-y-4">
      {/* Critical Safety Documents Alert */}
      {criticalSuggestions.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Documentos de Seguridad Requeridos:</strong> Esta orden de trabajo requiere documentación de seguridad antes de comenzar.
          </AlertDescription>
        </Alert>
      )}

      {/* Suggestions Card */}
      <Card className="shadow-none border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            Documentos de Seguridad Sugeridos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Critical */}
          {criticalSuggestions.map((suggestion) => (
            <div
              key={suggestion.type}
              className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800"
            >
              <suggestion.icon className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-medium text-sm text-red-900 dark:text-red-100">
                    {suggestion.title} <span className="text-xs text-red-600">(Requerido)</span>
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">{suggestion.reason}</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => router.push(suggestion.createUrl)}
                  className="h-8"
                >
                  Crear Ahora
                </Button>
              </div>
            </div>
          ))}

          {/* Recommended */}
          {recommendedSuggestions.map((suggestion) => (
            <div
              key={suggestion.type}
              className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50"
            >
              <suggestion.icon className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-medium text-sm">
                    {suggestion.title} <span className="text-xs text-muted-foreground">(Recomendado)</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(suggestion.createUrl)}
                  className="h-8"
                >
                  Crear
                </Button>
              </div>
            </div>
          ))}

          {/* Optional */}
          {optionalSuggestions.map((suggestion) => (
            <div
              key={suggestion.type}
              className="flex items-start gap-3 p-3 rounded-lg border-dashed border bg-muted/30"
            >
              <suggestion.icon className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    {suggestion.title} <span className="text-xs">(Opcional)</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{suggestion.reason}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push(suggestion.createUrl)}
                  className="h-8"
                >
                  Crear
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

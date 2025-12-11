/**
 * JSA Card - Mobile View
 * Displays Job Safety Analysis with job steps
 */

"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, HardHat, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface JSACardProps {
  jsa: {
    id: string
    status: string
    preparer: {
      id: string
      name: string
    } | null
    jobSteps: unknown[]
  }
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
  PENDING_APPROVAL: "bg-orange-100 text-orange-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800"
}

const statusLabels: Record<string, string> = {
  DRAFT: "Borrador",
  PENDING_REVIEW: "Pendiente Revisión",
  PENDING_APPROVAL: "Pendiente Aprobación",
  APPROVED: "Aprobado",
  REJECTED: "Rechazado"
}

export function JSACard({ jsa }: JSACardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const stepsCount = Array.isArray(jsa.jobSteps) ? jsa.jobSteps.length : 0

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div
        className="p-3 cursor-pointer select-none active:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <HardHat className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                Análisis de Seguridad (JSA)
              </p>
              <p className="text-xs text-muted-foreground">
                {stepsCount} {stepsCount === 1 ? "paso" : "pasos"} de trabajo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className={cn("text-xs", statusColors[jsa.status])}
            >
              {statusLabels[jsa.status] || jsa.status}
            </Badge>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-3 border-t pt-3">
          {/* Preparer */}
          {jsa.preparer && (
            <div className="p-2 rounded bg-muted/50">
              <p className="text-xs font-medium text-foreground">Preparado por</p>
              <p className="text-xs text-muted-foreground">{jsa.preparer.name}</p>
            </div>
          )}

          {/* Job Steps */}
          {stepsCount > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">
                Pasos del Trabajo
              </p>
              <div className="space-y-2">
                {(jsa.jobSteps as Array<{ step: number; description: string }>).slice(0, 3).map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <CheckCircle className="h-3.5 w-3.5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-foreground">
                        <span className="font-medium">Paso {step.step}:</span> {step.description}
                      </p>
                    </div>
                  </div>
                ))}
                {stepsCount > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{stepsCount - 3} pasos más
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Approval Status */}
          {jsa.status === "APPROVED" && (
            <div className="p-2 rounded bg-green-50 border border-green-200">
              <p className="text-xs text-green-900 font-medium text-center">
                ✓ JSA Aprobado - Seguir procedimientos documentados
              </p>
            </div>
          )}

          {/* Note */}
          <div className="mt-3 p-2 rounded bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              Ver peligros y controles en la versión web
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

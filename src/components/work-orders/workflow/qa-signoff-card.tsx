/**
 * QA Sign-off Card Component
 *
 * Displays QA sign-off interface for work orders requiring quality inspection.
 * Shows approve/reject buttons for PENDING_QA work orders.
 *
 * Following Next.js Expert standards:
 * - Client component for interactivity
 * - Type-safe
 * - Under 200 lines
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, ClipboardCheck, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { WorkOrderStatus as PrismaWorkOrderStatus } from "@prisma/client"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface QASignOffCardProps {
  workOrder: WorkOrderWithRelations
  onSuccess?: () => void
}

export function QASignOffCard({ workOrder, onSuccess }: QASignOffCardProps) {
  const [comments, setComments] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only show for PENDING_QA status
  if ((workOrder.status as PrismaWorkOrderStatus) !== "PENDING_QA") {
    return null
  }

  const handleAction = async (action: "APPROVE" | "REJECT") => {
    if (action === "REJECT" && !comments.trim()) {
      toast.error("Debe proporcionar comentarios al rechazar")
      return
    }

    setIsSubmitting(true)
    try {
      const endpoint =
        action === "APPROVE"
          ? `/api/work-orders/${workOrder.id}/qa-approve`
          : `/api/work-orders/${workOrder.id}/qa-reject`

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments: comments.trim() || undefined })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Error al procesar la acción")
      }

      toast.success(
        action === "APPROVE"
          ? "Orden de trabajo aprobada por QA exitosamente"
          : "Orden de trabajo rechazada - requiere correcciones"
      )

      setComments("")
      onSuccess?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al procesar")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Warning Alert */}
      <Alert variant="default" className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription>
          <strong>Inspección de Calidad Requerida:</strong> Esta orden de trabajo ha sido completada y requiere QA sign-off antes de cerrarla definitivamente.
        </AlertDescription>
      </Alert>

      {/* QA Sign-off Card */}
      <Card className="shadow-none border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Control de Calidad (QA Sign-off)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Work Order Summary */}
          <div className="p-3 rounded-lg border bg-muted/50">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium">Orden: {workOrder.number}</p>
                  <p className="text-sm text-muted-foreground">{workOrder.title}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                  Pendiente QA
                </span>
              </div>
              {workOrder.completionNotes && (
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notas de finalización:</p>
                  <p className="text-sm">{workOrder.completionNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* QA Comments */}
          <div className="space-y-2">
            <Label htmlFor="qa-comments">
              Comentarios de Inspección {" "}
              <span className="text-xs text-muted-foreground">
                (Opcional al aprobar, requerido al rechazar)
              </span>
            </Label>
            <Textarea
              id="qa-comments"
              placeholder="Documente los hallazgos de la inspección de calidad..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Incluya detalles sobre cumplimiento de estándares, calidad del trabajo, seguridad, etc.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleAction("APPROVE")}
              disabled={isSubmitting}
              className="flex-1"
              variant="default"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Aprobar QA
            </Button>
            <Button
              onClick={() => handleAction("REJECT")}
              disabled={isSubmitting}
              className="flex-1"
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Rechazar (Requiere Correcciones)
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Al aprobar, la orden se marcará como <strong>COMPLETADA</strong>.
            Al rechazar, volverá a <strong>EN PROGRESO</strong> para correcciones.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

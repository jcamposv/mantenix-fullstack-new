/**
 * Safety Briefing Dialog
 * Mobile-first dialog for confirming safety document review with digital signature
 * ISO 45001 compliance - Audit trail for safety document confirmation
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { AlertCircle, CheckCircle2, Loader2, Shield, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { WorkOrderWithRelations } from "@/types/work-order.types"

interface SafetyBriefingDialogProps {
  workOrder: WorkOrderWithRelations
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function SafetyBriefingDialog({
  workOrder,
  open,
  onOpenChange,
  onSuccess
}: SafetyBriefingDialogProps) {
  const { data: session } = useSession()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [confirmations, setConfirmations] = useState({
    workPermits: false,
    loto: false,
    jsa: false
  })

  // Check which safety documents exist
  const hasWorkPermits = workOrder.workPermits && workOrder.workPermits.length > 0
  const hasLOTO = workOrder.lotoProcedures && workOrder.lotoProcedures.length > 0
  const hasJSA = workOrder.jobSafetyAnalyses && workOrder.jobSafetyAnalyses.length > 0

  const hasSafetyDocs = hasWorkPermits || hasLOTO || hasJSA

  // Canvas drawing setup
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * 2 // Retina display support
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // Configure drawing style
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000'
  }, [open])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
  }

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error("Debe iniciar sesión")
      return
    }

    // Validate at least one confirmation
    if (!confirmations.workPermits && !confirmations.loto && !confirmations.jsa) {
      toast.error("Debe confirmar al menos un documento de seguridad")
      return
    }

    // Get signature as base64
    const canvas = canvasRef.current
    let signatureData: string | undefined

    if (canvas && hasSignature) {
      signatureData = canvas.toDataURL('image/png')
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/safety-briefings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workOrderId: workOrder.id,
          userId: session.user.id,
          confirmedWorkPermits: confirmations.workPermits,
          confirmedLOTO: confirmations.loto,
          confirmedJSA: confirmations.jsa,
          signature: signatureData
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar confirmación')
      }

      toast.success("Confirmación de seguridad guardada")
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving safety briefing:', error)
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hasSafetyDocs) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Confirmación de Seguridad
          </DialogTitle>
          <DialogDescription>
            Confirme que ha leído y comprendido los documentos de seguridad requeridos para este trabajo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* ISO Compliance Notice */}
          <div className="flex gap-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-900">
              <strong>ISO 45001:</strong> Esta confirmación es requerida antes de iniciar el trabajo. Su firma digital será registrada para auditoría.
            </p>
          </div>

          {/* Document Confirmations */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Documentos Revisados:</p>

            {hasWorkPermits && (
              <div className="flex items-start gap-3 p-2 rounded border">
                <Checkbox
                  id="confirm-permits"
                  checked={confirmations.workPermits}
                  onCheckedChange={(checked) =>
                    setConfirmations(prev => ({ ...prev, workPermits: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="confirm-permits"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Permisos de Trabajo ({workOrder.workPermits?.length || 0})
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    He leído y comprendido los permisos de trabajo
                  </p>
                </div>
                {confirmations.workPermits && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
              </div>
            )}

            {hasLOTO && (
              <div className="flex items-start gap-3 p-2 rounded border">
                <Checkbox
                  id="confirm-loto"
                  checked={confirmations.loto}
                  onCheckedChange={(checked) =>
                    setConfirmations(prev => ({ ...prev, loto: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="confirm-loto"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Procedimientos LOTO ({workOrder.lotoProcedures?.length || 0})
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    He leído y comprendido los procedimientos de bloqueo
                  </p>
                </div>
                {confirmations.loto && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
              </div>
            )}

            {hasJSA && (
              <div className="flex items-start gap-3 p-2 rounded border">
                <Checkbox
                  id="confirm-jsa"
                  checked={confirmations.jsa}
                  onCheckedChange={(checked) =>
                    setConfirmations(prev => ({ ...prev, jsa: checked as boolean }))
                  }
                />
                <div className="flex-1">
                  <Label
                    htmlFor="confirm-jsa"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Análisis de Seguridad (JSA) ({workOrder.jobSafetyAnalyses?.length || 0})
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    He leído y comprendido el análisis de seguridad
                  </p>
                </div>
                {confirmations.jsa && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Signature Pad */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Firma Digital (Opcional)</Label>
              {hasSignature && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSignature}
                  className="h-7 text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Limpiar
                </Button>
              )}
            </div>
            <div className="border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                className={cn(
                  "w-full touch-none cursor-crosshair",
                  "h-32"
                )}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Dibuje su firma en el recuadro superior
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (!confirmations.workPermits && !confirmations.loto && !confirmations.jsa)}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

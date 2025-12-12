/**
 * Pause Reason Dialog Component
 *
 * Dialog for selecting pause reason and adding notes
 */

"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { PauseReason } from "@prisma/client"

interface PauseReasonDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: PauseReason, notes?: string) => void
  isLoading?: boolean
}

const PAUSE_REASONS: Array<{ value: PauseReason; label: string }> = [
  { value: "WAITING_PARTS", label: "Esperando Repuestos" },
  { value: "WAITING_APPROVAL", label: "Esperando Aprobación" },
  { value: "LUNCH_BREAK", label: "Hora de Almuerzo" },
  { value: "OTHER_PRIORITY", label: "Otra Prioridad" },
  { value: "TECHNICAL_ISSUE", label: "Problema Técnico" },
  { value: "TRAVEL", label: "Viaje/Traslado" },
  { value: "OTHER", label: "Otro" },
]

export function PauseReasonDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: PauseReasonDialogProps) {
  const [reason, setReason] = useState<PauseReason | undefined>()
  const [notes, setNotes] = useState("")

  const handleConfirm = () => {
    if (!reason) return
    onConfirm(reason, notes || undefined)
    // Reset form
    setReason(undefined)
    setNotes("")
  }

  const handleCancel = () => {
    onOpenChange(false)
    // Reset form
    setReason(undefined)
    setNotes("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pausar Trabajo</DialogTitle>
          <DialogDescription>
            Selecciona la razón por la que pausas el trabajo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Razón de la Pausa *</Label>
            <Select
              value={reason}
              onValueChange={(value) => setReason(value as PauseReason)}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Selecciona una razón" />
              </SelectTrigger>
              <SelectContent>
                {PAUSE_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Agrega notas adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {notes.length}/500
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!reason || isLoading}>
            {isLoading ? "Pausando..." : "Pausar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
